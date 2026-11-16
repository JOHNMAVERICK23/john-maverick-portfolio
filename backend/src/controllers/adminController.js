const pool = require('../config/db');
const { crud, singleton, fail, toBool, paging } = require('./factory');
const { toUrl, removeFile } = require('../services/files');
const { logActivity } = require('../services/activity');

// ---------- Projects ----------
const slugify = (s) => s.toLowerCase().normalize('NFKD')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'project';

const uniqueSlug = async (title) => {
  const base = slugify(title);
  let slug = base;
  for (let i = 2; (await pool.query('SELECT 1 FROM projects WHERE slug = $1', [slug])).rowCount; i++) {
    slug = `${base}-${i}`;
  }
  return slug;
};

exports.projects = crud({
  table: 'projects', entity: 'project', label: 'title',
  columns: ['title', 'description', 'technologies', 'category', 'github_url',
    'live_url', 'status', 'is_featured', 'is_published', 'sort_order'],
  required: ['title'],
  arrays: ['technologies'],
  bools: ['is_featured', 'is_published'],
  ints: ['sort_order'],
  urls: ['github_url', 'live_url'],
  files: { thumbnail: 'thumbnail' },
  search: ['title', 'category'],
  select: `t.*, COALESCE((SELECT json_agg(json_build_object('id', i.id, 'image_url', i.image_url)
    ORDER BY i.sort_order, i.id) FROM project_images i WHERE i.project_id = t.id), '[]') AS images`,
  order: 't.sort_order, t.created_at DESC',
  beforeCreate: async (data) => { data.slug = await uniqueSlug(data.title); },
  afterSave: async (req, id) => {
    for (const f of req.files?.images || []) {
      await pool.query(
        'INSERT INTO project_images (project_id, image_url) VALUES ($1, $2)', [id, toUrl(f)]);
    }
  },
  onRemove: async (old) => old.images.forEach((i) => removeFile(i.image_url)),
});

exports.removeProjectImage = async (req, res) => {
  const { rows } = await pool.query(
    'DELETE FROM project_images WHERE id = $1 AND project_id = $2 RETURNING image_url',
    [req.params.imageId, req.params.id]);
  if (!rows[0]) throw fail(404, 'Image not found');
  removeFile(rows[0].image_url);
  res.json({ message: 'Image deleted' });
};

// ---------- Skills ----------
exports.skills = crud({
  table: 'skills', entity: 'skill', label: 'name',
  columns: ['category_id', 'name', 'proficiency', 'is_featured', 'sort_order'],
  required: ['name'],
  ints: ['category_id', 'proficiency', 'sort_order'],
  bools: ['is_featured'],
  files: { icon: 'icon' },
  search: ['name'],
});

exports.skillCategories = crud({
  table: 'skill_categories', entity: 'skill category', label: 'name',
  columns: ['name', 'sort_order'],
  required: ['name'], ints: ['sort_order'], search: ['name'],
});

// ---------- Experience, Certificates, Education, Social ----------
exports.experiences = crud({
  table: 'experiences', entity: 'experience', label: 'company',
  columns: ['company', 'position', 'employment_type', 'start_date', 'end_date',
    'is_current', 'responsibilities', 'technologies', 'sort_order'],
  required: ['company', 'position', 'start_date'],
  arrays: ['responsibilities', 'technologies'],
  bools: ['is_current'], ints: ['sort_order'],
  search: ['company', 'position'],
  order: 't.sort_order, t.start_date DESC',
});

exports.certificates = crud({
  table: 'certificates', entity: 'certificate', label: 'title',
  columns: ['title', 'issuer', 'issue_date', 'description', 'credential_url',
    'is_published', 'sort_order'],
  required: ['title', 'issuer'],
  bools: ['is_published'], ints: ['sort_order'], urls: ['credential_url'],
  files: { file: 'file_url' },
  search: ['title', 'issuer'],
  order: 't.sort_order, t.issue_date DESC NULLS LAST',
});

exports.education = crud({
  table: 'education', entity: 'education', label: 'school_name',
  columns: ['school_name', 'degree', 'year_started', 'year_completed',
    'description', 'sort_order'],
  required: ['school_name', 'degree'],
  ints: ['year_started', 'year_completed', 'sort_order'],
  search: ['school_name', 'degree'],
  order: 't.sort_order, t.year_started DESC NULLS LAST',
});

exports.socialLinks = crud({
  table: 'social_links', entity: 'social link', label: 'platform',
  columns: ['platform', 'url', 'sort_order', 'is_visible'],
  required: ['platform', 'url'],
  bools: ['is_visible'], ints: ['sort_order'], urls: ['url'],
});

