const { Schema, model } = require('mongoose');
module.exports = model('Announcement', new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  category: { type: String, enum: ['meeting', 'deadline', 'change-of-plan', 'general'], default: 'general' },
  pinned: { type: Boolean, default: false },
  authorId: { type: Schema.Types.ObjectId, ref: 'User' },
  emailsSent: { type: Number, default: 0 },
  emailsFailed: { type: Number, default: 0 }
}, { timestamps: true }));
