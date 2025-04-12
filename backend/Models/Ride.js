// Mongoose Schema for Ride Model with Ratings and Feedback

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Location schema to store both address and coordinates
const LocationSchema = new Schema({
  address: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  }
});

// Feedback schema for both rider and driver
const FeedbackSchema = new Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String
  },
  tags: {
    type: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const RideSchema = new Schema({
  // User IDs
  riderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driverId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Location information with coordinates
  pickup: {
    type: LocationSchema,
    required: true
  },
  dropoff: {
    type: LocationSchema,
    required: true
  },
  
  // Ride status
  status: {
    type: String,
    enum: ['requested', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'requested'
  },
  
  // Simplified fare structure
  fare: {
    type: Number,
    default: 0
  },
  
  // Payment information
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'cash', 'wallet'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  
  // Feedback and ratings
  riderFeedback: {
    type: FeedbackSchema
  },
  driverFeedback: {
    type: FeedbackSchema
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

// Add geospatial indexes for location-based queries
RideSchema.index({ 'pickup.longitude': 1, 'pickup.latitude': 1 });
RideSchema.index({ 'dropoff.longitude': 1, 'dropoff.latitude': 1 });

// Add regular indexes for frequent queries
RideSchema.index({ riderId: 1 });
RideSchema.index({ driverId: 1 });
RideSchema.index({ status: 1 });

// Method to add rider feedback
RideSchema.methods.addRiderFeedback = function(rating, comment, tags = []) {
  if (this.status !== 'completed') {
    throw new Error('Cannot add feedback until ride is completed');
  }
  
  this.riderFeedback = {
    rating,
    comment,
    tags,
    createdAt: new Date()
  };
  
  return this.riderFeedback;
};

// Method to add driver feedback
RideSchema.methods.addDriverFeedback = function(rating, comment, tags = []) {
  if (this.status !== 'completed') {
    throw new Error('Cannot add feedback until ride is completed');
  }
  
  this.driverFeedback = {
    rating,
    comment,
    tags,
    createdAt: new Date()
  };
  
  return this.driverFeedback;
};

// Static method to find nearby ride requests
RideSchema.statics.findNearbyRequests = function(coordinates, maxDistance = 5000) {
  return this.find({
    status: 'requested',
    'pickup.longitude': { $gte: coordinates.longitude - 0.05, $lte: coordinates.longitude + 0.05 },
    'pickup.latitude': { $gte: coordinates.latitude - 0.05, $lte: coordinates.latitude + 0.05 }
  }).sort({ createdAt: 1 });
};

// Create the model
const Ride = mongoose.model('Ride', RideSchema);

module.exports = Ride;
