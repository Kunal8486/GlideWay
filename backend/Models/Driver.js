const mongoose = require("mongoose");
const { Schema } = mongoose;

const driverSchema = new Schema(
  {
    // Personal Information
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone_number: { type: String, required: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    age: { type: Number, required: true, min: 18, max: 70 },
    
    // Optional Fields
    referral_code: { 
      type: String, 
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^[A-Z0-9]{6}$/i.test(v);
        },
        message: props => `${props.value} is not a valid referral code!`
      }
    },

    // License information
    license_number: { type: String, required: true, unique: true },
    license_expiry: { type: Date, required: true },
    license_front_url: { type: String, required: true },
    license_back_url: { type: String, required: true },
    license_state: { type: String, required: true },

    //Reset Password
    resetPasswordToken: { 
      type: String, 
      default: null 
    },
    resetPasswordExpires: { 
      type: Date, 
      default: null 
    },
    
    // Vehicle information
    vehicle_details: {
      make: { type: String, required: true },
      model: { type: String, required: true },
      registration_number: { type: String, required: true, unique: true },
      year: { 
        type: Number, 
        required: true,
        validate: {
          validator: function(v) {
            const currentYear = new Date().getFullYear();
            return v >= 1990 && v <= currentYear + 1;
          },
          message: props => `${props.value} is not a valid vehicle year!`
        }
      },
      color: { type: String, required: true }
    },
    
    // Profile information
    profile_picture_url: { type: String, required: true },
    
    // Status and verification
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'approved',
      trim: true
    },
    is_verified: { type: Boolean, default: true },
    
    // Additional fields
    vehicle_insurance_url: { type: String, required: true },
    rating: { type: Number, default: 0 },
    completed_rides: { type: Number, default: 0 },
    wallet_balance: { type: Number, default: 0 },
    availability: { type: Boolean, default: false },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    ride_history: [{ type: Schema.Types.ObjectId, ref: "Ride" }],
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add validation for license expiry
driverSchema.path('license_expiry').validate(function(value) {
  return value > new Date();
}, 'License expiry date must be in the future');

// Virtual for full vehicle description
driverSchema.virtual('vehicle_full_description').get(function() {
  return `${this.vehicle_details.year} ${this.vehicle_details.make} ${this.vehicle_details.model} (${this.vehicle_details.color})`;
});

// Compound index for unique identification
driverSchema.index({ 
  email: 1, 
  'vehicle_details.registration_number': 1 
}, { unique: true });

const Driver = mongoose.model("Driver", driverSchema);
module.exports = Driver;