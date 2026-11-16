const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const EXT = {
  'image/jpeg': '.jpg', 'image/png': '.png',
  'image/webp': '.webp', 'application/pdf': '.pdf',
};
const IMAGES = ['image/jpeg', 'image/png', 'image/webp'];
const PDF = ['application/pdf'];
const DOCS = [...IMAGES, ...PDF];

const SIGNATURES = {
  '.jpg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  '.png': (b) => b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])),
  '.webp': (b) => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP',
  '.pdf': (b) => b.toString('ascii', 0, 4) === '%PDF',
};

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (req, file, cb) => cb(null, crypto.randomUUID() + EXT[file.mimetype]),
});

const verify = (req, res, next) => {
  const files = Object.values(req.files || {}).flat();
  for (const f of files) {
    const buf = Buffer.alloc(12);
    const fd = fs.openSync(f.path, 'r');
    fs.readSync(fd, buf, 0, 12, 0);
    fs.closeSync(fd);
    if (!SIGNATURES[path.extname(f.filename)](buf)) {
      files.forEach((x) => fs.unlink(x.path, () => {}));
      return next(Object.assign(new Error('File content does not match its type'), { status: 400 }));
    }
  }
  next();
};

// spec: { fieldName: { types: [...mimetypes], max: n } }
const fields = (spec) => [
  multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024, files: 15 },
    fileFilter: (req, file, cb) => {
      const rule = spec[file.fieldname];
      if (rule && rule.types.includes(file.mimetype)) return cb(null, true);
      cb(Object.assign(new Error(`Invalid file for "${file.fieldname}"`), { status: 400 }));
    },
  }).fields(Object.entries(spec).map(([name, r]) => ({ name, maxCount: r.max }))),
  verify,
];

module.exports = { IMAGES, PDF, DOCS, fields };
