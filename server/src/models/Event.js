const { Schema, model } = require('mongoose');
module.exports = model('Event', new Schema({
  title: { type: String, required: true },
  description: String,
  venue: String,
  startsAt: { type: Date, required: true },
  capacity: { type: Number, required: true, min: 1 },
  memberPrice: { type: Number, required: true, min: 0 },
  nonMemberPrice: { type: Number, required: true, min: 0 },
  saleStartsAt: Date,
  saleEndsAt: Date,
  soldCount: { type: Number, default: 0 },
  reservedCount: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'published', 'cancelled', 'completed'], default: 'draft' }
}, { timestamps: true }));
