// routes/rideRoutes.js
const express = require('express');
const router = express.Router();
const rideController = require('../controllers/ride');

// Route to estimate ride fare and details
router.post('/estimate', rideController.estimateRide);

// Route to book a new ride
router.post('/', rideController.bookRide);

// Route to get ride by ID
router.get('/:id', rideController.getRideById);

// Route to update ride status
router.patch('/:id/status', rideController.updateRideStatus);

// Route to cancel a ride
router.post('/:id/cancel', rideController.cancelRide);

// Route to get nearby drivers
router.get('/nearby-drivers', rideController.getNearbyDrivers);

// Route to get rider's ride history
router.get('/history/rider/:riderId', rideController.getRiderRideHistory);

// Route to get driver's ride history
router.get('/history/driver/:driverId', rideController.getDriverRideHistory);

// Route to provide rating and feedback
router.post('/:id/feedback', rideController.provideFeedback);

module.exports = router;