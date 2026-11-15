exports.notFound = (req, res) => {
  res.status(404).json({ message: 'Route not found' });
};

exports.errorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: status === 500 ? 'Server error' : err.message,
  });
};
