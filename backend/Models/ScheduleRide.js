const mongoose = require("mongoose");
const { Schema } = mongoose;

const rideSchema = new Schema(
  {
    // Basic ride information
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    originCoords: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    destinationCoords: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    date: { type: String, required: true },
    time: { type: String, required: true },
    
    // Pricing details
    estimatedPrice: { type: Number, required: true },
    actualPrice: { type: Number }, // To be set after ride completion
    
    // Ride status tracking
    status: {
      type: String,
      enum: ['scheduled', 'accepted', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    
    // Relations to rider and driver
    riderId: { type: Schema.Types.ObjectId, ref: "Rider", required: true },
    driverId: { type: Schema.Types.ObjectId, ref: "Driver" }, // Optional until assigned
    
    // Timestamps for ride lifecycle
    scheduledAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    
    // Rating and feedback
    riderRating: { type: Number, min: 1, max: 5 },
    driverRating: { type: Number, min: 1, max: 5 },
    riderFeedback: { type: String },
    driverFeedback: { type: String },
    
    // Payment information
    paymentMethod: { 
      type: String, 
      enum: ["card", "wallet", "cash"],
      default: "wallet"
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    
    // Ride metrics
    distance: { type: Number }, // in kilometers
    duration: { type: Number }, // in minutes
    
    // Optional fields for more complex scenarios
    promoCodeApplied: { type: String },
    discountAmount: { type: Number, default: 0 },
    
    // For carpooling options
    maxPassengers: { type: Number, default: 1 },
    currentPassengers: { type: Number, default: 1 },
    
    // For scheduled rides
    reminderSent: { type: Boolean, default: false },
  },
  { 
    timestamps: true,
    // Add virtual fields when converting to JSON or object
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Calculate distance between two coordinates
rideSchema.statics.calculateDistance = function(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

// Helper function to convert degrees to radians
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Calculate price based on distance
rideSchema.statics.calculatePrice = function(lat1, lon1, lat2, lon2) {
  const distance = this.calculateDistance(lat1, lon1, lat2, lon2);
  const basePrice = 50;
  const pricePerKm = 10;
  return Math.round(basePrice + (distance * pricePerKm));
};

// Virtual for ride status in human-readable format
rideSchema.virtual('statusFormatted').get(function() {
  const statusMap = {
    'scheduled': 'Scheduled',
    'accepted': 'Driver Assigned',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for estimated pickup time (for scheduled rides)
rideSchema.virtual('estimatedPickupTime').get(function() {
  if (this.date && this.time) {
    const [hours, minutes] = this.time.split(':');
    const pickupDate = new Date(this.date);
    pickupDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return pickupDate;
  }
  return null;
});

// Pre-save hook to set distance
rideSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('originCoords') || this.isModified('destinationCoords')) {
    if (this.originCoords && this.destinationCoords) {
      this.distance = mongoose.model('Ride').calculateDistance(
        this.originCoords.lat,
        this.originCoords.lng,
        this.destinationCoords.lat,
        this.destinationCoords.lng
      );
    }
  }
  next();
});

const Ride = mongoose.model("Ride", rideSchema);
module.exports = Ride;