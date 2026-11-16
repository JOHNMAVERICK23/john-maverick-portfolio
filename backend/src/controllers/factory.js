const pool = require('../config/db');
const { toUrl, removeFile, cleanupUploaded } = require('../services/files');
const { logActivity } = require('../services/activity');

const fail = (status, message) => Object.assign(new Error(message), { status });
const toBool = (v) => v === true || ['true', '1', 'on'].includes(String(v).toLowerCase());

const toArray = (v) => {
  if (Array.isArray(v)) return v.map((s) => String(s).trim()).filter(Boolean);
  if (typeof v !== 'string' || !v.trim()) return [];
  try {
    const parsed = JSON.parse(v);
    if (Array.isArray(parsed)) return toArray(parsed);
  } catch { /* not JSON, fall through */ }
  return v.split('\n').map((s) => s.trim()).filter(Boolean);
};

const paging = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
  return { page, limit, offset: (page - 1) * limit };
};

// Only whitelisted columns are ever read from the request.
const collect = (cfg, req) => {
  const body = req.body || {};
  const data = {};
  for (const col of cfg.columns) {
    if (!(col in body)) continue;
    let v = body[col];
    if (cfg.bools?.includes(col)) v = toBool(v);
    else if (cfg.arrays?.includes(col)) v = toArray(v);
    else if (cfg.ints?.includes(col)) {
      if (v === '' || v === null) v = null;
      else {
        v = Number(v);
        if (!Number.isInteger(v)) throw fail(422, `${col} must be a whole number`);
      }
    } else if (typeof v === 'string') {
      v = v.trim();
      if (v === '') v = null;
    } else if (v !== null && typeof v === 'object' && !cfg.json?.includes(col)) {
      throw fail(422, `${col} is invalid`);
    }
    if (cfg.urls?.includes(col) && v && !/^https?:\/\/\S+$/i.test(v)) {
      throw fail(422, `${col} must start with http:// or https://`);
    }
    if (cfg.transforms?.[col]) v = cfg.transforms[col](v);
    data[col] = v;
  }
  for (const [field, col] of Object.entries(cfg.files || {})) {
    const f = req.files?.[field]?.[0];
    if (f) data[col] = toUrl(f);
  }
  return data;
};

