const { Schema, model } = require('mongoose');
// Append-only: no update/delete routes exist for this collection.
module.exports = model('LedgerEntry', new Schema({
  type: { type: String, enum: ['income', 'expense'], required: true },
  source: { type: String, enum: ['dues', 'tickets', 'merchandise', 'fundraiser', 'reimbursement', 'other'], required: true },
  amount: { type: Number, required: true, min: 1 },
  description: String,
  eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  receiptUrl: String,
  refId: Schema.Types.ObjectId,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now }
}, { timestamps: true }));
