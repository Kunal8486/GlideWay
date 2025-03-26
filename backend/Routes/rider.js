const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { OAuth2Client } = require("google-auth-library")
const dotenv = require("dotenv")
const Rider = require("../Models/Rider.js")
const axios = require("axios")

dotenv.config()
const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const client = new OAuth2Client(GOOGLE_CLIENT_ID)

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]
  if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" })

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Forbidden: Invalid token" })
    req.user = decoded
    next()
  })
}

// 📌 Register Route
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone_number, password, gender, dob } = req.body
    if (await Rider.findOne({ email })) {
      return res.status(400).json({ error: "User already exists" })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newRider = new Rider({ name, email, phone_number, password: hashedPassword, gender, dob })
    await newRider.save()
    res.status(201).json({ message: "User registered successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password, captchaToken } = req.body;

    // Verify reCAPTCHA token
    const recaptchaVerifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
    const recaptchaResponse = await axios.post(recaptchaVerifyUrl, null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY || "6Le-vAArAAAAAINVH521Vd5qDFNlDu3NMR2-t-eu",
        response: captchaToken
      }
    });

    // Check if reCAPTCHA verification failed
    if (!recaptchaResponse.data.success) {
      return res.status(400).json({ 
        error: "reCAPTCHA verification failed. Please try again." 
      });
    }

    // Find rider by email
    const rider = await Rider.findOne({ email });

    // Check credentials
    if (!rider || !(await bcrypt.compare(password, rider.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: rider._id.toString(),
        email: rider.email
      }, 
      JWT_SECRET, 
      { expiresIn: "1h" }
    );

    // Optional: Add additional security logging
    console.log(`Successful login attempt for email: ${email}`);

    // Send successful response
    res.json({ 
      message: "Logged in successfully", 
      token,
      userId: rider._id.toString()
    });

  } catch (error) {
    console.error("Login error:", error);
    
    // Differentiate between different types of errors
    if (error.response) {
      // reCAPTCHA verification error
      return res.status(500).json({ error: "reCAPTCHA verification failed" });
    }

    // Generic server error
    res.status(500).json({ error: "Server error during login" });
  }
});

// 📌 Profile Route
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    console.log("Decoded User in Profile Route:", req.user) 
    const rider = await Rider.findById(req.user.id).select("-password")
    if (!rider) return res.status(404).json({ error: "User not found" })
    res.json({ user: rider })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
})

// 📌 Google Auth Route
router.post("/auth/google", async (req, res) => {
  try {
    const { token } = req.body
    const ticket = await client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID })
    const { sub: googleId, name, email, picture } = ticket.getPayload()

    let rider = await Rider.findOne({ email })
    if (!rider) {
      rider = new Rider({
        name,
        email,
        phone_number: "",
        googleId,
        password: "",
        gender: "",
        dob: "",
        profile_picture_url: picture,
        is_verified: true,
      })
      await rider.save()
    }

    const jwtToken = jwt.sign({ id: rider._id.toString() }, JWT_SECRET, { expiresIn: "1h" })
    res.json({ message: "Logged in successfully", token: jwtToken })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Google login failed" })
  }
})

// 📌 Logout Route
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" }) 
})

module.exports = router