// ---------- Profile and Settings (single row) ----------
exports.profile = singleton({
  table: 'profiles', entity: 'profile',
  columns: ['full_name', 'title', 'introduction', 'hero_description', 'biography',
    'career_goals', 'email', 'phone', 'location'],
  required: ['full_name'],
  files: { profile_image: 'profile_image', resume: 'resume_file' },
  transforms: {
    email: (v) => {
      if (v && !/^\S+@\S+\.\S+$/.test(v)) throw fail(422, 'email is invalid');
      return v;
    },
  },
});

const SECTIONS = ['about', 'skills', 'projects', 'experience', 'certificates', 'education', 'contact'];

exports.settings = singleton({
  table: 'website_settings', entity: 'settings',
  columns: ['site_title', 'seo_title', 'seo_description', 'sections'],
  json: ['sections'],
  merge: ['sections'],
  files: { logo: 'logo_url', favicon: 'favicon_url' },
  transforms: {
    sections: (v) => {
      let obj = v;
      if (typeof v === 'string') {
        try { obj = JSON.parse(v); } catch { throw fail(422, 'sections must be valid JSON'); }
      }
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
        throw fail(422, 'sections must be an object');
      }
      const out = {};
      for (const k of SECTIONS) if (k in obj) out[k] = obj[k] === true || obj[k] === 'true';
      return JSON.stringify(out);
    },
  },
});

// ---------- Contact messages ----------
exports.messages = {
  list: async (req, res) => {
    const { page, limit, offset } = paging(req);
    const where = [];
    const params = [];
    const q = String(req.query.q || '').trim();
    if (q) {
      params.push(`%${q}%`);
      const n = params.length;
      where.push(`(name ILIKE $${n} OR email ILIKE $${n} OR subject ILIKE $${n} OR message ILIKE $${n})`);
    }
    if (['true', 'false'].includes(req.query.read)) {
      params.push(req.query.read === 'true');
      where.push(`is_read = $${params.length}`);
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = Number((await pool.query(
      `SELECT COUNT(*) FROM contact_messages ${clause}`, params)).rows[0].count);
    const { rows } = await pool.query(
      `SELECT * FROM contact_messages ${clause}
       ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`, params);
    res.json({ data: rows, total, page, limit });
  },

  get: async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM contact_messages WHERE id = $1', [req.params.id]);
    if (!rows[0]) throw fail(404, 'Message not found');
    res.json(rows[0]);
  },

  setRead: async (req, res) => {
    if (!req.body || !('is_read' in req.body)) throw fail(422, 'is_read is required');
    const { rows } = await pool.query(
      'UPDATE contact_messages SET is_read = $1 WHERE id = $2 RETURNING *',
      [toBool(req.body.is_read), req.params.id]);
    if (!rows[0]) throw fail(404, 'Message not found');
    res.json(rows[0]);
  },

  remove: async (req, res) => {
    const { rows } = await pool.query(
      'DELETE FROM contact_messages WHERE id = $1 RETURNING id, name', [req.params.id]);
    if (!rows[0]) throw fail(404, 'Message not found');
    logActivity(req.admin.id, 'delete', 'message', rows[0].id, `Deleted message from ${rows[0].name}`);
    res.json({ message: 'Deleted' });
  },
};

// ---------- Dashboard ----------
exports.dashboard = async (req, res) => {
  const [counts, messages, activities] = await Promise.all([
    pool.query(`SELECT
      (SELECT COUNT(*) FROM projects) AS projects,
      (SELECT COUNT(*) FROM certificates) AS certificates,
      (SELECT COUNT(*) FROM skills) AS skills,
      (SELECT COUNT(*) FROM experiences) AS experiences,
      (SELECT COUNT(*) FROM contact_messages) AS messages,
      (SELECT COUNT(*) FROM contact_messages WHERE NOT is_read) AS unread_messages`),
    pool.query(`SELECT id, name, email, subject, is_read, created_at
      FROM contact_messages ORDER BY created_at DESC LIMIT 5`),
    pool.query(`SELECT a.id, a.action, a.entity, a.description, a.created_at, ad.name AS admin_name
      FROM activity_logs a LEFT JOIN admins ad ON ad.id = a.admin_id
      ORDER BY a.created_at DESC LIMIT 10`),
  ]);
  res.json({
    counts: Object.fromEntries(Object.entries(counts.rows[0]).map(([k, v]) => [k, Number(v)])),
    recent_messages: messages.rows,
    recent_activities: activities.rows,
  });
};
