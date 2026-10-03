const mongoose = require('mongoose');
const { connectDB } = require('../config');
const User = require('../models/User');
(async () => {
  const email = process.argv[2];
  if (!email) { console.error('Usage: npm run make-admin -- you@example.com'); process.exit(1); }
  await connectDB();
  const u = await User.findOneAndUpdate({ email: email.toLowerCase() }, { role: 'admin' }, { new: true });
  console.log(u ? `${u.email} is now admin` : 'No user with that email');
  await mongoose.disconnect();
})();
