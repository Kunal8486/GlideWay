const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const { OAuth2Client } = require("google-auth-library")
const Rider = require("./Models/Rider")

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true, 
  allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(express.json())

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err))

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]
  if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" })

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Forbidden: Invalid token" })
    req.user = decoded // Ensure req.user contains the decoded token payload
    next()
  })
}

// 📌 Register Route
app.post("/api/register", async (req, res) => {
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

// 📌 Login Route
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const rider = await Rider.findOne({ email })
    if (!rider || !(await bcrypt.compare(password, rider.password))) {
      return res.status(400).json({ error: "Invalid credentials" })
    }
    const token = jwt.sign({ id: rider._id.toString() }, JWT_SECRET, { expiresIn: "1h" })
    res.json({ message: "Logged in successfully", token })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
})

// 📌 Profile Route
app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    console.log("Decoded User in Profile Route:", req.user) // Debugging
    const rider = await Rider.findById(req.user.id).select("-password")
    if (!rider) return res.status(404).json({ error: "User not found" })
    res.json({ user: rider })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
})
const client = new OAuth2Client(GOOGLE_CLIENT_ID)

// 📌 Google Auth Route
app.post("/api/auth/google", async (req, res) => {
  try {
    const { token } = req.body
    const ticket = await client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID })
    
    // Extract necessary fields from Google's response
    const { sub: googleId, name, email, picture } = ticket.getPayload()

    let rider = await Rider.findOne({ email })
    if (!rider) {
      rider = new Rider({
        name,
        email,
        phone_number: "",
        googleId, // ✅ Fix: Properly define googleId
        password: "",
        gender: "",
        dob: "", // Ensure this is handled correctly in your schema
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
app.post("/api/logout", (req, res) => {
  res.json({ message: "Logged out successfully" }) 
})

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
