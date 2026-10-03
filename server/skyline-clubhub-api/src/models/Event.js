const mongoose = require('mongoose');
const paise = require('./paise');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    venue: { type: String, trim: true, maxlength: 200, default: '' },
    date: { type: Date, required: true, index: true },
    capacity: { type: Number, required: true, min: 1, validate: Number.isInteger },
    seatsSold: { type: Number, default: 0, min: 0, validate: Number.isInteger },
    memberPricePaise: paise({ required: true }),
    publicPricePaise: paise({ required: true }),
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

eventSchema.virtual('seatsLeft').get(function seatsLeft() {
  return Math.max(this.capacity - this.seatsSold, 0);
});
eventSchema.set('toJSON', { virtuals: true, versionKey: false });

module.exports = mongoose.model('Event', eventSchema);
