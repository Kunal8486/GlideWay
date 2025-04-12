const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Ride = require('../Models/PoolRide');
const User = require('../Models/Rider');
const authenticateToken = require('../middleware/RiderAuth');


/**
 * @route   GET api/rides
 * @desc    Get all available rides
 * @access  Private 
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const rides = await Ride.find({ 
      status: 'active',
      seatsAvailable: { $gt: 0 },
      dateTime: { $gt: new Date() }
    })
    .sort({ dateTime: 1 })
    .populate('user', ['name', 'avatar']);
    
    res.json(rides);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET api/rides/myrides
 * @desc    Get all rides created by the user
 * @access  Private
 */
router.get('/myrides',  async (req, res) => {
  try {
    const rides = await Ride.find({ user: req.user.id })
      .sort({ dateTime: -1 });
      
    res.json(rides);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});



/**
 * @route   GET api/rides/mybookings
 * @desc    Get all rides booked by the user
 * @access  Private
 */
router.get('/mybookings',  async (req, res) => {
  try {
    const rides = await Ride.find({ 
      'passengers.user': req.user.id 
    }).sort({ dateTime: -1 });
    
    res.json(rides);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET api/rides/:id
 * @desc    Get ride by ID
 * @access  Private
 */
router.get('/:id',  async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('user', ['name', 'avatar'])
      .populate('passengers.user', ['name', 'avatar']);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    res.json(ride);
  } catch (err) {
    console.error('Server error:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST api/rides/:id/book
 * @desc    Book a seat on a ride
 * @access  Private
 */
router.post('/:id/book', authenticateToken,[
  
  [
    check('pickupLocation', 'Pickup location is required').not().isEmpty(),
    check('dropoffLocation', 'Dropoff location is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    // Check if ride is active and has available seats
    if (ride.status !== 'active') {
      return res.status(400).json({ message: 'This ride is no longer active' });
    }
    
    if (ride.seatsAvailable <= 0) {
      return res.status(400).json({ message: 'No seats available on this ride' });
    }
    
    // Check if ride is in the future
    if (new Date(ride.dateTime) < new Date()) {
      return res.status(400).json({ message: 'Cannot book a ride that has already departed' });
    }
    
    // Check if user is trying to book their own ride
    if (ride.user.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot book your own ride' });
    }
    
    // Check if user has already booked this ride
    if (ride.passengers.some(passenger => passenger.user.toString() === req.user.id)) {
      return res.status(400).json({ message: 'You have already booked this ride' });
    }
    
    // Get user details
    const user = await User.findById(req.user.id).select('-password');
    
    // Process pickup and dropoff coordinates
    let pickupCoordinates, dropoffCoordinates;
    try {
      pickupCoordinates = convertToGeoJSONPoint(req.body.pickupCoordinates);
      dropoffCoordinates = convertToGeoJSONPoint(req.body.dropoffCoordinates);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
    
    // Add user as passenger
    ride.passengers.push({
      user: req.user.id,
      name: user.name,
      avatar: user.avatar,
      pickupLocation: {
        address: req.body.pickupLocation,
        coordinates: pickupCoordinates
      },
      dropoffLocation: {
        address: req.body.dropoffLocation,
        coordinates: dropoffCoordinates
      },
      status: 'pending',
      requestedAt: Date.now()
    });
    
    // Update seats available
    ride.seatsAvailable -= 1;
    
    await ride.save();
    
    res.json({ 
      message: 'Ride booked successfully. Waiting for driver confirmation.',
      ride
    });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT api/rides/:id/passenger/:passenger_id
 * @desc    Update passenger status (accept/reject)
 * @access  Private
 */
router.put('/:id/passenger/:passenger_id',authenticateToken, [
  
  [
    check('status', 'Status is required').isIn(['accepted', 'rejected'])
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    // Check if user is the ride owner
    if (ride.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this ride' });
    }
    
    // Find the passenger
    const passengerIndex = ride.passengers.findIndex(
      p => p._id.toString() === req.params.passenger_id
    );
    
    if (passengerIndex === -1) {
      return res.status(404).json({ message: 'Passenger not found in this ride' });
    }
    
    // Update passenger status
    ride.passengers[passengerIndex].status = req.body.status;
    ride.passengers[passengerIndex].updatedAt = Date.now();
    
    // If rejected, increase seatsAvailable
    if (req.body.status === 'rejected' && ride.passengers[passengerIndex].status === 'pending') {
      ride.seatsAvailable += 1;
    }
    
    await ride.save();
    
    res.json({ 
      message: `Passenger ${req.body.status}`,
      ride
    });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT api/rides/:id/cancel
 * @desc    Cancel a ride
 * @access  Private
 */
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    // Check if user is the ride owner
    if (ride.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to cancel this ride' });
    }
    
    // Update ride status
    ride.status = 'cancelled';
    ride.updatedAt = Date.now();
    
    await ride.save();
    
    res.json({ 
      message: 'Ride cancelled successfully',
      ride
    });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT api/rides/:id/cancel-booking
 * @desc    Cancel a booking as a passenger
 * @access  Private
 */
router.put('/:id/cancel-booking', authenticateToken, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    // Find the passenger
    const passengerIndex = ride.passengers.findIndex(
      p => p.user.toString() === req.user.id
    );
    
    if (passengerIndex === -1) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Update passenger status
    const oldStatus = ride.passengers[passengerIndex].status;
    ride.passengers[passengerIndex].status = 'cancelled';
    ride.passengers[passengerIndex].updatedAt = Date.now();
    
    // If the passenger was accepted or pending, increase available seats
    if (oldStatus === 'accepted' || oldStatus === 'pending') {
      ride.seatsAvailable += 1;
    }
    
    await ride.save();
    
    res.json({ 
      message: 'Booking cancelled successfully',
      ride
    });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET api/rides/search
 * @desc    Search for rides with filters
 * @access  Private
 */
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const {
      near,
      destination,
      date,
      time,
      seats,
      maxFare,
      allowDetour
    } = req.query;
    
    // Build query object
    const query = { 
      status: 'active',
      seatsAvailable: { $gt: 0 },
      dateTime: { $gt: new Date() }
    };
    
    // Add date filter if provided
    if (date) {
      // Create date range for the specified date
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query.dateTime = { $gte: startDate, $lt: endDate };
    }
    
    // Add seats filter if provided
    if (seats) {
      query.seatsAvailable = { $gte: parseInt(seats) };
    }
    
    // Add fare filter if provided
    if (maxFare) {
      query.fare = { $lte: parseFloat(maxFare) };
    }
    
    // Add pooling filter if provided
    if (allowDetour === 'true') {
      query.allowDetour = true;
    }
    
    let rides;
    
    // If near (origin) coordinates are provided, use geospatial query
    if (near) {
      const [lat, lng] = near.split(',').map(Number);
      
      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ message: 'Invalid near coordinates' });
      }
      
      // Find rides with origin within certain distance
      rides = await Ride.find({
        ...query,
        originCoords: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat] // GeoJSON uses [lng, lat]
            },
            $maxDistance: 5000 // 5km in meters
          }
        }
      }).sort({ dateTime: 1 });
    } 
    // If destination coordinates are provided
    else if (destination) {
      const [lat, lng] = destination.split(',').map(Number);
      
      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ message: 'Invalid destination coordinates' });
      }
      
      // Find rides with destination within certain distance
      rides = await Ride.find({
        ...query,
        destinationCoords: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            $maxDistance: 5000
          }
        }
      }).sort({ dateTime: 1 });
    } 
    // If no coordinates provided, use regular query
    else {
      rides = await Ride.find(query).sort({ dateTime: 1 });
    }
    
    res.json(rides);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;