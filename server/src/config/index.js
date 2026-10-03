require('dotenv').config();
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');

const env = process.env;
const hasRazorpay = !!(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
const razorpay = hasRazorpay ? new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET }) : null;
const mailer = env.SMTP_HOST
  ? nodemailer.createTransport({ host: env.SMTP_HOST, port: +env.SMTP_PORT || 587, auth: { user: env.SMTP_USER, pass: env.SMTP_PASS } })
  : null;

const connectDB = () => mongoose.connect(env.MONGODB_URI || 'mongodb://localhost:27017/skyline-clubhub');

module.exports = { env, hasRazorpay, razorpay, mailer, connectDB };
