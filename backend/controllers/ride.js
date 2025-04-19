// controllers/rideController.js
const Ride = require('../Models/Ride');
const Driver = require('../Models/Driver');
const Rider = require('../Models/Rider');
const mongoose = require('mongoose');

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
};

// Calculate fare based on ride type and distance
const calculateFare = (rideType, distance, preferences = []) => {
  const RIDE_TYPES = {
    Economy: { base: 50, perKm: 12 },
    Premium: { base: 50, perKm: 20 },
    XL: { base: 50, perKm: 24 }
  };
  
  const details = RIDE_TYPES[rideType];
  const baseFare = details.base;
  const distanceFare = distance * details.perKm;
  let calculatedFare = baseFare + distanceFare;
  
  // Add preference surcharges if any
  if (preferences.length > 0) {
    // Add a small surcharge for each preference (5%)
    const preferenceSurcharge = calculatedFare * 0.05 * preferences.length;
    calculatedFare += preferenceSurcharge;
  }
  
  return calculatedFare;
};

// Estimate ride details
exports.estimateRide = async (req, res) => {
  try {
    const { 
      pickupLocation, 
      dropoffLocation, 
      rideType, 
      preferences = [] 
    } = req.body;
    
    // Calculate distance and duration
    const distance = calculateDistance(
      pickupLocation.coordinates.latitude,
      pickupLocation.coordinates.longitude,
      dropoffLocation.coordinates.latitude,
      dropoffLocation.coordinates.longitude
    );
    
    // Estimate duration (rough calculation: 2 minutes per km + 5 minutes base)
    const duration = Math.ceil(distance * 2 + 5);
    
    // Calculate fare
    const fare = calculateFare(rideType, distance, preferences);
    
    // Return estimation
    res.status(200).json({
      success: true,
      data: {
        distance,
        duration,
        fare: fare.toFixed(2),
        pickup: pickupLocation,
        dropoff: dropoffLocation,
        rideType,
        preferences
      }
    });
    
  } catch (error) {
    console.error('Error in estimateRide:', error);
    res.status(500).json({
      success: false,
      message: 'Error estimating ride details',
      error: error.message
    });
  }
};

// Book a new ride
exports.bookRide = async (req, res) => {
  try {
    const {
      riderId,
      pickup,
      dropoff,
      ride_type,
      passenger_count,
      payment,
      preferences = [],
      additional_notes,
      promo_code
    } = req.body;
    
    // Validate rider
    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }
    
    // Calculate distance and duration for route
    const distance = calculateDistance(
      pickup.coordinates.latitude,
      pickup.coordinates.longitude,
      dropoff.coordinates.latitude,
      dropoff.coordinates.longitude
    );
    
    // Estimate duration (rough calculation: 2 minutes per km + 5 minutes base)
    const duration = Math.ceil(distance * 2 + 5);
    
    // Calculate fare
    const baseFare = ride_type === 'Economy' ? 50 : ride_type === 'Premium' ? 50 : 50;
    const distanceFare = ride_type === 'Economy' ? distance * 12 : ride_type === 'Premium' ? distance * 20 : distance * 24;
    const totalFare = baseFare + distanceFare;
    
    // Create new ride
    const ride = new Ride({
      rider: riderId,
      status: 'requested',
      pickup: {
        address: pickup.address,
        coordinates: {
          latitude: pickup.coordinates.latitude,
          longitude: pickup.coordinates.longitude
        }
      },
      dropoff: {
        address: dropoff.address,
        coordinates: {
          latitude: dropoff.coordinates.latitude,
          longitude: dropoff.coordinates.longitude
        }
      },
      route: {
        distance,
        duration,
        polyline: req.body.polyline || null
      },
      ride_type,
      passenger_count,
      payment: {
        method: payment.method,
        base_fare: baseFare,
        distance_fare: distanceFare,
        waiting_charge: 0,
        surge_multiplier: 1.0,
        promo_discount: 0,
        total_fare: totalFare,
        currency: 'INR',
        payment_status: 'pending'
      },
      preferences,
      additional_notes,
      promo_code
    });
    
    await ride.save();
    
    // Find nearby driver (in a real system, you'd implement a driver matching algorithm)
    // For now, we'll simulate this process

    // Search for ride
    ride.status = 'searching';
    await ride.save();
    
    res.status(201).json({
      success: true,
      data: {
        ride,
        bookingId: ride.booking_id
      }
    });
    
  } catch (error) {
    console.error('Error in bookRide:', error);
    res.status(500).json({
      success: false,
      message: 'Error booking ride',
      error: error.message
    });
  }
};

// Get ride by ID
exports.getRideById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find ride by ID or booking_id
    let ride;
    if (mongoose.Types.ObjectId.isValid(id)) {
      ride = await Ride.findById(id)
        .populate('rider', 'name phone profile_picture')
        .populate('driver', 'name phone vehicle rating profile_picture');
    } else {
      ride = await Ride.findOne({ booking_id: id })
        .populate('rider', 'name phone profile_picture')
        .populate('driver', 'name phone vehicle rating profile_picture');
    }
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: ride
    });
    
  } catch (error) {
    console.error('Error in getRideById:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ride details',
      error: error.message
    });
  }
};

