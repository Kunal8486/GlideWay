const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const dotenv = require("dotenv")
const User = require("../Models/Rider")
dotenv.config()

const router = express.Router()

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "kunalkumar8486@gmail.com",
    pass: "zkmw vwqy wngz qstd",
  },
})

router.post("/forgot-password", async (req, res) => {
    try {
      const { email } = req.body
      console.log("🔍 Received email:", email) // Debugging
  
      const user = await User.findOne({ email })
      if (!user) {
        console.log("❌ User not found")
        return res.status(404).json({ message: "User not found" })
      }
  
      const token = crypto.randomBytes(32).toString("hex")
      const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" })
  
      user.resetPasswordToken = token
      user.resetPasswordExpires = Date.now() + 3600000
      await user.save()
  
      const resetUrl = `http://localhost:3000/reset-password/${resetToken}`
      console.log("📧 Reset URL:", resetUrl) // Debugging
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Password Reset Request",
        text: `Click the link to reset your password: ${resetUrl}`,
      }
  
      const info = await transporter.sendMail(mailOptions)
      console.log("✅ Email sent:", info.response) // Debugging
  
      res.json({ message: "Reset link sent to your email" })
    } catch (error) {
      console.error("❌ Server error:", error) // Debugging
      res.status(500).json({ message: "Server error", error: error.message })
    }
  })
  
// Step 2: Reset Password
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params
    const { newPassword } = req.body
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id)
    if (!user) return res.status(404).json({ message: "Invalid or expired token" })

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: "Password reset successful" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
})

module.exports = router
