const { Schema, model } = require('mongoose');
module.exports = model('TicketOrder', new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  quantity: Number,
  unitPrice: Number,
  totalAmount: Number,
  razorpayOrderId: String,
  status: { type: String, enum: ['reserved', 'paid', 'expired', 'failed'], default: 'reserved' },
  reservedUntil: Date
}, { timestamps: true }));
