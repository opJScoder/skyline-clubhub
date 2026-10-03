const TicketOrder = require('../models/TicketOrder');
const { releaseSeats } = require('../services/seats');

/** Expires unpaid orders past the hold window and gives their seats back. */
async function releaseExpiredHolds() {
  const minutes = parseInt(process.env.ORDER_HOLD_MINUTES || '15', 10);
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);

  const stale = await TicketOrder.find({ status: 'created', createdAt: { $lt: cutoff } }).select('_id');

  for (const { _id } of stale) {
    // Claim first: if a webhook marks it paid in the meantime, this returns null and we skip.
    const order = await TicketOrder.findOneAndUpdate(
      { _id, status: 'created' },
      { $set: { status: 'expired', seatsHeld: false } },
      { new: false }
    );
    if (order && order.kind === 'ticket' && order.seatsHeld) {
      await releaseSeats(order.event, order.quantity);
    }
  }
  if (stale.length) console.log(`[job] checked ${stale.length} stale order(s)`);
}

function startReleaseHoldsJob() {
  const timer = setInterval(() => {
    releaseExpiredHolds().catch((err) => console.error('[job] releaseHolds failed', err));
  }, 2 * 60 * 1000);
  timer.unref();
  return timer;
}

module.exports = { startReleaseHoldsJob, releaseExpiredHolds };
