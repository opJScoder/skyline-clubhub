const mongoose = require('mongoose');
const paise = require('./paise');

const ORDER_STATUS = ['created', 'paid', 'paid_unfulfilled', 'expired'];

const ticketOrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    kind: { type: String, enum: ['ticket', 'membership'], required: true },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: function eventRequired() {
        return this.kind === 'ticket';
      },
    },
    quantity: { type: Number, required: true, min: 1, max: 10, validate: Number.isInteger, default: 1 },
    pricingTier: { type: String, enum: ['member', 'public'], default: 'public' },
    unitPricePaise: paise({ required: true }),
    amountPaise: paise({ required: true }),
    currency: { type: String, default: 'INR', enum: ['INR'] },
    status: { type: String, enum: ORDER_STATUS, default: 'created', index: true },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String },
    ticketCodes: { type: [String], default: [] },
    checkedIn: { type: [String], default: [] },
    seatsHeld: { type: Boolean, default: false },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

ticketOrderSchema.index({ status: 1, createdAt: 1 });
ticketOrderSchema.index({ ticketCodes: 1 });

module.exports = mongoose.model('TicketOrder', ticketOrderSchema);
module.exports.ORDER_STATUS = ORDER_STATUS;
