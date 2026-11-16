const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

exports.toUrl = (file) => `/uploads/${file.filename}`;

exports.removeFile = (url) => {
  if (!url || !url.startsWith('/uploads/')) return;
  fs.unlink(path.join(UPLOAD_DIR, path.basename(url)), () => {});
};

exports.cleanupUploaded = (req) => {
  Object.values(req.files || {}).flat()
    .forEach((f) => exports.removeFile(`/uploads/${f.filename}`));
};
