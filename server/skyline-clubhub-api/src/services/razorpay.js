const AppError = require('../utils/AppError');

const API = 'https://api.razorpay.com/v1';

function credentials() {
  const { RAZORPAY_KEY_ID: id, RAZORPAY_KEY_SECRET: secret } = process.env;
  if (!id || !secret) throw new AppError(503, 'Payments are not configured');
  return { id, secret };
}

/** Creates a Razorpay order. amountPaise must be an integer >= 100. */
async function createOrder({ amountPaise, receipt, notes = {} }) {
  const { id, secret } = credentials();

  const res = await fetch(`${API}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
    },
    body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt, notes }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[razorpay] order creation failed', res.status, text);
    throw new AppError(502, 'Could not create payment order');
  }
  return res.json();
}

module.exports = { createOrder, publicKeyId: () => process.env.RAZORPAY_KEY_ID };