// Update ride status
exports.updateRideStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, driverId } = req.body;
    
    // Find ride
    const ride = await Ride.findById(id);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }
    
    // Update status
    ride.status = status;
    
    // Assign driver if provided
    if (driverId && status === 'accepted') {
      // Validate driver
      const driver = await Driver.findById(driverId);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }
      
      ride.driver = driverId;
      ride.accepted_time = new Date();
    }
    
    // Update additional timestamps based on status
    if (status === 'arrived') {
      ride.pickup_time = new Date();
    } else if (status === 'completed') {
      ride.dropoff_time = new Date();
    } else if (status === 'cancelled') {
      ride.cancellation_time = new Date();
    }
    
    await ride.save();
    
    res.status(200).json({
      success: true,
      data: ride
    });
    
  } catch (error) {
    console.error('Error in updateRideStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating ride status',
      error: error.message
    });
  }
};

// Cancel a ride
exports.cancelRide = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelled_by, reason } = req.body;
    
    // Find ride
    const ride = await Ride.findById(id);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }
    
    // Check if ride can be cancelled
    if (['completed', 'cancelled', 'failed'].includes(ride.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ride that is already ${ride.status}`
      });
    }
    
    // Update ride status
    ride.status = 'cancelled';
    ride.cancellation_time = new Date();
    ride.cancellation = {
      cancelled_by,
      reason,
      charge_applied: false, // Logic for cancellation charges would go here
      refund_amount: 0
    };
    
    await ride.save();
    
    res.status(200).json({
      success: true,
      data: ride
    });
    
  } catch (error) {
    console.error('Error in cancelRide:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling ride',
      error: error.message
    });
  }
};

// Get nearby drivers
exports.getNearbyDrivers = async (req, res) => {
  try {
    const { latitude, longitude, rideType, radius = 5 } = req.query;
    
    // In a real implementation, you would query for drivers based on:
    // 1. Their current location (within radius)
    // 2. Their availability status
    // 3. Whether they service the requested ride type
    
    // For now, we'll simulate nearby drivers
    const simulatedDrivers = Array(8).fill(null).map((_, i) => ({
      id: `sim-driver-${i}`,
      position: {
        lat: parseFloat(latitude) + (Math.random() - 0.5) * 0.01,
        lng: parseFloat(longitude) + (Math.random() - 0.5) * 0.01,
      },
      rotation: Math.random() * 360,
      type: rideType || Object.keys(RIDE_TYPES)[Math.floor(Math.random() * 3)],
      eta: `${Math.floor(3 + Math.random() * 10)} min`
    }));
    
    res.status(200).json({
      success: true,
      data: simulatedDrivers
    });
    
  } catch (error) {
    console.error('Error in getNearbyDrivers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby drivers',
      error: error.message
    });
  }
};

// Get rider's ride history
exports.getRiderRideHistory = async (req, res) => {
  try {
    const { riderId } = req.params;
    const { limit = 10, page = 1, status } = req.query;
    
    // Build query
    const query = { rider: riderId };
    if (status) query.status = status;
    
    // Find rides
    const rides = await Ride.find(query)
      .sort({ request_time: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('driver', 'name rating vehicle');
    
    // Count total rides for pagination
    const totalRides = await Ride.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        rides,
        pagination: {
          total: totalRides,
          page: parseInt(page),
          pages: Math.ceil(totalRides / parseInt(limit))
        }
      }
    });
    
  } catch (error) {
    console.error('Error in getRiderRideHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ride history',
      error: error.message
    });
  }
};

// Get driver's ride history
exports.getDriverRideHistory = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { limit = 10, page = 1, status } = req.query;
    
    // Build query
    const query = { driver: driverId };
    if (status) query.status = status;
    
    // Find rides
    const rides = await Ride.find(query)
      .sort({ request_time: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('rider', 'name phone profile_picture');
    
    // Count total rides for pagination
    const totalRides = await Ride.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        rides,
        pagination: {
          total: totalRides,
          page: parseInt(page),
          pages: Math.ceil(totalRides / parseInt(limit))
        }
      }
    });
    
  } catch (error) {
    console.error('Error in getDriverRideHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ride history',
      error: error.message
    });
  }
};

// Provide feedback and rating
exports.provideFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      rating, 
      feedback, 
      feedbackType // 'rider' or 'driver'
    } = req.body;
    
    // Find ride
    const ride = await Ride.findById(id);
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
        message: 'Can only provide feedback for completed rides'
      });
    }
    
    // Update rating and feedback
    if (feedbackType === 'rider') {
      ride.driver_rating = rating;
      ride.driver_feedback = feedback;
      
      // Update rider's rating
      if (ride.rider) {
        const rider = await Rider.findById(ride.rider);
        if (rider) {
          // Calculate new average rating
          const numRatings = rider.ride_history.length || 1;
          const newRating = ((rider.rating || 0) * (numRatings - 1) + rating) / numRatings;
          rider.rating = newRating;
          await rider.save();
        }
      }
    } else {
      ride.rider_rating = rating;
      ride.rider_feedback = feedback;
      
      // Update driver's rating
      if (ride.driver) {
        const driver = await Driver.findById(ride.driver);
        if (driver) {
          // Calculate new average rating
          const numRatings = driver.completed_rides || 1;
          const newRating = ((driver.rating || 0) * (numRatings - 1) + rating) / numRatings;
          driver.rating = newRating;
          await driver.save();
        }
      }
    }
    
    await ride.save();
    
    res.status(200).json({
      success: true,
      data: ride
    });
    
  } catch (error) {
    console.error('Error in provideFeedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error providing feedback',
      error: error.message
    });
  }
};