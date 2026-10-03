module.exports = (err, _req, res, _next) => {
  console.error(err);
  if (err.code === 11000) return res.status(409).json({ message: 'Already exists' });
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
};
