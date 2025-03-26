const mongoose = require('mongoose')

const emailVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  verificationCode: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 900 // 15 minutes
  },
  expiresAt: {
    type: Date,
    required: true
  }
})

const EmailVerification = mongoose.model('EmailVerification', emailVerificationSchema)

module.exports = EmailVerification