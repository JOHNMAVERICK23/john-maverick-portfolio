const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const EXT = {
  'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp',
  'application/pdf': '.pdf',
};
const IMAGES = ['image/jpeg', 'image/png', 'image/webp'];
const DOCS = [...IMAGES, 'application/pdf'];

const make = (allowed, maxMB) => multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '..', '..', 'uploads'),
    filename: (req, file, cb) =>
      cb(null, crypto.randomUUID() + EXT[file.mimetype]),
  }),
  limits: { fileSize: maxMB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowed.includes(file.mimetype)) return cb(null, true);
    const err = new Error('File type not allowed');
    err.status = 400;
    cb(err);
  },
});

exports.image = make(IMAGES, 5);
exports.document = make(DOCS, 10);
