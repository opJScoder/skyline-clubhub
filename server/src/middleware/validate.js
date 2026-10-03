module.exports = (schema, part = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[part], { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ message: 'Validation failed', details: error.details.map(d => d.message) });
  req[part] = value;
  next();
};
