/** Shared field definition: every currency value is a non-negative integer number of paise. */
const paise = (extra = {}) => ({
  type: Number,
  min: [0, 'Amount cannot be negative'],
  validate: {
    validator: Number.isInteger,
    message: '{PATH} must be an integer number of paise',
  },
  ...extra,
});

module.exports = paise;
