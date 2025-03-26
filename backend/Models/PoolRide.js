const mongoose = require('mongoose');
const axios = require('axios');

const RideSchema = new mongoose.Schema({
  origin: { 
    type: String, 
    required: true 
  },
  destination: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  time: { 
    type: String, 
    required: true 
  },
  seats: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 6 
  },
  fare: { 
    type: Number, 
    required: true 
  },
  vehicleType: { 
    type: String, 
    enum: ['Car', 'SUV', 'Sedan', 'Hatchback'], 
    required: true 
  },
  originCoordinates: {
    lat: Number,
    lng: Number
  },
  destinationCoordinates: {
    lat: Number,
    lng: Number
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  availableSeats: {
    type: Number,
    default: function() { return this.seats; }
  },
  status: {
    type: String,
    enum: ['Open', 'Full', 'Completed'],
    default: 'Open'
  }
}, { timestamps: true });

const Ride = mongoose.model('Ride', RideSchema);

module.exports = Ride;