exports.crud = (cfg) => {
  const select = cfg.select || 't.*';
  const order = cfg.order || 't.sort_order, t.id';
  const label = (row) => row[cfg.label] || `#${row.id}`;
  const fetchOne = async (id) =>
    (await pool.query(`SELECT ${select} FROM ${cfg.table} t WHERE t.id = $1`, [id])).rows[0];

  return {
    list: async (req, res) => {
      const { page, limit, offset } = paging(req);
      const params = [];
      let where = '';
      const q = String(req.query.q || '').trim();
      if (q && cfg.search?.length) {
        params.push(`%${q}%`);
        where = 'WHERE ' + cfg.search.map((c) => `t.${c} ILIKE $1`).join(' OR ');
      }
      const total = Number((await pool.query(
        `SELECT COUNT(*) FROM ${cfg.table} t ${where}`, params)).rows[0].count);
      const { rows } = await pool.query(
        `SELECT ${select} FROM ${cfg.table} t ${where}
         ORDER BY ${order} LIMIT ${limit} OFFSET ${offset}`, params);
      res.json({ data: rows, total, page, limit });
    },

    getOne: async (req, res) => {
      const row = await fetchOne(req.params.id);
      if (!row) throw fail(404, 'Not found');
      res.json(row);
    },

    create: async (req, res) => {
      try {
        const data = collect(cfg, req);
        for (const r of cfg.required || []) {
          if (data[r] == null) throw fail(422, `${r} is required`);
        }
        if (cfg.beforeCreate) await cfg.beforeCreate(data);
        const cols = Object.keys(data);
        const { rows } = await pool.query(
          `INSERT INTO ${cfg.table} (${cols.join(', ')})
           VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`,
          cols.map((c) => data[c]));
        if (cfg.afterSave) await cfg.afterSave(req, rows[0].id);
        const row = await fetchOne(rows[0].id);
        logActivity(req.admin.id, 'create', cfg.entity, row.id, `Created ${cfg.entity} "${label(row)}"`);
        res.status(201).json(row);
      } catch (err) {
        cleanupUploaded(req);
        throw err;
      }
    },

    update: async (req, res) => {
      try {
        const old = await fetchOne(req.params.id);
        if (!old) throw fail(404, 'Not found');
        const data = collect(cfg, req);
        for (const r of cfg.required || []) {
          if (r in data && data[r] == null) throw fail(422, `${r} is required`);
        }
        const cols = Object.keys(data);
        if (cols.length) {
          await pool.query(
            `UPDATE ${cfg.table} SET ${cols.map((c, i) => `${c} = $${i + 1}`).join(', ')}
             WHERE id = $${cols.length + 1}`,
            [...cols.map((c) => data[c]), old.id]);
        }
        if (cfg.afterSave) await cfg.afterSave(req, old.id);
        Object.values(cfg.files || {}).forEach((col) => {
          if (data[col] && old[col]) removeFile(old[col]);
        });
        const row = await fetchOne(old.id);
        logActivity(req.admin.id, 'update', cfg.entity, row.id, `Updated ${cfg.entity} "${label(row)}"`);
        res.json(row);
      } catch (err) {
        cleanupUploaded(req);
        throw err;
      }
    },

    remove: async (req, res) => {
      const old = await fetchOne(req.params.id);
      if (!old) throw fail(404, 'Not found');
      if (cfg.onRemove) await cfg.onRemove(old);
      await pool.query(`DELETE FROM ${cfg.table} WHERE id = $1`, [old.id]);
      Object.values(cfg.files || {}).forEach((col) => removeFile(old[col]));
      logActivity(req.admin.id, 'delete', cfg.entity, old.id, `Deleted ${cfg.entity} "${label(old)}"`);
      res.json({ message: 'Deleted' });
    },

    reorder: async (req, res) => {
      const ids = req.body?.ids;
      if (!Array.isArray(ids) || !ids.length || !ids.every(Number.isInteger)) {
        throw fail(422, 'ids must be an array of numbers');
      }
      await pool.query(
        `UPDATE ${cfg.table} t SET sort_order = x.ord
         FROM unnest($1::int[]) WITH ORDINALITY AS x(id, ord) WHERE t.id = x.id`, [ids]);
      res.json({ message: 'Reordered' });
    },
  };
};

// For tables that only ever hold one row (profiles, website_settings)
exports.singleton = (cfg) => {
  const getRow = async () =>
    (await pool.query(`SELECT * FROM ${cfg.table} ORDER BY id LIMIT 1`)).rows[0];

  return {
    get: async (req, res) => {
      const row = await getRow();
      if (!row) throw fail(404, 'Not found. Run npm run seed');
      res.json(row);
    },
    update: async (req, res) => {
      try {
        const old = await getRow();
        if (!old) throw fail(404, 'Not found. Run npm run seed');
        const data = collect(cfg, req);
        for (const r of cfg.required || []) {
          if (r in data && data[r] == null) throw fail(422, `${r} is required`);
        }
        const cols = Object.keys(data);
        if (cols.length) {
          const sets = cols.map((c, i) => cfg.merge?.includes(c)
            ? `${c} = ${c} || $${i + 1}::jsonb` : `${c} = $${i + 1}`);
          await pool.query(
            `UPDATE ${cfg.table} SET ${sets.join(', ')} WHERE id = $${cols.length + 1}`,
            [...cols.map((c) => data[c]), old.id]);
        }
        Object.values(cfg.files || {}).forEach((col) => {
          if (data[col] && old[col]) removeFile(old[col]);
        });
        logActivity(req.admin.id, 'update', cfg.entity, old.id, `Updated ${cfg.entity}`);
        res.json(await getRow());
      } catch (err) {
        cleanupUploaded(req);
        throw err;
      }
    },
  };
};

exports.fail = fail;
exports.toBool = toBool;
exports.paging = paging;
