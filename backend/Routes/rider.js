const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();
const Rider = require("../Models/Rider");

const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
router.post("/google-signup", async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, sub } = ticket.getPayload();

    // Check if user exists in DB, if not, create new user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, googleId: sub });
      await user.save();
    }

    res.status(200).json({ message: "Google signup successful", user });
  } catch (error) {
    res.status(400).json({ error: "Google authentication failed" });
  }
});
// Google Sign-In Route
router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token is required" });

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, sub } = ticket.getPayload();

    // Check if the user already exists
    let rider = await Rider.findOne({ email });
    
    if (!rider) {
      // Create a new Rider if not found
      rider = new Rider({
        name,
        email,
        password: "", // No password required for Google Sign-In
        phone_number: "", // Optional, can be added later
        gender: "other", // Default value, can be updated later
        dob: "", // Optional, can be added later
        age: null, // Optional
        googleId: sub, // Store Google ID
      });

      await rider.save();
    }

    // Generate JWT token
    const authToken = jwt.sign(
      { riderId: rider._id, email: rider.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ message: "Login successful", token: authToken });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ message: "Google login failed" });
  }
});
// Function to calculate age from date of birth
const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  if (today.getMonth() < birthDate.getMonth() || 
     (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Rider Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone_number, gender, dob } = req.body;

    // Validation
    if (!name || name.trim().length < 4)
      return res.status(400).json({ message: "Name must be at least 4 characters long." });

    if (!email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email))
      return res.status(400).json({ message: "Invalid email format." });

    if (!password || password.length < 8)
      return res.status(400).json({ message: "Password must be at least 8 characters long." });

    if (!phone_number || !/^[0-9]{10}$/.test(phone_number))
      return res.status(400).json({ message: "Phone number must be exactly 10 digits." });

    if (!gender || !["male", "female", "other"].includes(gender))
      return res.status(400).json({ message: "Invalid gender." });

    if (!dob || new Date(dob).getFullYear() > new Date().getFullYear() - 18)
      return res.status(400).json({ message: "You must be at least 18 years old." });

    // Check if the email already exists
    const existingRider = await Rider.findOne({ email });
    if (existingRider)
      return res.status(400).json({ message: "Email is already registered." });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate age from dob
    const age = calculateAge(dob);

    // Create new rider
    const newRider = new Rider({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone_number,
      gender,
      dob,
      age,
    });

    // Save to database
    await newRider.save();
    res.status(201).json({ message: "Rider signed up successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Rider Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email))
      return res.status(400).json({ message: "Invalid email format." });

    if (!password || password.length < 8)
      return res.status(400).json({ message: "Password must be at least 8 characters long." });

    // Check if the rider exists
    const rider = await Rider.findOne({ email: email.toLowerCase() });
    if (!rider)
      return res.status(400).json({ message: "Invalid email or password." });

    // Compare password
    const isMatch = await bcrypt.compare(password, rider.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password." });

    // Create JWT token
    const token = jwt.sign(
      { riderId: rider._id, email: rider.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = router;
