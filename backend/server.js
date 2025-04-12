const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const authRoutes = require("./Routes/userAuth.js")
const driverRoutes = require("./Routes/userDriver.js")
const riderRoutes = require("./Routes/userRider.js") 
const poolrideRoutes = require('./Routes/poolride')
const poolride2Routes = require('./Routes/poolride2.js')
const poolride3Routes = require('./Routes/poolride3.js')
require('./Models/Rider.js');
require('./Models/Ride.js'); 



dotenv.config()
const app = express()
const PORT = process.env.PORT

// Middleware
app.use(
  cors({
  origin: process.env.FRONTEND_URL,
  credentials: true, 
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  methods: ["GET", "POST", "PUT", "DELETE"],
})
)
app.use(express.json())
app.use('/driver/uploads', express.static('uploads'));
app.use("/api/auth", authRoutes) 
app.use("/api/driver", driverRoutes)
app.use("/api", riderRoutes) 
app.use('/api/rides/pool', poolrideRoutes);
app.use('/api/rides/pool', poolride2Routes);
app.use('/api/rides/pool', poolride3Routes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err))

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
