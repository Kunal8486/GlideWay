const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Ride = require('../Models/PoolRide');
const User = require('../Models/Rider');
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;


// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });
  
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ error: "Forbidden: Invalid token" });
      req.user = decoded;
      next();
    });
  };


// Helper function to convert string coordinates to GeoJSON Point
const convertToGeoJSONPoint = (coordsString) => {
  if (!coordsString) return null;
  
  const [lat, lng] = coordsString.split(',').map(Number);
  if (isNaN(lat) || isNaN(lng)) {
    throw new Error('Invalid coordinates format. Expected "latitude,longitude"');
  }
  
  // GeoJSON uses [longitude, latitude] order
  return {
    type: 'Point',
    coordinates: [lng, lat]
  };
};

/**
 * @route   POST api/rides/createpool
 * @desc    Create a new ride with pooling options
 * @access  Private
 */
router.post('/createpool', authenticateToken, [
  
  [
    check('origin', 'Origin location is required').not().isEmpty(),
    check('destination', 'Destination location is required').not().isEmpty(),
    check('originCoords', 'Origin coordinates are required').not().isEmpty(),
    check('destinationCoords', 'Destination coordinates are required').not().isEmpty(),
    check('date', 'Date is required').not().isEmpty(),
    check('time', 'Time is required').not().isEmpty(),
    check('seats', 'Number of seats is required').isInt({ min: 1 }),
    check('fare', 'Fare amount is required').isNumeric(),
    check('vehicleType', 'Vehicle type is required').isIn(['Car','COMPACT SUV', 'SUV', 'VAN', 'BIKE', 'Other']),
    check('pickupRadius').optional().isFloat({ min: 0 }),
    check('maxDetourDistance').optional().isFloat({ min: 0 }),
    check('maxWaitTime').optional().isInt({ min: 0 })
  ]
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Get current user details
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Format date and time
    const { date, time } = req.body;
    const dateTime = new Date(`${date}T${time}`);
    
    // Check if the ride time is in the future
    if (dateTime < new Date()) {
      return res.status(400).json({ message: 'Cannot create a ride in the past' });
    }

    // Process coordinates
    let originCoords, destinationCoords;
    try {
      originCoords = convertToGeoJSONPoint(req.body.originCoords);
      destinationCoords = convertToGeoJSONPoint(req.body.destinationCoords);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // Create ride object with all fields
    const rideFields = {
      user: req.user.id,
      driver: {
        user: req.user.id,
        name: user.name,
        avatar: user.avatar
      },
      origin: req.body.origin,
      destination: req.body.destination,
      originCoords,
      destinationCoords,
      date: req.body.date,
      time: req.body.time,
      dateTime,
      seats: req.body.seats,
      seatsAvailable: req.body.seats, // Initially all seats are available
      fare: req.body.fare,
      vehicleType: req.body.vehicleType,
      notes: req.body.notes || '',
      
      // Pooling options
      isFlexiblePickup: Boolean(req.body.isFlexiblePickup),
      pickupRadius: req.body.isFlexiblePickup ? parseFloat(req.body.pickupRadius) : 0,
      isRecurringRide: Boolean(req.body.isRecurringRide),
      recurringDays: req.body.isRecurringRide ? req.body.recurringDays : [],
      allowDetour: Boolean(req.body.allowDetour),
      maxDetourDistance: req.body.allowDetour ? parseFloat(req.body.maxDetourDistance) : 0,
      maxWaitTime: req.body.allowDetour ? parseInt(req.body.maxWaitTime) : 0,
      
      // Store suggested pickup/dropoff points if provided
      suggestedPickupPoints: req.body.suggestedPickupPoints || [],
      suggestedDropoffPoints: req.body.suggestedDropoffPoints || []
    };

    // Create the ride
    const ride = new Ride(rideFields);
    await ride.save();

    // If it's a recurring ride, create instances for future dates
    if (rideFields.isRecurringRide && rideFields.recurringDays.length > 0) {
      await createRecurringRideInstances(ride);
    }

    res.json({ 
      message: 'Ride created successfully',
      ride: {
        id: ride._id,
        origin: ride.origin,
        destination: ride.destination,
        date: ride.date,
        time: ride.time
      }
    });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET api/rides/nearby-pickup-points
 * @desc    Get nearby pickup points
 * @access  Private
 */
router.get('/nearby-pickup-points',authenticateToken,  async (req, res) => {
  try {
    const { lat, lng, radius = 1 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Convert string parameters to numbers
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadius = parseFloat(radius);
    
    if (isNaN(latitude) || isNaN(longitude) || isNaN(searchRadius)) {
      return res.status(400).json({ message: 'Invalid coordinates or radius' });
    }

    // Find nearby pickup points from database
    // This could query a Points of Interest collection or use external APIs
    // For now, we'll return a mock response
    const places = [
      {
        name: 'Central Bus Station',
        address: 'Main St, Downtown',
        coords: {
          lat: latitude + 0.002,
          lng: longitude - 0.001
        }
      },
      {
        name: 'City Mall',
        address: 'Shopping District',
        coords: {
          lat: latitude - 0.001,
          lng: longitude + 0.002
        }
      },
      {
        name: 'University Campus',
        address: 'Academic Avenue',
        coords: {
          lat: latitude + 0.003,
          lng: longitude + 0.003
        }
      }
    ];

    res.json({ places });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET api/rides/frequent-locations
 * @desc    Get user's frequent locations
 * @access  Private
 */
router.get('/frequent-locations', authenticateToken, async (req, res) => {
  try {
    // Get user's previous ride origins and destinations
    const userRides = await Ride.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Extract unique locations
    const locationMap = new Map();
    
    userRides.forEach(ride => {
      // Add origin
      if (!locationMap.has(ride.origin)) {
        locationMap.set(ride.origin, {
          name: ride.origin,
          type: 'origin',
          coords: {
            lat: ride.originCoords.coordinates[1],
            lng: ride.originCoords.coordinates[0]
          },
          frequency: 1
        });
      } else {
        const location = locationMap.get(ride.origin);
        location.frequency += 1;
        locationMap.set(ride.origin, location);
      }
      
      // Add destination
      if (!locationMap.has(ride.destination)) {
        locationMap.set(ride.destination, {
          name: ride.destination,
          type: 'destination',
          coords: {
            lat: ride.destinationCoords.coordinates[1],
            lng: ride.destinationCoords.coordinates[0]
          },
          frequency: 1
        });
      } else {
        const location = locationMap.get(ride.destination);
        location.frequency += 1;
        locationMap.set(ride.destination, location);
      }
    });
    
    // Convert to array and sort by frequency 
    const locations = Array.from(locationMap.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5); // Return top 5
    
    res.json({ locations });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

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

/**
 * Helper function to create recurring ride instances
 * @param {Object} parentRide - The parent ride object
 */
async function createRecurringRideInstances(parentRide) {
  try {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const recurringDays = parentRide.recurringDays;
    const parentDate = new Date(parentRide.dateTime);
    
    // Create instances for the next 4 weeks
    for (let weekOffset = 1; weekOffset <= 4; weekOffset++) {
      for (const day of recurringDays) {
        // Find the next occurrence of this day
        const dayIndex = weekdays.indexOf(day);
        if (dayIndex === -1) continue;
        
        // Clone the parent date
        const instanceDate = new Date(parentDate);
        
        // Calculate days to add to get to the next occurrence
        const daysToAdd = (dayIndex - instanceDate.getDay() + 7) % 7 + (7 * weekOffset);
        instanceDate.setDate(instanceDate.getDate() + daysToAdd);
        
        // Create a new ride instance
        const rideInstance = new Ride({
          ...parentRide.toObject(),
          _id: new mongoose.Types.ObjectId(),
          dateTime: instanceDate,
          date: instanceDate.toISOString().split('T')[0],
          isRecurringInstance: true,
          parentRideId: parentRide._id,
          passengers: [], // Reset passengers for the new instance
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        
        await rideInstance.save();
      }
    }
  } catch (err) {
    console.error('Error creating recurring ride instances:', err);
    // Don't throw error - just log it
  }
}

module.exports = router;