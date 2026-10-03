const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const { env, hasRazorpay } = require('../config');
const { fulfill, markFailed } = require('../services/payment');
const Payment = require('../models/Payment');
const { authenticate } = require('../middleware/auth');

// express.raw() on this route so the HMAC is computed over the exact raw body.
router.post('/payments/webhook', express.raw({ type: '*/*' }), async (req, res) => {
  const sig = req.headers['x-razorpay-signature'];
  const expected = crypto.createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET || '').update(req.body).digest('hex');
  if (!env.RAZORPAY_WEBHOOK_SECRET || !sig || sig.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)))
    return res.status(400).json({ message: 'Invalid signature' });
  try {
    const { event, payload } = JSON.parse(req.body.toString());
    const p = payload?.payment?.entity;
    if (event === 'payment.captured') await fulfill(p.order_id, p.id);
    if (event === 'payment.failed') await markFailed(p.order_id);
    res.json({ received: true });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Webhook error' }); }
});

// DEV ONLY: simulate a captured payment when Razorpay keys are not configured.
if (!hasRazorpay && process.env.NODE_ENV !== 'production') {
  router.post('/payments/dev-confirm/:orderId', authenticate, async (req, res, next) => {
    try {
      const p = await Payment.findOne({ razorpayOrderId: req.params.orderId, userId: req.user._id });
      if (!p) return res.status(404).json({ message: 'Order not found' });
      res.json({ ok: await fulfill(p.razorpayOrderId, 'dev_pay_' + crypto.randomBytes(6).toString('hex')) });
    } catch (e) { next(e); }
  });
}

module.exports = router;
