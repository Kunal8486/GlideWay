const express = require('express');
const router = express.Router();
const Ride = require('../Models/PoolRide');
const { check, validationResult } = require('express-validator');
const User = require('../Models/Rider');

const authenticateToken = require('../middleware/RiderAuth');

  // Helper function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Radius of the Earth in kilometers
  const R = 6371;
  
  // Convert degrees to radians
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  // Haversine formula
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
};

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
 * @route   GET /api/rides/pool/search
 * @desc    Search for carpool rides
 * @access  Private
 */
/**
 * @route   GET /api/rides/pool/search
 * @desc    Search for carpool rides
 * @access  Private
 */

router.get('/search', authenticateToken, async (req, res) => {
  try {
    const {
      origin,
      destination,
      originCoords,
      destinationCoords,
      date,
      time,
      seats,
      maxFare,
      maxDistance,
      includeRecurring,
      flexibleTiming,
      timeFlexibility,
      includeFlexiblePickup,
      includeDetours,
      maxDetourDistance,
      flexiblePickupRadius,
      vehicleType,
      

      nearbyDays
    } = req.query;

    // Parse coordinates
    let originLocation = null;
    let destinationLocation = null;

    if (originCoords) {
      const [lat, lng] = originCoords.split(',').map(Number);
      originLocation = {
        lat,
        lng
      };
    }

    if (destinationCoords) {
      const [lat, lng] = destinationCoords.split(',').map(Number);
      destinationLocation = {
        lat,
        lng
      };
    }

    // Start building the query
    let query = {
      status: 'active',
      seatsAvailable: { $gte: parseInt(seats) || 1 }
    };

    // Don't show user's own rides
    query['driver.user'] = { $ne: req.user.id };

    // Add date filter with nearby days flexibility
    if (date) {
      const searchDate = new Date(date);
      // Extract day of the week
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayOfWeek = days[searchDate.getDay()];
      
      // Create date ranges
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Handle nearby days if requested
      if (nearbyDays && parseInt(nearbyDays) > 0) {
        const daysRange = parseInt(nearbyDays);
        const dateBefore = new Date(searchDate);
        dateBefore.setDate(dateBefore.getDate() - daysRange);
        dateBefore.setHours(0, 0, 0, 0);
        
        const dateAfter = new Date(searchDate);
        dateAfter.setDate(dateAfter.getDate() + daysRange);
        dateAfter.setHours(23, 59, 59, 999);
        
        // Handle recurring and non-recurring rides
        if (includeRecurring === 'true') {
          query.$or = [
            // Match one-time rides within the extended date range
            {
              $and: [
                { isRecurringRide: false },
                { dateTime: { $gte: dateBefore, $lte: dateAfter } }
              ]
            },
            // Match recurring rides that might fall in the extended date range
            { isRecurringRide: true }
          ];
        } else {
          // Only match non-recurring rides in the extended date range
          query.isRecurringRide = false;
          query.dateTime = { $gte: dateBefore, $lte: dateAfter };
        }
      } else {
        // Original date filtering logic without nearby days
        if (includeRecurring === 'true') {
          query.$or = [
            // Match one-time rides on the specified date
            {
              $and: [
                { isRecurringRide: false },
                { dateTime: { $gte: startOfDay, $lte: endOfDay } }
              ]
            },
            // Match recurring rides for the day of week
            {
              $and: [
                { isRecurringRide: true },
                { recurringDays: dayOfWeek }
              ]
            }
          ];
        } else {
          // Only match non-recurring rides
          query.isRecurringRide = false;
          query.dateTime = { $gte: startOfDay, $lte: endOfDay };
        }
      }
    }

    // Add max fare filter
    if (maxFare && !isNaN(parseFloat(maxFare))) {
      query.fare = { $lte: parseFloat(maxFare) };
    }

    // Find rides based on available coordinates
    let rides = [];
    
    // Convert maxDistance from km to meters for MongoDB
    const maxDistanceMeters = parseFloat(maxDistance) * 1000 || 5000;
    
    // We need a larger search radius for flexible pickups and detours
    const expandedDistanceMeters = includeFlexiblePickup === 'true' || includeDetours === 'true' 
      ? maxDistanceMeters * 2  // Double the search radius for flexibility
      : maxDistanceMeters;
    
    if (originLocation) {
      // Query by origin location - only ONE geoNear operation
      const geoQuery = {
        ...query,
        'originCoords': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [originLocation.lng, originLocation.lat]
            },
            $maxDistance: expandedDistanceMeters
          }
        }
      };
      
      // *** FIX: Don't try to populate 'user', just get the driver info ***
      rides = await Ride.find(geoQuery)
        .sort({ dateTime: 1 });
        
      // If we also have destination coordinates, filter the results in-memory
      if (destinationLocation && rides.length > 0) {
        rides = rides.filter(ride => {
          if (!ride.destinationCoords || !ride.destinationCoords.coordinates) {
            return false;
          }
          
          const distance = calculateDistance(
            destinationLocation.lat,
            destinationLocation.lng,
            ride.destinationCoords.coordinates[1],
            ride.destinationCoords.coordinates[0]
          );
          
          // For rides with detours allowed, we'll be more lenient with the distance
          let effectiveMaxDistance = parseFloat(maxDistance) || 5;
          
          // If this ride allows detours and the user wants to include detours
          if (includeDetours === 'true' && ride.allowDetour) {
            effectiveMaxDistance += ride.maxDetourDistance || 0;
          }
          
          return distance <= effectiveMaxDistance;
        });
      }
      
      // Apply flexible pickup criteria in-memory filtering
      if (includeFlexiblePickup === 'true') {
        // For rides we found (within expanded radius), filter based on flexible pickup settings
        rides = rides.filter(ride => {
          // If the ride is close enough already, keep it
          if (ride.originCoords && ride.originCoords.coordinates) {
            const exactDistance = calculateDistance(
              originLocation.lat,
              originLocation.lng,
              ride.originCoords.coordinates[1],
              ride.originCoords.coordinates[0]
            );
            
            if (exactDistance <= (parseFloat(maxDistance) || 5)) {
              return true;
            }
          }
          
          // If it's further but has flexible pickup enabled, check if it's within the flexible range
          if (ride.isFlexiblePickup) {
            // If the ride has flexible pickup, calculate exact distance
            if (ride.originCoords && ride.originCoords.coordinates) {
              const exactDistance = calculateDistance(
                originLocation.lat,
                originLocation.lng,
                ride.originCoords.coordinates[1],
                ride.originCoords.coordinates[0]
              );
              
              // Check if it's within the ride's flexible pickup radius
              return exactDistance <= (parseFloat(maxDistance) || 5) + (ride.pickupRadius || 1);
            }
          }
          
          return false;
        });
      } else {
        // If not looking for flexible pickup, filter to exact matches only
        rides = rides.filter(ride => {
          if (ride.originCoords && ride.originCoords.coordinates) {
            const exactDistance = calculateDistance(
              originLocation.lat,
              originLocation.lng,
              ride.originCoords.coordinates[1],
              ride.originCoords.coordinates[0]
            );
            
            return exactDistance <= (parseFloat(maxDistance) || 5);
          }
          return false;
        });
      }
    } else if (destinationLocation) {
      // If only destination coordinates are provided - only ONE geoNear operation
      const geoQuery = {
        ...query,
        'destinationCoords': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [destinationLocation.lng, destinationLocation.lat]
            },
            $maxDistance: expandedDistanceMeters
          }
        }
      };
      
      // *** FIX: Don't try to populate 'user', just get the driver info ***
      rides = await Ride.find(geoQuery)
        .sort({ dateTime: 1 });
      
      // Apply detour criteria in-memory filtering
      if (includeDetours === 'true') {
        // Filter based on detour settings
        rides = rides.filter(ride => {
          // If the ride is close enough already, keep it
          if (ride.destinationCoords && ride.destinationCoords.coordinates) {
            const exactDistance = calculateDistance(
              destinationLocation.lat,
              destinationLocation.lng,
              ride.destinationCoords.coordinates[1],
              ride.destinationCoords.coordinates[0]
            );
            
            if (exactDistance <= (parseFloat(maxDistance) || 5)) {
              return true;
            }
          }
          
          // If it's further but allows detours, check if it's within the detour range
          if (ride.allowDetour) {
            // Calculate exact distance
            if (ride.destinationCoords && ride.destinationCoords.coordinates) {
              const exactDistance = calculateDistance(
                destinationLocation.lat,
                destinationLocation.lng,
                ride.destinationCoords.coordinates[1],
                ride.destinationCoords.coordinates[0]
              );
              
              // Check if it's within the ride's max detour distance
              return exactDistance <= (parseFloat(maxDistance) || 5) + (ride.maxDetourDistance || 2);
            }
          }
          
          return false;
        });
      } else {
        // If not looking for detours, filter to exact matches only
        rides = rides.filter(ride => {
          if (ride.destinationCoords && ride.destinationCoords.coordinates) {
            const exactDistance = calculateDistance(
              destinationLocation.lat,
              destinationLocation.lng,
              ride.destinationCoords.coordinates[1],
              ride.destinationCoords.coordinates[0]
            );
            
            return exactDistance <= (parseFloat(maxDistance) || 5);
          }
          return false;
        });
      }
    } else {
      // Text-based search
      if (origin) {
        query.origin = { $regex: new RegExp(origin, 'i') };
      }
      
      if (destination) {
        query.destination = { $regex: new RegExp(destination, 'i') };
      }
      
      // Add flexible pickup and detour filters
      let flexibilityConditions = [];
      
      if (includeFlexiblePickup === 'true') {
        flexibilityConditions.push({ isFlexiblePickup: true });
      }
      
      if (includeDetours === 'true') {
        flexibilityConditions.push({ allowDetour: true });
      }
      
      // Add these conditions to the query if present
      if (flexibilityConditions.length > 0) {
        if (!query.$or) {
          query.$or = [];
        }
        query.$or = [...query.$or, ...flexibilityConditions];
      }
      
      // *** FIX: Don't try to populate 'user', just get the driver info ***
      rides = await Ride.find(query)
        .sort({ dateTime: 1 });
    }
    
    // Apply time filtering if needed
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      const requestedTimeMinutes = hours * 60 + minutes;
      
      rides = rides.filter(ride => {
        if (!ride.dateTime) return false;
        
        const rideHours = ride.dateTime.getHours();
        const rideMinutes = ride.dateTime.getMinutes();
        const rideTimeMinutes = rideHours * 60 + rideMinutes;
        
        if (flexibleTiming === 'true') {
          // Use the ride's maxWaitTime or the user's requested flexibility
          const flexibility = parseInt(timeFlexibility) || 
                              (ride.maxWaitTime ? ride.maxWaitTime : 60);
          return Math.abs(rideTimeMinutes - requestedTimeMinutes) <= flexibility;
        } else {
          // Default 15-minute buffer
          return Math.abs(rideTimeMinutes - requestedTimeMinutes) <= 15;
        }
      });
    }

    // For recurring rides, we need to filter by day of week in-memory when showing nearby days
    if (date && nearbyDays && parseInt(nearbyDays) > 0 && includeRecurring === 'true') {
      const searchDate = new Date(date);
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      
      // Create a set of days to search for
      const daysToSearch = new Set();
      const daysRange = parseInt(nearbyDays);
      
      for (let i = -daysRange; i <= daysRange; i++) {
        const checkDate = new Date(searchDate);
        checkDate.setDate(checkDate.getDate() + i);
        daysToSearch.add(days[checkDate.getDay()]);
      }
      
      // Filter recurring rides to only include those that occur on one of the days in our range
      rides = rides.filter(ride => {
        if (!ride.isRecurringRide) return true; // Keep non-recurring rides
        
        // For recurring rides, check if any of the recurring days are in our search days
        return ride.recurringDays.some(day => daysToSearch.has(day.toLowerCase()));
      });
    }

    // Transform data for response and add flexibility indicators
    const transformedRides = rides.map(ride => ({
      id: ride._id,
      driver: {
        id: ride.driver?.user || null,
        name: ride.driver?.name || 'Unknown Driver',
        avatar: ride.driver?.avatar || null
      },
      origin: ride.origin,
      destination: ride.destination,
      departureTime: ride.dateTime,
      availableSeats: ride.seatsAvailable,
      farePerSeat: ride.fare,
      isRecurring: ride.isRecurringRide,
      recurringDays: ride.recurringDays,
      vehicle: ride.vehicleType,
      notes: ride.notes,
      // Add flexibility information
      flexibility: {
        hasFlexiblePickup: ride.isFlexiblePickup || false,
        pickupRadius: ride.pickupRadius || 0,
        allowsDetours: ride.allowDetour || false,
        maxDetourDistance: ride.maxDetourDistance || 0,
        maxWaitTime: ride.maxWaitTime || 0
      },
      // Add suggested pickup/dropoff points if available
      suggestedPickupPoints: ride.suggestedPickupPoints || [],
      suggestedDropoffPoints: ride.suggestedDropoffPoints || []
    }));

    return res.json({ rides: transformedRides });
  } catch (err) {
    console.error('Search rides error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});





/**
 * @route   POST api/rides/:id/join
 * @desc    Join an existing ride
 * @access  Private
 */
router.post('/:id/join', [
  authenticateToken,
  [
    check('seats', 'Number of seats is required').isInt({ min: 1 }),
    check('pickupLocation', 'Pickup location is required').notEmpty(),
    check('dropoffLocation', 'Dropoff location is required').notEmpty(),
    check('fare', 'Fare amount is required').isNumeric()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Get ride by ID
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if ride is active
    if (ride.status !== 'active') {
      return res.status(400).json({ message: 'This ride is no longer active' });
    }

    // Check if enough seats are available
    const { seats } = req.body;
    if (ride.seatsAvailable < seats) {
      return res.status(400).json({ 
        message: `Only ${ride.seatsAvailable} seats available, but requested ${seats}` 
      });
    }

    // Check if user is already a passenger in this ride
    const isAlreadyPassenger = ride.passengers.some(
      passenger => passenger.user && passenger.user.toString() === req.user.id
    );

    if (isAlreadyPassenger) {
      return res.status(400).json({ message: 'You have already requested to join this ride' });
    }

    // Check if user is the driver of this ride
    if (ride.user && ride.user.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot join your own ride' });
    }

    // Get current user info
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Format the pickup and dropoff location data
    const { pickupLocation, dropoffLocation, fare } = req.body;
    
    // Create passenger object
    const newPassenger = {
      user: req.user.id,
      name: user.name,
      avatar: user.avatar,
      pickupLocation: {
        address: pickupLocation.address,
        coordinates: pickupLocation.coordinates ? {
          type: 'Point',
          coordinates: [
            parseFloat(pickupLocation.coordinates.longitude || pickupLocation.coordinates.lng || 0),
            parseFloat(pickupLocation.coordinates.latitude || pickupLocation.coordinates.lat || 0)
          ]
        } : undefined
      },
      dropoffLocation: {
        address: dropoffLocation.address,
        coordinates: dropoffLocation.coordinates ? {
          type: 'Point',
          coordinates: [
            parseFloat(dropoffLocation.coordinates.longitude || dropoffLocation.coordinates.lng || 0),
            parseFloat(dropoffLocation.coordinates.latitude || dropoffLocation.coordinates.lat || 0)
          ]
        } : undefined
      },
      status: 'pending',
      requestedAt: Date.now()
    };

    // Add passenger to ride
    ride.passengers.unshift(newPassenger);
    
    // Update available seats (tentatively, will be confirmed when request is accepted)
    if (ride.seatsAvailable) {
      ride.seatsAvailable -= seats;
    }

    await ride.save();

    // Create a notification for the ride owner (implementation depends on your notification system)
    // This is where you would create a notification for the ride creator

    return res.json({ 
      message: 'Ride join request sent successfully',
      passenger: newPassenger,
      ride: {
        id: ride._id,
        origin: ride.origin,
        destination: ride.destination,
        date: ride.date,
        time: ride.time,
        dateTime: ride.dateTime,
        driver: ride.driver
      }
    });
    
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Ride not found' });
    }
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET api/rides/joined
 * @desc    Get all rides that the current user has joined
 * @access  Private
 */
router.get('/joined', authenticateToken, async (req, res) => {
  try {
    // Find all rides where current user is a passenger
    const rides = await Ride.find({
      'passengers.user': req.user.id
    }).sort({ dateTime: 1 });

    res.json(rides);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


/**
 * @route   PATCH api/rides/:id/passengers/:passengerId
 * @desc    Update passenger status (accept/reject)
 * @access  Private (ride owner only)
 */

router.patch('/:id/passengers/:passengerId', [
  authenticateToken,
  [
    check('status', 'Status is required').isIn(['accepted', 'rejected', 'cancelled'])
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

    // Check if the current user is the ride owner
    if (ride.user && ride.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this ride' });
    }

    // Find the passenger in the ride
    const passengerIndex = ride.passengers.findIndex(
      passenger => passenger._id.toString() === req.params.passengerId
    );

    if (passengerIndex === -1) {
      return res.status(404).json({ message: 'Passenger not found in this ride' });
    }

    const { status } = req.body;
    
    // Update passenger status
    ride.passengers[passengerIndex].status = status;
    ride.passengers[passengerIndex].updatedAt = Date.now();

    // If rejecting, add the seats back to available seats
    if ((status === 'rejected' || status === 'cancelled') && 
        ride.passengers[passengerIndex].status === 'pending') {
      // Since the number of seats requested isn't stored in the passenger object,
      // we'll need to get it from the request body
      const seatsToAdd = req.body.seats || 1; // Default to 1 if not specified
      ride.seatsAvailable += seatsToAdd;
    }

    await ride.save();

    // Create a notification for the passenger
    // Notification logic would go here

    res.json({
      message: `Passenger request ${status}`,
      passenger: ride.passengers[passengerIndex]
    });
    
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Ride or passenger not found' });
    }
    res.status(500).send('Server Error');
  }
});

/**
 * @route   DELETE api/rides/:id/passengers/:passengerId
 * @desc    Remove a passenger from a ride (cancel request)
 * @access  Private (passenger or ride owner)
 */
router.delete('/:id/passengers/:passengerId', authenticateToken, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Find the passenger in the ride
    const passenger = ride.passengers.find(
      p => p._id.toString() === req.params.passengerId
    );

    if (!passenger) {
      return res.status(404).json({ message: 'Passenger not found in this ride' });
    }

    // Check if the current user is the passenger or the ride owner
    const isPassenger = passenger.user && passenger.user.toString() === req.user.id;
    const isRideOwner = ride.user && ride.user.toString() === req.user.id;
    
    if (!isPassenger && !isRideOwner) {
      return res.status(401).json({ message: 'Not authorized to cancel this request' });
    }

    // Remove passenger from ride
    const passengerIndex = ride.passengers.findIndex(
      p => p._id.toString() === req.params.passengerId
    );
    
    // Before removing, get the seat count (using a default if not available)
    const seatsToAdd = req.body.seats || 1; // Default to 1 if not specified
    
    ride.passengers.splice(passengerIndex, 1);
    
    // Update available seats
    if (ride.seatsAvailable !== undefined) {
      ride.seatsAvailable += seatsToAdd;
    }

    await ride.save();
    res.json({ message: 'Ride request cancelled successfully' });
    
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Ride or passenger not found' });
    }
    res.status(500).send('Server Error');
  }
});



module.exports = router;
