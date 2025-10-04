// models/SessionLog.js
const mongoose = require('mongoose');

const sessionLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  token: String,
  ip: String,
  userAgent: String,
  loginTime: { type: Date, default: Date.now },
  logoutTime: Date,
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('SessionLog', sessionLogSchema);
