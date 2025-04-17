const express = require('express');
const router = express.Router();
const Ride = require('../Models/ScheduleRide');
const Rider = require('../Models/Rider');
const Driver = require('../models/Driver');
const mongoose = require('mongoose');
const auth = require('../middleware/RiderAuth'); 

// @route   POST api/rides/schedule
// @desc    Schedule a new ride
// @access  Private
router.post('/schedule', auth, async (req, res) => {
  try {
    const {
      origin,
      destination,
      originCoords,
      destinationCoords,
      date,
      time,
      paymentMethod
    } = req.body;

    // Validate required fields
    if (!origin || !destination || !date || !time) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!originCoords || !destinationCoords) {
      return res.status(400).json({ message: 'Coordinates are required' });
    }

    // Get rider from authenticated user
    const rider = await Rider.findById(req.user.id);
    if (!rider) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    // Calculate estimated price
    const estimatedPrice = Ride.calculatePrice(
      originCoords.lat,
      originCoords.lng,
      destinationCoords.lat,
      destinationCoords.lng
    );

    // Create new ride
    const ride = new Ride({
      origin,
      destination,
      originCoords,
      destinationCoords,
      date,
      time,
      estimatedPrice,
      status: 'scheduled',
      riderId: rider._id,
      paymentMethod: paymentMethod || rider.preferred_payment || 'wallet'
    });

    // Calculate distance for the ride
    const distance = Ride.calculateDistance(
      originCoords.lat,
      originCoords.lng,
      destinationCoords.lat,
      destinationCoords.lng
    );
    ride.distance = distance;

    // Calculate estimated duration (rough estimate: 2 mins per km)
    ride.duration = Math.ceil(distance * 2);

    // Save the ride
    await ride.save();

    // Add ride to rider's history
    rider.ride_history.push(ride._id);
    await rider.save();

    // Find nearby available drivers
    const nearbyDrivers = await findNearbyDrivers(originCoords.lat, originCoords.lng);

    // Notify nearby drivers (implementation depends on your notification system)
    // This would typically use WebSockets or a similar real-time communication system
    // notifyDrivers(nearbyDrivers, ride);

    res.status(201).json({
      success: true,
      message: 'Ride scheduled successfully',
      ride,
      nearbyDrivers: nearbyDrivers.length
    });
  } catch (error) {
    console.error('Error scheduling ride:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Helper function to find nearby drivers
async function findNearbyDrivers(lat, lng, maxDistance = 5) {
  try {
    // Find drivers within maxDistance km who are available
    const drivers = await Driver.find({
      availability: true,
      status: 'approved',
      is_verified: true,
      location: {
        $exists: true,
        $ne: null
      }
    });

    // Filter drivers based on distance
    const nearbyDrivers = drivers.filter(driver => {
      if (!driver.location || !driver.location.latitude || !driver.location.longitude) {
        return false;
      }
      
      const distance = Ride.calculateDistance(
        lat, 
        lng, 
        driver.location.latitude, 
        driver.location.longitude
      );
      
      return distance <= maxDistance;
    });

    return nearbyDrivers;
  } catch (error) {
    console.error('Error finding nearby drivers:', error);
    return [];
  }
}

// @route   GET api/rides
// @desc    Get rides for authenticated user (rider or driver)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let rides = [];
    
    // Check if user is rider or driver
    const rider = await Rider.findById(req.user.id);
    if (rider) {
      // User is a rider, get their rides
      rides = await Ride.find({ riderId: req.user.id })
        .sort({ createdAt: -1 })
        .populate('driverId', 'name profile_picture_url rating vehicle_details');
    } else {
      // User might be a driver
      const driver = await Driver.findById(req.user.id);
      if (driver) {
        // User is a driver, get their rides
        rides = await Ride.find({ driverId: req.user.id })
          .sort({ createdAt: -1 })
          .populate('riderId', 'name profile_picture_url');
      } else {
        return res.status(404).json({ 
          success: false,
          message: 'User not found as rider or driver' 
        });
      }
    }
    
    res.json({
      success: true,
      count: rides.length,
      rides
    });
  } catch (error) {
    console.error('Error fetching rides:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET api/rides/:id
// @desc    Get ride by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('riderId', 'name profile_picture_url phone_number')
      .populate('driverId', 'name profile_picture_url phone_number vehicle_details rating');
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }
    
    // Check if user is authorized to view this ride (either rider or driver)
    if (ride.riderId._id.toString() !== req.user.id && 
       (!ride.driverId || ride.driverId._id.toString() !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this ride'
      });
    }
    
    res.json({
      success: true,
      ride
    });
  } catch (error) {
    console.error('Error fetching ride:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT api/rides/:id/cancel
// @desc    Cancel a scheduled ride
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }
    
    // Check if user is the rider who booked this ride
    if (ride.riderId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this ride'
      });
    }
    
    // Can only cancel if ride is scheduled or accepted
    if (ride.status !== 'scheduled' && ride.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ride that is already ${ride.status}`
      });
    }
    
    ride.status = 'cancelled';
    ride.cancelledAt = new Date();
    await ride.save();
    
    // If a driver was assigned, update their status
    if (ride.driverId) {
      const driver = await Driver.findById(ride.driverId);
      if (driver) {
        driver.availability = true;
        await driver.save();
        
        // Notify driver about cancellation (implementation depends on your notification system)
        // notifyDriver(driver._id, 'ride_cancelled', { rideId: ride._id });
      }
    }
    
    res.json({
      success: true,
      message: 'Ride cancelled successfully',
      ride
    });
  } catch (error) {
    console.error('Error cancelling ride:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT api/rides/:id/accept
// @desc    Driver accepts a ride
// @access  Private (Driver only)
router.put('/:id/accept', auth, async (req, res) => {
  try {
    // Check if user is a driver
    const driver = await Driver.findById(req.user.id);
    if (!driver) {
      return res.status(403).json({
        success: false,
        message: 'Only drivers can accept rides'
      });
    }
    
    // Check driver availability
    if (!driver.availability) {
      return res.status(400).json({
        success: false,
        message: 'You are currently unavailable to accept rides'
      });
    }
    
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }
    
    // Check if ride is still available
    if (ride.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept a ride that is already ${ride.status}`
      });
    }
    
    // Update ride status
    ride.status = 'accepted';
    ride.driverId = driver._id;
    ride.acceptedAt = new Date();
    await ride.save();
    
    // Update driver status
    driver.availability = false;
    driver.ride_history.push(ride._id);
    await driver.save();
    
    // Notify rider that their ride has been accepted
    // notifyRider(ride.riderId, 'ride_accepted', { rideId: ride._id, driverId: driver._id });
    
    res.json({
      success: true,
      message: 'Ride accepted successfully',
      ride
    });
  } catch (error) {
    console.error('Error accepting ride:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT api/rides/:id/start
// @desc    Driver starts the ride
// @access  Private (Driver only)
router.put('/:id/start', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }
    
    // Check if user is the assigned driver
    if (!ride.driverId || ride.driverId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to start this ride'
      });
    }
    
    // Can only start if ride is accepted
    if (ride.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: `Cannot start a ride that is ${ride.status}`
      });
    }
    
    ride.status = 'in-progress';
    ride.startedAt = new Date();
    await ride.save();
    
    // Notify rider that their ride has started
    // notifyRider(ride.riderId, 'ride_started', { rideId: ride._id });
    
    res.json({
      success: true,
      message: 'Ride started successfully',
      ride
    });
  } catch (error) {
    console.error('Error starting ride:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT api/rides/:id/complete
// @desc    Driver completes the ride
// @access  Private (Driver only)
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }
    
    // Check if user is the assigned driver
    if (!ride.driverId || ride.driverId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this ride'
      });
    }
    
    // Can only complete if ride is in progress
    if (ride.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: `Cannot complete a ride that is ${ride.status}`
      });
    }
    
    // Update ride status
    ride.status = 'completed';
    ride.completedAt = new Date();
    
    // Calculate final price (could adjust based on actual route taken)
    ride.actualPrice = ride.estimatedPrice;
    
    // Process payment
    const rider = await Rider.findById(ride.riderId);
    const driver = await Driver.findById(ride.driverId);
    
    if (ride.paymentMethod === 'wallet' && rider) {
      // Check if rider has enough balance
      if (rider.wallet_balance >= ride.actualPrice) {
        // Deduct from rider's wallet
        rider.wallet_balance -= ride.actualPrice;
        await rider.save();
        
        // Add to driver's wallet (minus platform fee, e.g., 20%)
        const platformFeePercentage = 0.2;
        const driverEarnings = ride.actualPrice * (1 - platformFeePercentage);
        
        if (driver) {
          driver.wallet_balance += driverEarnings;
          driver.availability = true;
          driver.completed_rides += 1;
          await driver.save();
        }
        
        ride.paymentStatus = 'completed';
      } else {
        ride.paymentStatus = 'failed';
        // Could implement fallback payment method here
      }
    } else if (ride.paymentMethod === 'cash') {
      // For cash payments, mark as completed and update driver availability
      ride.paymentStatus = 'completed';
      
      if (driver) {
        driver.availability = true;
        driver.completed_rides += 1;
        await driver.save();
      }
    } else {
      // Handle other payment methods (card, etc.)
      // Implementation depends on your payment processor
      ride.paymentStatus = 'completed';
      
      if (driver) {
        driver.availability = true;
        driver.completed_rides += 1;
        await driver.save();
      }
    }
    
    await ride.save();
    
    // Notify rider that their ride is complete
    // notifyRider(ride.riderId, 'ride_completed', { rideId: ride._id });
    
    res.json({
      success: true,
      message: 'Ride completed successfully',
      ride,
      paymentStatus: ride.paymentStatus
    });
  } catch (error) {
    console.error('Error completing ride:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST api/rides/:id/rate
// @desc    Rate a completed ride (for both rider and driver)
// @access  Private
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }
    
    // Check if ride is completed
    if (ride.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed rides'
      });
    }
    
    const isRider = ride.riderId.toString() === req.user.id;
    const isDriver = ride.driverId && ride.driverId.toString() === req.user.id;
    
    if (!isRider && !isDriver) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this ride'
      });
    }
    
    // Update the appropriate rating field
    if (isRider) {
      // Rider rating the driver
      ride.driverRating = rating;
      ride.driverFeedback = feedback || '';
      
      // Update driver's overall rating
      if (ride.driverId) {
        const driver = await Driver.findById(ride.driverId);
        if (driver) {
          // Calculate new average rating
          const totalRides = driver.completed_rides || 1;
          const currentRating = driver.rating || 0;
          const newRating = ((currentRating * (totalRides - 1)) + rating) / totalRides;
          
          driver.rating = newRating;
          await driver.save();
        }
      }
    } else {
      // Driver rating the rider
      ride.riderRating = rating;
      ride.riderFeedback = feedback || '';
      
      // Could implement rider rating system if needed
    }
    
    await ride.save();
    
    res.json({
      success: true,
      message: 'Rating submitted successfully',
      ride
    });
  } catch (error) {
    console.error('Error rating ride:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET api/rides/upcoming
// @desc    Get upcoming rides for the user
// @access  Private
router.get('/upcoming', auth, async (req, res) => {
  try {
    let query = {};
    
    // Check if user is rider or driver
    const rider = await Rider.findById(req.user.id);
    if (rider) {
      // User is a rider
      query = { 
        riderId: req.user.id,
        status: { $in: ['scheduled', 'accepted'] }
      };
    } else {
      // User might be a driver
      const driver = await Driver.findById(req.user.id);
      if (driver) {
        // User is a driver
        query = { 
          driverId: req.user.id,
          status: { $in: ['accepted'] }
        };
      } else {
        return res.status(404).json({ 
          success: false,
          message: 'User not found as rider or driver' 
        });
      }
    }
    
    const rides = await Ride.find(query)
      .sort({ date: 1, time: 1 })
      .populate('riderId', 'name profile_picture_url phone_number')
      .populate('driverId', 'name profile_picture_url phone_number vehicle_details');
    
    res.json({
      success: true,
      count: rides.length,
      rides
    });
  } catch (error) {
    console.error('Error fetching upcoming rides:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET api/rides/history
// @desc    Get ride history for the user
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    let query = {};
    
    // Check if user is rider or driver
    const rider = await Rider.findById(req.user.id);
    if (rider) {
      // User is a rider
      query = { 
        riderId: req.user.id,
        status: { $in: ['completed', 'cancelled'] }
      };
    } else {
      // User might be a driver
      const driver = await Driver.findById(req.user.id);
      if (driver) {
        // User is a driver
        query = { 
          driverId: req.user.id,
          status: { $in: ['completed', 'cancelled'] }
        };
      } else {
        return res.status(404).json({ 
          success: false,
          message: 'User not found as rider or driver' 
        });
      }
    }
    
    const rides = await Ride.find(query)
      .sort({ createdAt: -1 })
      .populate('riderId', 'name profile_picture_url')
      .populate('driverId', 'name profile_picture_url vehicle_details');
    
    res.json({
      success: true,
      count: rides.length,
      rides
    });
  } catch (error) {
    console.error('Error fetching ride history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;