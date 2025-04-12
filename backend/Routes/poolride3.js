const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Ride = require('../Models/PoolRide');
const auth = require('../middleware/RiderAuth');

// Get a specific ride by ID
router.get('/:id', auth, async (req, res) => {
  try {
    // Use lean() to get plain JavaScript objects instead of Mongoose documents
    const ride = await Ride.findById(req.params.id).lean();
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if the user requesting is either the rider or the driver
    const isAuthorized = 
      (ride.user && ride.user.toString() === req.user.id) || 
      (ride.driver && ride.driver.user && ride.driver.user.toString() === req.user.id) ||
      ride.passengers.some(p => p.user && p.user.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to view this ride' });
    }

    res.json(ride);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Cancel a ride
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if the user requesting is either the rider, driver, or passenger
    const isAuthorized = 
      (ride.user && ride.user.toString() === req.user.id) || 
      (ride.driver && ride.driver.user && ride.driver.user.toString() === req.user.id) ||
      ride.passengers.some(p => p.user && p.user.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to cancel this ride' });
    }

    // Different cancellation scenarios
    if (ride.user && ride.user.toString() === req.user.id) {
      // If the ride creator is cancelling
      ride.status = 'cancelled';
      ride.cancelReason = req.body.reason || 'Cancelled by ride creator';
    } else if (ride.driver && ride.driver.user && ride.driver.user.toString() === req.user.id) {
      // If the driver is cancelling
      ride.status = 'cancelled';
      ride.cancelReason = req.body.reason || 'Cancelled by driver';
    } else {
      // If a passenger is cancelling their spot
      const passengerIndex = ride.passengers.findIndex(
        p => p.user && p.user.toString() === req.user.id
      );
      
      if (passengerIndex !== -1) {
        ride.passengers[passengerIndex].status = 'cancelled';
        ride.seatsAvailable = (ride.seatsAvailable || 0) + 1;
      }
    }

    ride.updatedAt = Date.now();
    await ride.save();

    res.json({ message: 'Ride cancelled successfully', ride });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get rides where the current user is ONLY a passenger
// Get rides where the current user is ONLY a passenger
// ...

router.get('/get/passenger', auth, async (req, res) => {
  try {
    console.log('Fetching passenger rides for user:', req.user.id);
    
    // Convert string ID to ObjectId for proper MongoDB comparison
    // Use the "new" keyword to create an ObjectId instance
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    // Find rides where user is a passenger
    const passengerRides = await Ride.find({
      'passengers.user': userId
    })
    .sort({ dateTime: -1 })
    .lean();
    
    console.log(`Found ${passengerRides.length} passenger rides`);
    
    res.json(passengerRides);
  } catch (err) {
    console.error('Error in get/passenger endpoint:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all rides for current user (as rider, driver, or passenger)
router.get('/get/all', auth, async (req, res) => {
  try {
    // Find rides where user is the creator
    const createdRides = await Ride.find({ user: req.user.id })
      .sort({ dateTime: -1 })
      .limit(10)
      .lean();
    
    // Find rides where user is the driver
    const driverRides = await Ride.find({ 'driver.user': req.user.id })
      .sort({ dateTime: -1 })
      .limit(10)
      .lean();
    
    // Find rides where user is a passenger
    const passengerRides = await Ride.find({ 'passengers.user': req.user.id })
      .sort({ dateTime: -1 })
      .limit(10)
      .lean();
    
    // Combine and sort all rides
    const allRides = [...createdRides, ...driverRides, ...passengerRides]
      .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    
    res.json(allRides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;