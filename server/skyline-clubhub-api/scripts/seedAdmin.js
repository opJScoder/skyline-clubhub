require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const { connectDB } = require('../src/config/db');

(async () => {
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env');

  await connectDB();
  const passwordHash = await User.hashPassword(password);
  await User.findOneAndUpdate(
    { email },
    { $set: { name: 'Club Admin', role: 'admin' }, $setOnInsert: { passwordHash } },
    { upsert: true, new: true }
  );
  console.log(`Admin ready: ${email}`);
  await mongoose.connection.close();
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
