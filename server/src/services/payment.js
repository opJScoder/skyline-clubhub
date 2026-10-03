const crypto = require('crypto');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const TicketOrder = require('../models/TicketOrder');
const LedgerEntry = require('../models/LedgerEntry');
const Settings = require('../models/Settings');
const { razorpay, hasRazorpay } = require('../config');
const { sendMail } = require('./email');

// Creates a Razorpay order (or a fake one in dev mode) plus a Payment row.
async function createPayment({ userId, purpose, referenceId, amount }) {
  let orderId;
  if (hasRazorpay) {
    const o = await razorpay.orders.create({ amount, currency: 'INR', receipt: String(referenceId).slice(-20) });
    orderId = o.id;
  } else orderId = 'dev_order_' + crypto.randomBytes(8).toString('hex');
  await Payment.create({ userId, purpose, referenceId, amount, razorpayOrderId: orderId });
  return orderId;
}

// Idempotent: the atomic status flip + unique razorpayPaymentId make repeats no-ops.
async function fulfill(razorpayOrderId, razorpayPaymentId) {
  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId, status: 'created' },
    { status: 'captured', razorpayPaymentId, capturedAt: new Date() },
    { new: true }
  );
  if (!payment) return false;

  if (payment.purpose === 'dues') {
    const { membershipExpiryDate } = await Settings.get();
    await User.findByIdAndUpdate(payment.userId, {
      membershipStatus: 'active', membershipStartsAt: new Date(), membershipExpiresAt: membershipExpiryDate
    });
    await LedgerEntry.create({ type: 'income', source: 'dues', amount: payment.amount, description: 'Membership dues', refId: payment._id });
  }

  if (payment.purpose === 'ticket') {
    const order = await TicketOrder.findOneAndUpdate({ _id: payment.referenceId, status: 'reserved' }, { status: 'paid' }, { new: true });
    if (order) {
      await Event.findByIdAndUpdate(order.eventId, { $inc: { soldCount: order.quantity, reservedCount: -order.quantity } });
      const tickets = await Ticket.insertMany(Array.from({ length: order.quantity }, () => ({
        orderId: order._id, eventId: order.eventId, userId: order.userId, ticketCode: crypto.randomBytes(10).toString('hex')
      })));
      await LedgerEntry.create({ type: 'income', source: 'tickets', amount: payment.amount, description: 'Ticket sale', eventId: order.eventId, refId: payment._id });
      const [user, ev] = await Promise.all([User.findById(order.userId), Event.findById(order.eventId)]);
      sendMail(user.email, `Your tickets: ${ev.title}`, `<p>Hi ${user.name}, you have ${tickets.length} ticket(s). Open "My Tickets" in the app to see your QR codes.</p>`);
    }
  }
  return true;
}

async function releaseTicketOrder(orderId, newStatus = 'expired') {
  const order = await TicketOrder.findOneAndUpdate({ _id: orderId, status: 'reserved' }, { status: newStatus });
  if (order) await Event.findByIdAndUpdate(order.eventId, { $inc: { reservedCount: -order.quantity } });
}

async function markFailed(razorpayOrderId) {
  const payment = await Payment.findOneAndUpdate({ razorpayOrderId, status: 'created' }, { status: 'failed' });
  if (payment?.purpose === 'ticket') await releaseTicketOrder(payment.referenceId, 'failed');
}

module.exports = { createPayment, fulfill, markFailed, releaseTicketOrder };
