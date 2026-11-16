exports.notFound = (req, res) => {
  res.status(404).json({ message: 'Route not found' });
};

exports.errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message;

  if (err.name === 'MulterError') {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE'
      ? 'File too large (max 10 MB)' : `Upload error: ${err.message}`;
  } else if (err.code === '23505') {
    status = 409; message = 'That value already exists';
  } else if (['22P02', '22007', '22001', '23502', '23503', '23514'].includes(err.code)) {
    status = 400; message = 'Invalid or missing field value';
  }

  if (status === 500) { console.error(err); message = 'Server error'; }
  res.status(status).json({ message });
};
