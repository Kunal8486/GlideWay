const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const express = require("express")
const router = express.Router()
const dotenv = require("dotenv")
dotenv.config()


const User = require("../Models/Rider")
const Driver = require("../Models/Driver")
const EmailVerification = require("../Models/EmailVerification")

// Configure Nodemailer with error handling
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Add error handling for email transport
  debug: false,
  logger: false
})

// Middleware to validate email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Middleware for error handling
const handleError = (res, error, customMessage = "Server error") => {
  console.error(`❌ ${customMessage}:`, error)
  return res.status(500).json({
    message: customMessage,
    error: error.message || error
  })
}

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" })
    }

    // Find user with proper error handling
    const user = await User.findOne({ email }).exec()
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Generate tokens with stronger randomness
    const token = crypto.randomBytes(64).toString("hex")
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h"
    })

    // Update user with reset tokens
    user.resetPasswordToken = token
    user.resetPasswordExpires = Date.now() + 3600000

    // Save with error handling
    try {
      await user.save()
    } catch (saveError) {
      return handleError(res, saveError, "Failed to save reset token")
    }

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`

    const mailOptions = {
      from: `"GlideWay Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "GlideWay Password Reset Request",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
          </div>
          
          <div style="color: #333333;">
            <h2 style="color: #2C3E50; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p>Hello,</p>
            
            <p>We received a request to reset your password for your GlideWay account. To complete the process, please click the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4361ee; color: white; text-decoration: none; font-weight: bold; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                Reset My Password
              </a>
            </div>
            
            <p>This link will expire in <strong>1 hour</strong> for security reasons.</p>
            
            <p>If you didn't request a password reset, please ignore this email or contact our support team immediately if you believe your account may be compromised.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e4e4e4; color: #666666; font-size: 14px;">
              <p>For security, please note:</p>
              <ul style="padding-left: 20px;">
                <li>GlideWay will never ask for your password via email</li>
                <li>Always verify that you're on the official GlideWay website before entering your credentials</li>
                <li>This email was sent to ${user.email}</li>
              </ul>
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e4e4e4; text-align: center; color: #999; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} GlideWay. All rights reserved.</p>
            <p>Bennett University, Greater Noida, India</p>
          </div>
        </div>
      `
    };

    // Send email with comprehensive error handling
    try {
      await transporter.sendMail(mailOptions)
      res.json({ message: "Reset link sent to your email" })
    } catch (emailError) {
      return handleError(res, emailError, "Failed to send reset email")
    }
  } catch (error) {
    handleError(res, error)
  }
})


router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params
    const { newPassword } = req.body

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long"
      })
    }

    // Verify token with error handling
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (tokenError) {
      return res.status(400).json({ message: "Invalid or expired token" })
    }

    // Find user with proper query
    const user = await User.findById(decoded.id).exec()
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12)  // Increased salt rounds for better security
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Update user password
    user.password = hashedPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    // Save with error handling
    try {
      await user.save()
      res.json({ message: "Password reset successful" })
    } catch (saveError) {
      return handleError(res, saveError, "Failed to update password")
    }
  } catch (error) {
    handleError(res, error)
  }
})





router.post("/driver/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Find driver with proper error handling
    const driver = await Driver.findOne({ email }).exec();
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: driver._id }, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });

    // Update driver with reset token using findByIdAndUpdate to avoid validation issues
    try {
      await Driver.findByIdAndUpdate(
        driver._id,
        {
          resetPasswordToken: resetToken,
          resetPasswordExpires: Date.now() + 3600000 // 1 hour
        },
        { runValidators: false } // Skip validation for these specific fields
      );
    } catch (saveError) {
      return handleError(res, saveError, "Failed to save reset token");
    }

    const resetUrl = `${process.env.FRONTEND_URL}/driver/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"GlideWay Support" <${process.env.EMAIL_USER}>`,
      to: driver.email,
      subject: "GlideWay Password Reset Request",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
          </div>
          
          <div style="color: #333333;">
            <h2 style="color: #2C3E50; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p>Hello,</p>
            
            <p>We received a request to reset your password for your GlideWay driver account. To complete the process, please click the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4361ee; color: white; text-decoration: none; font-weight: bold; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                Reset My Password
              </a>
            </div>
            
            <p>This link will expire in <strong>1 hour</strong> for security reasons.</p>
            
            <p>If you didn't request a password reset, please ignore this email or contact our support team immediately if you believe your account may be compromised.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e4e4e4; color: #666666; font-size: 14px;">
              <p>For security, please note:</p>
              <ul style="padding-left: 20px;">
                <li>GlideWay will never ask for your password via email</li>
                <li>Always verify that you're on the official GlideWay website before entering your credentials</li>
                <li>This email was sent to ${driver.email}</li>
              </ul>
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e4e4e4; text-align: center; color: #999; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} GlideWay. All rights reserved.</p>
            <p>Bennett University, Greater Noida, India</p>
          </div>
        </div>
      `
    };

    // Send email with comprehensive error handling
    try {
      await transporter.sendMail(mailOptions);
      res.json({ message: "Password reset link sent to your email" });
    } catch (emailError) {
      return handleError(res, emailError, "Failed to send reset email");
    }
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/driver/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long"
      });
    }

    // Verify token with error handling
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (tokenError) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Find driver with proper query
    const driver = await Driver.findById(decoded.id).exec();
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Verify token matches saved token and not expired
    if (driver.resetPasswordToken !== token || driver.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);  // Increased salt rounds for better security
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update driver password using findByIdAndUpdate to avoid validation issues
    try {
      await Driver.findByIdAndUpdate(
        driver._id,
        {
          password: hashedPassword,
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined
        },
        { runValidators: false } // Skip validation for these specific fields
      );
      res.json({ message: "Password reset successful" });
    } catch (saveError) {
      return handleError(res, saveError, "Failed to update password");
    }
  } catch (error) {
    handleError(res, error);
  }
});



