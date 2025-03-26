const express = require('express');
const axios = require('axios');
const router = express.Router();
const Ride = require('../Models/PoolRide');

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

// Create Ride
router.post('/createPool', async (req, res) => {
  try {
    const { origin, destination, date, time, seats, fare, vehicleType } = req.body;
    
    // Get coordinates for origin and destination
    const originCoords = await getCoordinates(origin);
    const destCoords = await getCoordinates(destination);

    const newRide = new Ride({
      origin,
      destination,
      date,
      time,
      seats,
      fare,
      vehicleType,
      originCoordinates: originCoords,
      destinationCoordinates: destCoords
    });

    await newRide.save();
    res.status(201).json(newRide);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
