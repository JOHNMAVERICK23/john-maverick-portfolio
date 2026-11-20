const readline = require('readline');

const BASE = process.env.BASE_URL || 'http://localhost:5000';
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);
let cookie = '';
let passed = 0;
let failed = 0;
const created = [];

const check = (name, cond, info = '') => {
  if (cond) passed++; else failed++;
  console.log(`${cond ? '  ok  ' : '  FAIL'} ${name}${cond ? '' : ` ${info}`}`);
};
const section = (t) => console.log(`\n${t}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(method, path, { json, form, auth = true } = {}) {
  const headers = {};
  if (auth && cookie) headers.cookie = cookie;
  let body;
  if (json !== undefined) { headers['content-type'] = 'application/json'; body = JSON.stringify(json); }
  if (form) body = form;
  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body, redirect: 'manual' });
  } catch (e) {
    return { status: 0, data: e.message, res: null };
  }
  const text = await res.text();
  let data = text;
  try { data = JSON.parse(text); } catch { /* not JSON */ }
  return { status: res.status, data, res };
}

const ask = (q, hidden) => new Promise((resolve) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  let muted = false;
  rl._writeToOutput = (s) => {
    if (!muted) rl.output.write(s);
    else if (s.includes('\n')) rl.output.write('\n');
  };
  rl.question(q, (a) => { rl.close(); resolve(a.trim()); });
  muted = hidden;
});

async function removeCreated(path, id) {
  const r = await call('DELETE', `${path}/${id}`);
  const i = created.findIndex((c) => c.path === path && c.id === id);
  if (i >= 0) created.splice(i, 1);
  return r;
}

async function publicTests() {
  section('Public API');
  for (const p of ['health', 'profile', 'settings', 'projects', 'skills', 'experiences', 'certificates', 'education']) {
    const r = await call('GET', `/api/${p}`, { auth: false });
    check(`GET /api/${p}`, r.status === 200, `got ${r.status}`);
  }
  let r = await call('GET', '/api/projects/zz-does-not-exist', { auth: false });
  check('unknown project slug is 404', r.status === 404, `got ${r.status}`);
  r = await call('GET', '/api/nope', { auth: false });
  check('unknown API route is 404 JSON', r.status === 404 && typeof r.data === 'object', `got ${r.status}`);
  r = await call('GET', '/uploads/zz-missing.png', { auth: false });
  check('missing upload is 404', r.status === 404, `got ${r.status}`);
}

async function gateTests() {
  section('Admin routes reject requests without login');
  const gets = ['dashboard', 'profile', 'settings', 'projects', 'skills', 'skill-categories',
    'experiences', 'certificates', 'education', 'social-links', 'messages'];
  for (const p of gets) {
    const r = await call('GET', `/api/admin/${p}`, { auth: false });
    check(`GET /api/admin/${p} is 401`, r.status === 401, `got ${r.status}`);
  }
  const writes = [['POST', '/api/admin/projects'], ['PUT', '/api/admin/projects/1'],
    ['DELETE', '/api/admin/projects/1'], ['PUT', '/api/admin/settings'],
    ['PUT', '/api/admin/profile'], ['PATCH', '/api/admin/messages/1'],
    ['DELETE', '/api/admin/messages/1']];
  for (const [m, p] of writes) {
    const r = await call(m, p, { auth: false, json: {} });
    check(`${m} ${p} is 401`, r.status === 401, `got ${r.status}`);
  }
}

async function login() {
  section('Login');
  const email = process.env.ADMIN_EMAIL || (await ask('Admin email: ', false));
  const password = await ask('Admin password: ', true);
  let r = await call('POST', '/api/auth/login', { auth: false, json: { email, password: `${password}-wrong` } });
  check('wrong password is 401', r.status === 401, `got ${r.status}`);
  r = await call('POST', '/api/auth/login', { auth: false, json: { email, password } });
  check('correct login is 200', r.status === 200, `got ${r.status}`);
  if (r.status !== 200) return false;
  const raw = r.res.headers.getSetCookie
    ? r.res.headers.getSetCookie()
    : [r.res.headers.get('set-cookie') || ''];
  check('session cookie is HttpOnly', raw.some((c) => /httponly/i.test(c)));
  cookie = raw.map((c) => c.split(';')[0]).join('; ');
  r = await call('GET', '/api/auth/me');
  check('/auth/me returns the admin', r.status === 200 && Boolean(r.data.admin?.email), `got ${r.status}`);
  return true;
}

const RESOURCES = [
  { path: '/api/admin/skill-categories', create: { name: 'ZZ Test Category' }, update: { name: 'ZZ Test Category 2' }, field: 'name' },
  { path: '/api/admin/skills', create: { name: 'ZZ Test Skill', proficiency: 70 }, update: { proficiency: 80 }, field: 'proficiency' },
  { path: '/api/admin/experiences', create: { company: 'ZZ Co', position: 'Tester', start_date: '2024-01-15' }, update: { position: 'Senior Tester' }, field: 'position' },
  { path: '/api/admin/certificates', create: { title: 'ZZ Cert', issuer: 'ZZ Org' }, update: { title: 'ZZ Cert 2' }, field: 'title' },
  { path: '/api/admin/education', create: { school_name: 'ZZ School', degree: 'ZZ Degree' }, update: { degree: 'ZZ Degree 2' }, field: 'degree' },
  { path: '/api/admin/social-links', create: { platform: 'GitHub', url: 'https://github.com/zz-test' }, update: { platform: 'Website' }, field: 'platform' },
  { path: '/api/admin/projects', create: { title: 'ZZ Test Project' }, update: { title: 'ZZ Test Project 2' }, field: 'title' },
];

async function crudTests() {
  for (const t of RESOURCES) {
    section(`CRUD ${t.path.replace('/api/admin/', '')}`);
    let r = await call('POST', t.path, { json: {} });
    check('create without required fields is 422', r.status === 422, `got ${r.status}`);
    r = await call('POST', t.path, { json: t.create });
    check('create is 201', r.status === 201, `got ${r.status} ${JSON.stringify(r.data)}`);
    if (r.status !== 201) continue;
    const id = r.data.id;
    created.push({ path: t.path, id });
    r = await call('GET', t.path);
    check('list returns a total', r.status === 200 && r.data.total >= 1, `got ${r.status}`);
    r = await call('GET', `${t.path}/${id}`);
    check('get one is 200', r.status === 200, `got ${r.status}`);
    r = await call('PUT', `${t.path}/${id}`, { json: t.update });
    check('update is 200 and the value changed', r.status === 200 && r.data[t.field] === t.update[t.field], `got ${r.status}`);
    r = await call('GET', `${t.path}/abc`);
    check('non-numeric id is 400', r.status === 400, `got ${r.status}`);
    r = await call('GET', `${t.path}/999999`);
    check('missing id is 404', r.status === 404, `got ${r.status}`);
    r = await removeCreated(t.path, id);
    check('delete is 200', r.status === 200, `got ${r.status}`);
    r = await call('GET', `${t.path}/${id}`);
    check('deleted item is 404', r.status === 404, `got ${r.status}`);
  }
}

async function extraTests() {
  section('Validation and edge cases');
  let r = await call('POST', '/api/admin/skills', { json: { name: 'ZZ Bad', proficiency: 500 } });
  check('proficiency 500 is rejected (400)', r.status === 400, `got ${r.status}`);
  r = await call('POST', '/api/admin/certificates', { json: { title: 'ZZ', issuer: 'ZZ', credential_url: 'javascript:alert(1)' } });
  check('javascript: credential URL is rejected (422)', r.status === 422, `got ${r.status}`);
  r = await call('POST', '/api/admin/social-links', { json: { platform: 'X', url: 'javascript:alert(1)' } });
  check('javascript: social link is rejected (422)', r.status === 422, `got ${r.status}`);
  r = await call('POST', '/api/admin/education', { json: { school_name: 'ZZ', degree: 'ZZ', year_started: 'abc' } });
  check('non-numeric year is rejected (422)', r.status === 422, `got ${r.status}`);
  r = await call('PUT', '/api/admin/skills/reorder', { json: { ids: 'nope' } });
  check('bad reorder body is 422', r.status === 422, `got ${r.status}`);

  r = await call('POST', '/api/admin/experiences', { json: { company: 'ZZ Date', position: 'Tester', start_date: '2024-01-15' } });
  if (r.status === 201) {
    created.push({ path: '/api/admin/experiences', id: r.data.id });
    check('DATE stays 2024-01-15 (no timezone shift)', r.data.start_date === '2024-01-15', `got ${r.data.start_date}`);
    await removeCreated('/api/admin/experiences', r.data.id);
  } else {
    check('create experience for the date test', false, `got ${r.status}`);
  }

  r = await call('GET', '/api/admin/dashboard');
  check('dashboard has counts', r.status === 200 && typeof r.data.counts?.projects === 'number', `got ${r.status}`);

  section('Settings merge');
  r = await call('GET', '/api/admin/settings');
  const original = r.data.sections || {};
  r = await call('PUT', '/api/admin/settings', { json: { sections: { education: false } } });
  const sec = r.data.sections || {};
  check('only the toggled section changes', r.status === 200 && sec.education === false && sec.about === original.about, `got ${JSON.stringify(sec)}`);
  r = await call('PUT', '/api/admin/settings', { json: { sections: original } });
  check('settings restored', r.status === 200 && r.data.sections?.education === original.education, `got ${r.status}`);
}

async function uploadTests() {
  section('Uploads');
  const fd = new FormData();
  fd.append('title', 'ZZ Upload Project');
  fd.append('thumbnail', new Blob([PNG], { type: 'image/png' }), 'a.png');
  let r = await call('POST', '/api/admin/projects', { form: fd });
  check('valid PNG upload is 201', r.status === 201, `got ${r.status} ${JSON.stringify(r.data)}`);
  if (r.status === 201) {
    const id = r.data.id;
    const url = r.data.thumbnail || '';
    created.push({ path: '/api/admin/projects', id });
    check('thumbnail path is under /uploads/', url.startsWith('/uploads/'), `got ${url}`);
    const f = await call('GET', url, { auth: false });
    check('uploaded file is publicly served', f.status === 200, `got ${f.status}`);
    r = await removeCreated('/api/admin/projects', id);
    check('project delete is 200', r.status === 200, `got ${r.status}`);
    await sleep(400);
    const gone = await call('GET', url, { auth: false });
    check('file is removed from disk after delete', gone.status === 404, `got ${gone.status}`);
  }

  const reject = async (name, blob, filename, field = 'thumbnail', ok = [400]) => {
    const form = new FormData();
    form.append('title', 'ZZ Reject');
    form.append(field, blob, filename);
    const res = await call('POST', '/api/admin/projects', { form });
    if (res.status === 201) created.push({ path: '/api/admin/projects', id: res.data.id });
    check(name, ok.includes(res.status), `got ${res.status}`);
  };
  await reject('fake PNG (text content) is rejected', new Blob(['not an image'], { type: 'image/png' }), 'fake.png');
  await reject('text/plain file is rejected', new Blob(['hello'], { type: 'text/plain' }), 'a.txt');
  await reject('SVG is rejected', new Blob(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], { type: 'image/svg+xml' }), 'a.svg');
  await reject('PDF in an image-only field is rejected', new Blob(['%PDF-1.4'], { type: 'application/pdf' }), 'a.pdf');
  await reject('unexpected file field is rejected', new Blob([PNG], { type: 'image/png' }), 'a.png', 'avatar');
  await reject('file over 10 MB is rejected', new Blob([new Uint8Array(11 * 1024 * 1024)], { type: 'image/png' }), 'big.png', 'thumbnail', [400, 0]);
}

async function contactTests() {
  section('Contact form (WITH_CONTACT=1)');
  let r = await call('POST', '/api/contact', { auth: false, json: { name: 'T' } });
  check('invalid contact is 422', r.status === 422, `got ${r.status}`);
  r = await call('POST', '/api/contact', { auth: false, json: { name: 'ZZ Smoke', email: 'zz@example.com', subject: 'ZZ', message: 'Smoke test message body.' } });
  check('valid contact is 201', r.status === 201, `got ${r.status}`);
  r = await call('GET', '/api/admin/messages?q=ZZ%20Smoke');
  const msg = r.data.data?.[0];
  check('message appears in the admin list', Boolean(msg), `got ${r.status}`);
  if (!msg) return;
  r = await call('PATCH', `/api/admin/messages/${msg.id}`, { json: { is_read: true } });
  check('mark as read works', r.status === 200 && r.data.is_read === true, `got ${r.status}`);
  r = await call('GET', '/api/admin/messages?read=true&q=ZZ%20Smoke');
  check('read filter finds it', r.status === 200 && r.data.total >= 1, `got ${r.status}`);
  r = await call('DELETE', `/api/admin/messages/${msg.id}`);
  check('delete message works', r.status === 200, `got ${r.status}`);
}

(async () => {
  console.log(`Smoke test against ${BASE}`);
  try {
    await publicTests();
    await gateTests();
    if (await login()) {
      await crudTests();
      await extraTests();
      await uploadTests();
      if (process.env.WITH_CONTACT) await contactTests();
      await call('POST', '/api/auth/logout');
    }
  } catch (e) {
    failed++;
    console.log('  FAIL unexpected error:', e.message);
  } finally {
    for (const c of [...created]) await removeCreated(c.path, c.id);
    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed ? 1 : 0);
  }
})();