//OTP Verification

router.post("/send-verification-email", async (req, res) => {
  try {
    const { email } = req.body

    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" })
    }

    // Check if email is already registered with robust query
    const existingUser = await User.findOne({ email }).exec()
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" })
    }

    // Generate cryptographically stronger verification code
    const verificationCode = crypto.randomBytes(3).toString('hex').substring(0, 6).toUpperCase()

    // Create verification record with explicit error handling
    const emailVerification = new EmailVerification({
      email,
      verificationCode,
      createdAt: Date.now(),
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
    })

    try {
      await emailVerification.save()
    } catch (saveError) {
      return handleError(res, saveError, "Failed to save verification code")
    }

    // Send verification email with improved error handling
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Your verification code is:</p>
          <h1 style="background-color: #f0f0f0; padding: 10px; text-align: center; letter-spacing: 5px;">
            ${verificationCode}
          </h1>
          <p>This code will expire in 15 minutes.</p>
        </div>
      `
    }

    try {
      await transporter.sendMail(mailOptions)
      res.status(200).json({
        message: "Verification code sent to your email",
        expiresAt: Date.now() + 15 * 60 * 1000
      })
    } catch (emailError) {
      return handleError(res, emailError, "Failed to send verification email")
    }
  } catch (error) {
    handleError(res, error)
  }
})

router.post("/verify-email", async (req, res) => {
  try {
    const { email, verification_code } = req.body

    // Validate inputs
    if (!email || !verification_code) {
      return res.status(400).json({ error: "Email and verification code are required" })
    }

    // Find verification record with robust query
    const emailVerification = await EmailVerification.findOne({
      email,
      verificationCode: verification_code,
      expiresAt: { $gt: Date.now() }
    }).exec()

    if (!emailVerification) {
      return res.status(400).json({
        error: "Invalid or expired verification code"
      })
    }

    // Delete verification record with error handling
    try {
      await EmailVerification.findByIdAndDelete(emailVerification._id)
    } catch (deleteError) {
      return handleError(res, deleteError, "Failed to delete verification record")
    }

    res.status(200).json({
      message: "Email verified successfully",
      email: email
    })
  } catch (error) {
    handleError(res, error)
  }
})

module.exports = router