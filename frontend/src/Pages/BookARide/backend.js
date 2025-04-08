
// MongoDB schema for backend integration
/*
// models/Booking.js
const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  }
});

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  pickupLocation: {
    type: locationSchema,
    required: true
  },
  dropoffLocation: {
    type: locationSchema,
    required: true
  },
  rideType: {
    type: String,
    enum: ['Economy', 'Premium', 'XL'],
    required: true
  },
  distance: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  fare: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'wallet'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  passengerCount: {
    type: Number,
    default: 1
  },
  notes: String,
  promoCode: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add pre-save hook to generate booking ID
bookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.bookingId = `RIDE${timestamp}${random}`;
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
*/

// Express routes for backend integration
/*
// routes/bookings.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const Driver = require('../models/Driver');
const auth = require('../middleware/auth');

// Create a new booking
router.post('/', auth, async (req, res) => {
  try {
    const {
      pickupLocation,
      dropoffLocation,
      rideType,
      fare,
      distance,
      duration,
      paymentMethod,
      passengerCount,
      notes,
      promoCode
    } = req.body;

    // Create new booking
    const booking = new Booking({
      userId: req.user.id,
      pickupLocation,
      dropoffLocation,
      rideType,
      fare,
      distance,
      duration,
      paymentMethod,
      passengerCount,
      notes,
      promoCode
    });

    // Save booking to database
    await booking.save();

    // Find nearest available driver
    const driver = await findNearestDriver(pickupLocation.coordinates, rideType);
    
    if (driver) {
      booking.driverId = driver._id;
      booking.status = 'accepted';
      await booking.save();
      
      // Send notification to driver
      // sendDriverNotification(driver, booking);
      
      res.status(201).json({
        success: true,
        bookingId: booking.bookingId,
        driver: {
          id: driver._id,
          name: driver.name,
          rating: driver.rating,
          vehicle: driver.vehicle,
          photo: driver.photo,
          phone: driver.phone
        }
      });
    } else {
      res.status(201).json({
        success: true,
        bookingId: booking.bookingId,
        message: 'Finding a driver for you...'
      });
      
      // In real-world app, start a background process to find a driver
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Cancel a booking
router.post('/:bookingId/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ 
      bookingId: req.params.bookingId,
      userId: req.user.id
    });
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Check if booking can be cancelled
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Booking cannot be cancelled as it is already ${booking.status}` 
      });
    }
    
    booking.status = 'cancelled';
    await booking.save();
    
    // If driver was assigned, notify them about cancellation
    if (booking.driverId) {
      // sendCancellationToDriver(booking.driverId, booking.bookingId);
    }
    
    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get booking history for current user
router.get('/history', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);
      
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching booking history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get booking details by ID
router.get('/:bookingId', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ 
      bookingId: req.params.bookingId,
      userId: req.user.id
    });
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // If driver is assigned, get driver details
    let driverDetails = null;
    if (booking.driverId) {
      const driver = await Driver.findById(booking.driverId);
      if (driver) {
        driverDetails = {
          name: driver.name,
          rating: driver.rating,
          vehicle: driver.vehicle,
          photo: driver.photo,
          phone: driver.phone
        };
      }
    }
    
    res.json({ 
      success: true, 
      booking,
      driver: driverDetails
    });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Helper function to find nearest driver
async function findNearestDriver(coordinates, rideType) {
  try {
    // In a real app, you would use MongoDB's geospatial queries
    const drivers = await Driver.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [coordinates.lng, coordinates.lat]
          },
          $maxDistance: 5000 // 5 km
        }
      },
      'vehicle.type': rideType,
      isAvailable: true
    }).limit(1);
    
    return drivers[0] || null;
  } catch (error) {
    console.error('Error finding nearest driver:', error);
    return null;
  }
}

module.exports = router;
*/