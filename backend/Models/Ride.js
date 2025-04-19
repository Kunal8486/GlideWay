const mongoose = require("mongoose");
const { Schema } = mongoose;

const rideSchema = new Schema(
  {
    // Core ride information
    rider: { 
      type: Schema.Types.ObjectId, 
      ref: "Rider", 
      required: true 
    },
    driver: { 
      type: Schema.Types.ObjectId, 
      ref: "Driver", 
      default: null 
    },
    
    // Status tracking
    status: { 
      type: String, 
      enum: [
        'requested',      // Initial state when rider requests a ride
        'searching',      // Looking for drivers
        'accepted',       // Driver accepted the ride
        'arrived',        // Driver arrived at pickup location
        'in_progress',    // Ride is ongoing
        'completed',      // Ride successfully completed
        'cancelled',      // Ride cancelled by either party
        'failed'          // System failure or other issues
      ],
      default: 'requested',
      required: true
    },
    
    // Locations
    pickup: {
      address: { type: String, required: true },
      coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
      }
    },
    dropoff: {
      address: { type: String, required: true },
      coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
      }
    },
    
    // Route information
    route: {
      distance: { type: Number, required: true },  // in kilometers
      duration: { type: Number, required: true },  // in minutes
      polyline: { type: String },                  // Encoded route path
      directions: { type: Object }                 // Full directions response (optional)
    },
    
    // Ride details
    ride_type: { 
      type: String, 
      enum: ['Economy', 'Premium', 'XL'], 
      required: true 
    },
    passenger_count: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 6 
    },
    
    // Time tracking
    request_time: { type: Date, default: Date.now },
    accepted_time: { type: Date },
    pickup_time: { type: Date },
    dropoff_time: { type: Date },
    cancellation_time: { type: Date },
    
    // Payment information
    payment: {
      method: { 
        type: String, 
        enum: ['cash', 'card', 'wallet'], 
        required: true 
      },
      base_fare: { type: Number, required: true },
      distance_fare: { type: Number, required: true },
      waiting_charge: { type: Number, default: 0 },
      surge_multiplier: { type: Number, default: 1.0 },
      promo_discount: { type: Number, default: 0 },
      total_fare: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
      payment_status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed', 'refunded'], 
        default: 'pending' 
      },
      transaction_id: { type: String }
    },
    
    // Preferences and additional info
    preferences: [{
      type: String,
      enum: [
        'pet_friendly',
        'eco_friendly',
        'wheelchair',
        'quiet_ride',
        'extra_stops',
        'food_allowed',
        'temperature',
        'top_rated',
        'female_driver'
      ]
    }],
    
    additional_notes: { type: String },
    promo_code: { type: String },
    
    // Ratings and feedback
    rider_rating: { 
      type: Number, 
      min: 1, 
      max: 5 
    },
    driver_rating: { 
      type: Number, 
      min: 1, 
      max: 5 
    },
    rider_feedback: { type: String },
    driver_feedback: { type: String },
    
    // Cancellation details
    cancellation: {
      cancelled_by: { 
        type: String, 
        enum: ['rider', 'driver', 'system'] 
      },
      reason: { type: String },
      charge_applied: { type: Boolean, default: false },
      refund_amount: { type: Number, default: 0 }
    },
    
    // System fields
    booking_id: { 
      type: String, 
      unique: true,
      default: () => 'RIDE' + Math.floor(100000 + Math.random() * 900000)
    },
    device_info: {
      platform: { type: String },
      app_version: { type: String }
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for query performance
rideSchema.index({ rider: 1, request_time: -1 });
rideSchema.index({ driver: 1, request_time: -1 });
rideSchema.index({ status: 1 });
rideSchema.index({ booking_id: 1 }, { unique: true });
rideSchema.index({ 
  'pickup.coordinates.latitude': 1, 
  'pickup.coordinates.longitude': 1 
});

// Virtual for ride duration calculation
rideSchema.virtual('actual_duration').get(function() {
  if (this.pickup_time && this.dropoff_time) {
    return Math.round((this.dropoff_time - this.pickup_time) / (1000 * 60)); // in minutes
  }
  return null;
});

// Virtual for completed status
rideSchema.virtual('is_completed').get(function() {
  return this.status === 'completed';
});

// Middleware to update ride history in rider and driver documents
rideSchema.post('save', async function() {
  const Rider = mongoose.model('Rider');
  const Driver = mongoose.model('Driver');
  
  // Update rider's ride history
  if (this.rider) {
    await Rider.findByIdAndUpdate(
      this.rider,
      { $addToSet: { ride_history: this._id } }
    );
  }
  
  // Update driver's ride history and increment completed rides if applicable
  if (this.driver && this.status === 'completed') {
    await Driver.findByIdAndUpdate(
      this.driver,
      { 
        $addToSet: { ride_history: this._id },
        $inc: { completed_rides: 1 }
      }
    );
  }
});

const Ride = mongoose.model("Ride", rideSchema);
module.exports = Ride;