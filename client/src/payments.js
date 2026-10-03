import api from './api';

function loadCheckout() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = resolve; s.onerror = () => reject(new Error('Could not load Razorpay'));
    document.body.appendChild(s);
  });
}

// order = response from POST /membership/pay or /events/:id/tickets/order
// The webhook (server side) is the source of truth; the callback only updates the UI.
export async function pay(order, label, user) {
  if (order.devMode) { // no Razorpay keys on server: simulate a captured payment
    await api.post(`/payments/dev-confirm/${order.orderId}`);
    return true;
  }
  await loadCheckout();
  return new Promise(resolve => {
    new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, order_id: order.orderId, amount: order.amount, currency: order.currency,
      name: 'Skyline Student Association', description: label,
      prefill: { name: user?.name, email: user?.email },
      handler: () => resolve(true),
      modal: { ondismiss: () => resolve(false) }
    }).open();
  });
}
