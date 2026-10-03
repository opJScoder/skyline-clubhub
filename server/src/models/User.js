const { Schema, model } = require('mongoose');
const crypto = require('crypto');
const s = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, required: true, trim: true },
  studentId: String,
  role: { type: String, enum: ['member', 'volunteer', 'treasurer', 'admin'], default: 'member' },
  membershipStatus: { type: String, enum: ['none', 'active', 'expired'], default: 'none' },
  membershipStartsAt: Date,
  membershipExpiresAt: Date,
  memberId: { type: String, unique: true, default: () => crypto.randomBytes(8).toString('hex') },
  emailPrefs: { announcements: { type: Boolean, default: true } }
}, { timestamps: true });
s.methods.isActiveMember = function () {
  return this.membershipStatus === 'active' && this.membershipExpiresAt && this.membershipExpiresAt > new Date();
};
s.methods.toSafe = function () { const o = this.toObject(); delete o.passwordHash; return o; };
module.exports = model('User', s);
