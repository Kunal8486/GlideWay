const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const authRoutes = require("./Routes/auth")
const driverRoutes = require("./Routes/driver")
const driverLogin = require("./Routes/DriverLogin")
const riderRoutes = require("./Routes/rider") 
const poolrideRoutes = require('./Routes/poolride')
const navRefresher = require('./Routes/navRefresher')
dotenv.config()
const app = express()
const PORT = process.env.PORT

// Middleware
app.use(
  cors({
  origin: process.env.FRONTEND_URL,
  credentials: true, 
  allowedHeaders: ["Content-Type", "Authorization"]
})
)
app.use(express.json())
app.use("/api/auth", authRoutes) 
app.use("/api/driver", driverRoutes)
app.use("/api/driver", driverLogin)
app.use("/api", riderRoutes) 
app.use('/api/rides', poolrideRoutes);
// app.use('/api/nav', navRefresher);


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err))

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
