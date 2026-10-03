const mongoose = require('mongoose');
const paise = require('./paise');

const CATEGORIES = ['dues', 'tickets', 'merchandise', 'fundraiser', 'expense', 'other'];

/**
 * Append-only ledger. Every field is immutable, and all update/delete operations
 * are blocked at the schema level. To correct a mistake, insert a reversing entry.
 */
const ledgerEntrySchema = new mongoose.Schema(
  {
    direction: { type: String, enum: ['in', 'out'], required: true, immutable: true },
    category: { type: String, enum: CATEGORIES, required: true, immutable: true, index: true },
    amountPaise: paise({
      required: true,
      immutable: true,
      min: [1, 'Ledger amounts must be at least 1 paise'],
    }),
    description: { type: String, trim: true, maxlength: 300, immutable: true, default: '' },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'TicketOrder', immutable: true },
    // Unique + sparse = a given gateway payment can only ever be booked once (idempotency).
    razorpayPaymentId: { type: String, immutable: true, unique: true, sparse: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', immutable: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

const blocked = (op) =>
  function blockOperation() {
    throw new Error(`LedgerEntry is append-only: ${op} is not allowed`);
  };

[
  'updateOne',
  'updateMany',
  'findOneAndUpdate',
  'findOneAndReplace',
  'replaceOne',
  'findOneAndDelete',
  'deleteMany',
].forEach((op) => ledgerEntrySchema.pre(op, blocked(op)));

ledgerEntrySchema.pre('deleteOne', { document: true, query: true }, blocked('deleteOne'));
ledgerEntrySchema.pre('save', function guardSave() {
  if (!this.isNew) throw new Error('LedgerEntry is append-only: existing entries cannot be saved');
});

module.exports = mongoose.model('LedgerEntry', ledgerEntrySchema);
module.exports.CATEGORIES = CATEGORIES;
