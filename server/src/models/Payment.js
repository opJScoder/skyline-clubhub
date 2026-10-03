const { Schema, model } = require('mongoose');
module.exports = model('Payment', new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  purpose: { type: String, enum: ['dues', 'ticket', 'merch'] },
  referenceId: Schema.Types.ObjectId,
  amount: Number,
  razorpayOrderId: { type: String, index: true },
  razorpayPaymentId: { type: String, unique: true, sparse: true },
  status: { type: String, enum: ['created', 'captured', 'failed'], default: 'created' },
  capturedAt: Date
}, { timestamps: true }));
