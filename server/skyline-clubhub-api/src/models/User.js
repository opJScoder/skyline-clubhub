const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { ROLES, ROLE_VALUES } = require('../config/constants');

const BCRYPT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLE_VALUES, default: ROLES.MEMBER, index: true },
    membership: {
      status: { type: String, enum: ['none', 'active', 'expired'], default: 'none' },
      tier: { type: String, enum: ['none', 'standard'], default: 'none' },
      startDate: { type: Date },
      expiryDate: { type: Date, index: true },
      lastPaymentId: { type: String },
    },
  },
  { timestamps: true }
);

userSchema.statics.hashPassword = function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
};

userSchema.methods.verifyPassword = function verifyPassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

/** True only when the membership is active AND not past its expiry date. */
userSchema.methods.isMembershipActive = function isMembershipActive() {
  const m = this.membership;
  return Boolean(m && m.status === 'active' && m.expiryDate && m.expiryDate > new Date());
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
