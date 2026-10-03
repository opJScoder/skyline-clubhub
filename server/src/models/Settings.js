const { Schema, model } = require('mongoose');
const s = new Schema({
  duesAmount: { type: Number, default: 50000 },
  membershipExpiryDate: { type: Date, default: () => new Date(new Date().getFullYear(), 11, 31, 23, 59, 59) },
  memberDiscountPercent: { type: Number, default: 10 },
  openingBalance: { type: Number, default: 0 }
});
s.statics.get = async function () { return (await this.findOne()) || this.create({}); };
module.exports = model('Settings', s);
