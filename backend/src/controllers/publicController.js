const pool = require('../config/db');

const rows = async (sql, params) => (await pool.query(sql, params)).rows;

const PROJECT_SQL = `
  SELECT p.*, COALESCE((SELECT json_agg(i.image_url ORDER BY i.sort_order, i.id)
    FROM project_images i WHERE i.project_id = p.id), '[]') AS images
  FROM projects p WHERE p.is_published = TRUE`;

exports.getProfile = async (req, res) => {
  const [profile] = await rows('SELECT * FROM profiles ORDER BY id LIMIT 1');
  const social = await rows(
    'SELECT platform, url FROM social_links WHERE is_visible ORDER BY sort_order, id');
  res.json({ ...profile, social_links: social });
};

exports.getSettings = async (req, res) => {
  const [settings] = await rows('SELECT * FROM website_settings ORDER BY id LIMIT 1');
  res.json(settings || {});
};

exports.getProjects = async (req, res) => {
  const featured = req.query.featured === 'true' ? ' AND p.is_featured' : '';
  res.json(await rows(
    `${PROJECT_SQL}${featured} ORDER BY p.sort_order, p.created_at DESC`));
};

exports.getProject = async (req, res) => {
  const [project] = await rows(`${PROJECT_SQL} AND p.slug = $1`, [req.params.slug]);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json(project);
};

exports.getSkills = async (req, res) => {
  if (req.query.featured === 'true') {
    return res.json(await rows(
      'SELECT * FROM skills WHERE is_featured ORDER BY sort_order, id'));
  }
  res.json(await rows(`
    SELECT COALESCE(c.id, 0) AS id, COALESCE(c.name, 'Other') AS name, COALESCE(json_agg(s ORDER BY s.sort_order, s.id)
      FILTER (WHERE s.id IS NOT NULL), '[]') AS skills
    FROM skills s FULL JOIN skill_categories c ON s.category_id = c.id
    GROUP BY c.id, c.name, c.sort_order ORDER BY c.sort_order NULLS LAST, c.id NULLS LAST`));
};

exports.getExperiences = async (req, res) => {
  res.json(await rows(
    'SELECT * FROM experiences ORDER BY sort_order, start_date DESC'));
};

exports.getCertificates = async (req, res) => {
  res.json(await rows(
    'SELECT * FROM certificates WHERE is_published ORDER BY sort_order, issue_date DESC'));
};

exports.getEducation = async (req, res) => {
  res.json(await rows(
    'SELECT * FROM education ORDER BY sort_order, year_started DESC'));
};

exports.createMessage = async (req, res) => {
  const { name, email, subject, message } = req.body;
  await pool.query(
    'INSERT INTO contact_messages (name, email, subject, message) VALUES ($1,$2,$3,$4)',
    [name, email, subject || null, message]);
  res.status(201).json({ message: 'Message sent successfully' });
};
