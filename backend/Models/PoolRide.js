const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// GeoJSON Point Schema
const PointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: false
  }
});

// Create ride schema
const RideSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: false
  },
  driver: {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: false
    },
    name: {
      type: String,
      required: false
    },
    avatar: {
      type: String
    }
  },
  origin: {
    type: String,
    required: false
  },
  destination: {
    type: String,
    required: false
  },
  originCoords: {
    type: PointSchema,
    required: false
  },
  destinationCoords: {
    type: PointSchema,
    required: false
  },
  date: {
    type: String,
    required: false
  },
  time: {
    type: String,
    required: false
  },
  dateTime: {
    type: Date,
    required: false
  },
  seats: {
    type: Number,
    required: false,
    min: 1
  },
  seatsAvailable: {
    type: Number,
    required: false,
    min: 0
  },
  fare: {
    type: Number,
    required: false,
    min: 0
  },
  vehicleType: {
    type: String,
    required: false,
    enum: ['Car', 'SUV', 'VAN', 'BIKE', 'Other']
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  
  // Pooling enhancement fields
  isFlexiblePickup: {
    type: Boolean,
    default: false
  },
  pickupRadius: {
    type: Number,
    default: 1
  },
  isRecurringRide: {
    type: Boolean,
    default: false
  },
  recurringDays: [{
    type: String,
  }],
  isRecurringInstance: {
    type: Boolean,
    default: false
  },
  parentRideId: {
    type: Schema.Types.ObjectId,
    ref: 'ride'
  },
  allowDetour: {
    type: Boolean,
    default: false
  },
  maxDetourDistance: {
    type: Number,
    default: 2
  },
  maxWaitTime: {
    type: Number,
    default: 10
  },
  
  // Passenger information
  passengers: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
      },
      name: {
        type: String
      },
      avatar: {
        type: String
      },
      pickupLocation: {
        address: {
          type: String
        },
        coordinates: {
          type: PointSchema
        }
      },
      dropoffLocation: {
        address: {
          type: String
        },
        coordinates: {
          type: PointSchema
        }
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'cancelled'],
        default: 'pending'
      },
      requestedAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date
      }
    }
  ],
  
  // Suggested pickup and dropoff points
  suggestedPickupPoints: [
    {
      name: {
        type: String
      },
      address: {
        type: String
      },
      coords: {
        lat: Number,
        lng: Number
      }
    }
  ],
  suggestedDropoffPoints: [
    {
      name: {
        type: String
      },
      address: {
        type: String
      },
      coords: {
        lat: Number,
        lng: Number
      }
    }
  ],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for geospatial queries
RideSchema.index({ originCoords: '2dsphere' });
RideSchema.index({ destinationCoords: '2dsphere' });

// Pre-save middleware to update the updatedAt field
RideSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('PoolRides', RideSchema);