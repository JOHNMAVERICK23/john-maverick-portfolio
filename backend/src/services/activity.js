const pool = require('../config/db');

exports.logActivity = (adminId, action, entity, entityId, description) =>
  pool.query(
    `INSERT INTO activity_logs (admin_id, action, entity, entity_id, description)
     VALUES ($1,$2,$3,$4,$5)`,
    [adminId, action, entity, entityId, description]
  ).catch(console.error);
