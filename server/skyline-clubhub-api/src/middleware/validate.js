const AppError = require('../utils/AppError');

/** Validates req[source] against a Joi schema and replaces it with the cleaned value. */
const validate = (schema, source = 'body') => (req, _res, next) => {
  const { value, error } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((d) => ({ field: d.path.join('.'), message: d.message }));
    return next(new AppError(400, 'Validation failed', details));
  }

  req[source] = value;
  return next();
};

module.exports = validate;
