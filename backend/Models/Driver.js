const mongoose = require("mongoose");
const { Schema } = mongoose;

const driverSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone_number: { type: String, required: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    age: { type: Number, required: true, min: 18, max: 70 },
    
    // License information
    license_number: { type: String, required: true, unique: true },
    license_expiry: { type: Date, required: true },
    license_front_url: { type: String, required: true },
    license_back_url: { type: String, required: true },
    
    // Vehicle information
    vehicle_details: {
      make: { type: String, required: true },
      model: { type: String, required: true },
      registration_number: { type: String, required: true, unique: true },
    },
    
    // Profile information
    profile_picture_url: { type: String, required: true },
    
    // Status and verification
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    is_verified: { type: Boolean, default: false },
    
    // Additional fields (not in frontend form but retained from original model)
    vehicle_insurance_url: { type: String },
    rating: { type: Number, default: 0 },
    completed_rides: { type: Number, default: 0 },
    wallet_balance: { type: Number, default: 0 },
    availability: { type: Boolean, default: false },  // Changed default to false since new drivers shouldn't be available until verified
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    ride_history: [{ type: Schema.Types.ObjectId, ref: "Ride" }],
  },
  { timestamps: true }
);

// Add validation for license expiry
driverSchema.path('license_expiry').validate(function(value) {
  return value > new Date();
}, 'License expiry date must be in the future');


const Driver = mongoose.model("Driver", driverSchema);
module.exports = Driver;