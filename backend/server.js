const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");

// Import Routes
const authRoutes = require("./Routes/sessions"); // Authentication routes
const riderRoutes = require("./Routes/rider"); // Rider-specific routes

// Initialize App
dotenv.config(); // Load environment variables from .env file
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Parse JSON data
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded data

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes); // Authentication-related routes (login, logout, session)
app.use("/api/riders", riderRoutes); // Rider-specific routes

// Base Route
app.get("/", (req, res) => {
  res.send("Welcome to Glide Way Backend API!");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "An unexpected error occurred." });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
