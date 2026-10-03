const cron = require('node-cron');
const User = require('../models/User');
const TicketOrder = require('../models/TicketOrder');
const Payment = require('../models/Payment');
const { releaseTicketOrder } = require('../services/payment');
const { sendMail } = require('../services/email');

module.exports = function startJobs() {
  // Every 5 min: free seats held by unpaid orders
  cron.schedule('*/5 * * * *', async () => {
    const stale = await TicketOrder.find({ status: 'reserved', reservedUntil: { $lt: new Date() } });
    for (const o of stale) {
      await releaseTicketOrder(o._id, 'expired');
      await Payment.updateOne({ referenceId: o._id, status: 'created' }, { status: 'failed' });
    }
    if (stale.length) console.log(`[cron] released ${stale.length} reservation(s)`);
  });

  // Daily 00:10: expire memberships
  cron.schedule('10 0 * * *', async () => {
    const r = await User.updateMany({ membershipStatus: 'active', membershipExpiresAt: { $lt: new Date() } }, { membershipStatus: 'expired' });
    console.log(`[cron] expired ${r.modifiedCount} membership(s)`);
  });

  // Daily 09:00: renewal reminders at 30 / 7 / 1 days
  cron.schedule('0 9 * * *', async () => {
    for (const d of [30, 7, 1]) {
      const from = new Date(); from.setDate(from.getDate() + d); from.setHours(0, 0, 0, 0);
      const to = new Date(from); to.setDate(to.getDate() + 1);
      const users = await User.find({ membershipStatus: 'active', membershipExpiresAt: { $gte: from, $lt: to } });
      for (const u of users) await sendMail(u.email, 'Your Skyline membership is expiring', `<p>Hi ${u.name}, your membership expires in ${d} day(s). Renew in the app.</p>`);
    }
  });
};
