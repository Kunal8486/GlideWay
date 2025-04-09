const express = require('express');
const axios = require('axios');
const router = express.Router();
const Ride = require('../Models/PoolRide');
const { body, validationResult } = require('express-validator');

// Google Maps Geocoding Middleware
const getCoordinates = async (address) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status === 'OK') {
      return response.data.results[0].geometry.location;
    }
    return null;
  } catch (error) {
    console.error('Geocoding Error:', error);
    return null;
  }
};

/**
 * @route   POST api/rides/createpool
 * @desc    Create a new carpooling ride
 * @access  Private
 */
router.post('/createpool',[
  
  // Input validation
  body('origin', 'Origin location is required').notEmpty(),
  body('destination', 'Destination location is required').notEmpty(),
  body('date', 'Date is required').notEmpty(),
  body('time', 'Time is required').notEmpty(),
  body('seats', 'Available seats must be a number between 1 and 8').isInt({ min: 1, max: 8 }),
  body('fare', 'Fare must be a non-negative number').isNumeric({ min: 0 }),
  body('vehicleType', 'Vehicle type is required').notEmpty(),
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Extract all fields from request body
    const {
      origin,
      destination,
      originCoords,
      destinationCoords,
      date,
      time,
      seats,
      fare,
      vehicleType,
      notes,
      isFlexiblePickup,
      pickupRadius,
      isRecurringRide,
      recurringDays,
      allowDetour,
      maxDetourDistance,
      maxWaitTime
    } = req.body;

    // Parse coordinates string into object with lat/lng if they exist
    let originLocation = null;
    let destinationLocation = null;

    if (originCoords) {
      const [lat, lng] = originCoords.split(',').map(coord => parseFloat(coord.trim()));
      originLocation = {
        type: 'Point',
        coordinates: [lng, lat] // GeoJSON format: [longitude, latitude]
      };
    }

    if (destinationCoords) {
      const [lat, lng] = destinationCoords.split(',').map(coord => parseFloat(coord.trim()));
      destinationLocation = {
        type: 'Point',
        coordinates: [lng, lat] // GeoJSON format: [longitude, latitude]
      };
    }

    // Combine date and time for departure time
    const departureTime = new Date(`${date}T${time}`);
    // Validate that departure time is in the future
    if (departureTime < new Date()) {
      return res.status(400).json({ message: 'Departure time cannot be in the past' });
    }

    // Create new ride object
    const newRide = new Ride({
      driver: req.user.id, 
      origin: {
        address: origin,
        location: originLocation
      },
      destination: {
        address: destination,
        location: destinationLocation
      },
      departureTime,
      availableSeats: parseInt(seats),
      fare: parseFloat(fare),
      vehicleType,
      notes: notes || '',
      // Pooling options
      flexiblePickup: {
        enabled: isFlexiblePickup || false,
        radius: isFlexiblePickup ? parseFloat(pickupRadius) : 0
      },
      recurring: {
        isRecurring: isRecurringRide || false,
        days: isRecurringRide ? recurringDays : []
      },
      detour: {
        allowed: allowDetour || false,
        maxDistance: allowDetour ? parseFloat(maxDetourDistance) : 0,
        maxWaitTime: allowDetour ? parseInt(maxWaitTime) : 0
      },
      status: 'active'
    });

    // Save the ride to database
    const ride = await newRide.save();

    // Update user's frequent locations if necessary
    if (originLocation) {
      try {
        await User.findByIdAndUpdate(req.user.id, {
          $push: {
            frequentLocations: {
              name: origin,
              coords: {
                lat: originLocation.coordinates[1],
                lng: originLocation.coordinates[0]
              },
              count: 1,
              lastUsed: new Date()
            }
          }
        });
      } catch (err) {
        console.error('Error updating user frequent locations:', err);
        // Non-critical error, continue anyway
      }
    }

    // If it's a recurring ride, create the first set of recurring instances
    if (isRecurringRide && recurringDays.length > 0) {
      await createRecurringRideInstances(ride, recurringDays, req.user.id);
    }

    res.status(201).json({
      message: 'Ride created successfully',
      ride: {
        id: ride._id,
        origin: ride.origin.address,
        destination: ride.destination.address,
        departureTime: ride.departureTime,
        availableSeats: ride.availableSeats,
        fare: ride.fare,
        vehicleType: ride.vehicleType
      }
    });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Helper function to create recurring ride instances
 */
async function createRecurringRideInstances(baseRide, recurringDays, userId) {
  try {
    const dayMapping = {
      'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 0
    };

    const baseDate = new Date(baseRide.departureTime);
    const baseDay = baseDate.getDay();
    
    // Create 4 weeks of recurring rides
    const recurringRides = [];
    
    for (let weekOffset = 1; weekOffset <= 4; weekOffset++) {
      for (const day of recurringDays) {
        const dayNum = dayMapping[day];
        if (dayNum === baseDay && weekOffset === 1) continue; // Skip first occurrence of the same day
        
        // Calculate days to add
        let daysToAdd = (dayNum - baseDay + 7) % 7; // Days until the next occurrence of this day
        daysToAdd += (weekOffset - 1) * 7; // Add weeks
        
        if (daysToAdd > 0) {
          const newDate = new Date(baseDate);
          newDate.setDate(baseDate.getDate() + daysToAdd);
          
          const recurringRide = new Ride({
            driver: userId,
            origin: baseRide.origin,
            destination: baseRide.destination,
            departureTime: newDate,
            availableSeats: baseRide.availableSeats,
            fare: baseRide.fare,
            vehicleType: baseRide.vehicleType,
            notes: baseRide.notes,
            flexiblePickup: baseRide.flexiblePickup,
            detour: baseRide.detour,
            recurring: {
              isRecurring: true,
              days: recurringDays,
              parentRideId: baseRide._id
            },
            status: 'scheduled'
          });
          
          recurringRides.push(recurringRide);
        }
      }
    }
    
    if (recurringRides.length > 0) {
      await Ride.insertMany(recurringRides);
    }
  } catch (error) {
    console.error('Error creating recurring rides:', error);
    // This is a non-critical error, the base ride was still created
  }
}

// Route to get nearby pickup/dropoff points
router.get('/nearby-pickup-points',  async (req, res) => {
  const { lat, lng, radius = 1000 } = req.query; // radius in meters
  
  if (!lat || !lng) {
    return res.status(400).json({ message: 'Latitude and longitude are required' });
  }
  
  try {
    // Query for popular pickup points based on previous rides
    const popularPoints = await Ride.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: 'distance',
          maxDistance: parseInt(radius),
          spherical: true,
          query: { 'status': { $in: ['completed', 'active'] } }
        }
      },
      {
        $group: {
          _id: '$origin.address',
          count: { $sum: 1 },
          location: { $first: '$origin.location' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    const places = popularPoints.map(point => ({
      name: point._id.split(',')[0],
      address: point._id,
      coords: {
        lat: point.location.coordinates[1],
        lng: point.location.coordinates[0]
      }
    }));
    
    res.json({ places });
  } catch (error) {
    console.error('Error fetching pickup points:', error);
    res.status(500).json({ message: 'Error fetching pickup points' });
  }
});

router.get('/nearby-dropoff-points',  async (req, res) => {
  const { lat, lng, radius = 1000 } = req.query; // radius in meters
  
  if (!lat || !lng) {
    return res.status(400).json({ message: 'Latitude and longitude are required' });
  }
  
  try {
    // Query for popular dropoff points based on previous rides
    const popularPoints = await Ride.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: 'distance',
          maxDistance: parseInt(radius),
          spherical: true,
          query: { 'status': { $in: ['completed', 'active'] } }
        }
      },
      {
        $group: {
          _id: '$destination.address',
          count: { $sum: 1 },
          location: { $first: '$destination.location' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    const places = popularPoints.map(point => ({
      name: point._id.split(',')[0],
      address: point._id,
      coords: {
        lat: point.location.coordinates[1],
        lng: point.location.coordinates[0]
      }
    }));
    
    res.json({ places });
  } catch (error) {
    console.error('Error fetching dropoff points:', error);
    res.status(500).json({ message: 'Error fetching dropoff points' });
  }
});

// Search Rides
router.get('/poolsearch', async (req, res) => {
  try {
    const { origin, destination, minSeats, maxFare } = req.query;

    const query = {};
    if (origin) query.origin = { $regex: origin, $options: 'i' };
    if (destination) query.destination = { $regex: destination, $options: 'i' };
    if (minSeats) query.availableSeats = { $gte: parseInt(minSeats) };
    if (maxFare) query.fare = { $lte: parseFloat(maxFare) };

    const rides = await Ride.find(query);
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route Calculation (Example route, can be placed here or in a separate route file)
router.get('/poolroute', async (req, res) => {
  try {
    const { origin, destination } = req.query;
    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin: origin,
        destination: destination,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
