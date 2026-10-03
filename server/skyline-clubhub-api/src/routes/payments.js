const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const TicketOrder = require('../models/TicketOrder');
const LedgerEntry = require('../models/LedgerEntry');
const { reserveSeats } = require('../services/seats');
const { runAtomic } = require('../utils/atomic');

const router = express.Router();

/**
 * Constant-time HMAC-SHA256 check of the RAW request body against X-Razorpay-Signature.
 * The body MUST be the untouched Buffer; re-serialised JSON would produce a different hash.
 */
function verifySignature(rawBody, signature, secret) {
  if (!Buffer.isBuffer(rawBody) || typeof signature !== 'string' || !secret) return false;

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const newTicketCode = () => `SKY-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Handles a payment.captured event. Safe to run multiple times for the same payment:
 *  1. The order is "claimed" with a single conditional update (created/expired -> paid),
 *     so a retried webhook finds nothing to claim and exits.
 *  2. LedgerEntry.razorpayPaymentId is unique, so money can never be booked twice.
 * With MONGO_TRANSACTIONS=true everything below commits or rolls back as one unit.
 */
async function handlePaymentCaptured(payment) {
  const outcome = await runAtomic(async (session) => {
    const opts = { session };

    const existing = await TicketOrder.findOne({ razorpayOrderId: payment.order_id }, null, opts);
    if (!existing) return 'unknown_order';
    if (existing.amountPaise !== payment.amount) {
      console.error('[webhook] amount mismatch', payment.id, existing.amountPaise, payment.amount);
      return 'amount_mismatch';
    }

    // Atomic claim. new:false returns the document as it was BEFORE the update.
    const before = await TicketOrder.findOneAndUpdate(
      { _id: existing._id, status: { $in: ['created', 'expired'] } },
      { $set: { status: 'paid', razorpayPaymentId: payment.id, paidAt: new Date() } },
      { new: false, ...opts }
    );
    if (!before) return 'duplicate';

    let category;

    if (before.kind === 'membership') {
      // Renewing early extends from the current expiry instead of wasting the unused time.
      const user = await User.findById(before.user, null, opts);
      const now = new Date();
      const stillValid = user.membership.expiryDate && user.membership.expiryDate > now;
      const startFrom = stillValid ? user.membership.expiryDate : now;

      user.membership.status = 'active';
      user.membership.tier = 'standard';
      user.membership.startDate = stillValid ? user.membership.startDate : now;
      user.membership.expiryDate = new Date(startFrom.getTime() + ONE_YEAR_MS);
      user.membership.lastPaymentId = payment.id;
      await user.save(opts);
      category = 'dues';
    } else {
      category = 'tickets';

      // If the hold expired before payment arrived, the seats were released: re-reserve them.
      let seatsOk = true;
      if (before.status === 'expired') {
        seatsOk = Boolean(await reserveSeats(before.event, before.quantity, session));
      }

      if (seatsOk) {
        const ticketCodes = Array.from({ length: before.quantity }, newTicketCode);
        await TicketOrder.updateOne(
          { _id: before._id },
          { $set: { ticketCodes, seatsHeld: true } },
          opts
        );
      } else {
        // Event sold out while the customer was paying: keep the money on record and flag for refund.
        await TicketOrder.updateOne({ _id: before._id }, { $set: { status: 'paid_unfulfilled' } }, opts);
        console.warn('[webhook] paid but sold out, needs refund:', payment.id);
      }
    }

    // Money is always booked, even when fulfilment failed, so the books match the gateway.
    await LedgerEntry.create(
      [
        {
          direction: 'in',
          category,
          amountPaise: payment.amount,
          description: `${category === 'dues' ? 'Membership' : 'Ticket'} payment ${payment.id}`,
          order: before._id,
          razorpayPaymentId: payment.id,
        },
      ],
      opts
    );

    return 'processed';
  });

  return outcome;
}

/**
 * POST /api/payments/webhook
 * express.raw() is applied on THIS route only, and this router is mounted in server.js BEFORE
 * express.json(), so req.body arrives as the exact Buffer Razorpay signed.
 */
router.post('/webhook', express.raw({ type: 'application/json', limit: '1mb' }), async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[webhook] RAZORPAY_WEBHOOK_SECRET is not set');
    return res.status(500).json({ success: false, message: 'Webhook not configured' });
  }

  // ---- HMAC SHA256 SIGNATURE VERIFICATION (X-Razorpay-Signature) ----
  const signature = req.get('X-Razorpay-Signature');
  if (!verifySignature(req.body, signature, secret)) {
    console.warn('[webhook] rejected: bad signature');
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }
  // -------------------------------------------------------------------

  let event;
  try {
    event = JSON.parse(req.body.toString('utf8'));
  } catch {
    return res.status(400).json({ success: false, message: 'Malformed payload' });
  }

  try {
    if (event.event === 'payment.captured') {
      const payment = event.payload && event.payload.payment && event.payload.payment.entity;
      if (!payment || !payment.id || !payment.order_id || !Number.isInteger(payment.amount)) {
        return res.status(400).json({ success: false, message: 'Missing payment data' });
      }
      const outcome = await handlePaymentCaptured(payment);
      console.log(`[webhook] payment.captured ${payment.id} -> ${outcome}`);
      return res.status(200).json({ success: true, outcome });
    }

    // Other events (payment.failed, order.paid, ...) need no action: customers can retry on the
    // same order, and unpaid holds are released by the expiry job. Acknowledge so Razorpay stops retrying.
    console.log(`[webhook] ignored event: ${event.event}`);
    return res.status(200).json({ success: true, ignored: true });
  } catch (err) {
    // 500 makes Razorpay retry later; the idempotency guards make retries safe.
    console.error('[webhook] processing failed', err);
    return res.status(500).json({ success: false, message: 'Processing failed' });
  }
});

module.exports = router;
module.exports.verifySignature = verifySignature;
