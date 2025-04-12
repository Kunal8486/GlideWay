const express = require('express');
const router = express.Router();
const auth = require('../middleware/RiderAuth');
const PoolRides = require('../Models/PoolRide');
const Rider = require('../Models/Rider');
const { check, validationResult } = require('express-validator');

// @route   GET api/rides/pool/my-rides
// @desc    Get rides where the user is the driver
// @access  Private
router.get('/my-rides', auth, async (req, res) => {
    try {
      // Find rides where the current user is the driver
      let rides = await PoolRides.find({
        'driver.user': req.user.id
      }).sort({ dateTime: 1 });
  
      // Populate passenger information from the Rider model
      rides = await Promise.all(rides.map(async (ride) => {
        const populatedPassengers = await Promise.all(ride.passengers.map(async (passenger) => {
          try {
            const riderInfo = await Rider.findById(passenger.user);
            
            // If rider info exists, enhance passenger object with additional fields
            if (riderInfo) {
              return {
                ...passenger.toObject(),
                name: passenger.name || riderInfo.name,
                profile_picture_url: riderInfo.profile_picture_url || "https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png",
                // Include avatar as fallback for frontend compatibility
                avatar: riderInfo.profile_picture_url || "https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png"
              };
            }
            return passenger;
          } catch (err) {
            console.error(`Error fetching passenger ${passenger.user}: ${err.message}`);
            return passenger;
          }
        }));
  
        // Convert the Mongoose document to a plain object
        const rideObject = ride.toObject();
        
        // Replace passengers array with populated passengers
        rideObject.passengers = populatedPassengers;
        
        return rideObject;
      }));
  
      res.json(rides);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  
  // @route   PUT api/rides/pool/:id/passenger-request
  // @desc    Approve or reject a passenger request
  // @access  Private
  router.put('/:id/passenger-request', auth, async (req, res) => {
    try {
      const ride = await PoolRides.findById(req.params.id);
      
      if (!ride) {
        return res.status(404).json({ msg: 'Ride not found' });
      }
      
      // Check if the user is the ride owner
      if (ride.driver.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized to manage this ride' });
      }
  
      const { passengerId, status } = req.body;
      
      // Find the passenger in the ride's passengers array
      const passengerIndex = ride.passengers.findIndex(
        p => p.user.toString() === passengerId
      );
      
      if (passengerIndex === -1) {
        return res.status(404).json({ msg: 'Passenger request not found' });
      }
      
      const previousStatus = ride.passengers[passengerIndex].status;
      
      // Update passenger status
      ride.passengers[passengerIndex].status = status;
      ride.passengers[passengerIndex].updatedAt = Date.now();
      
      // If accepting the passenger, reduce available seats
      if (status === 'accepted' && previousStatus !== 'accepted') {
        ride.seatsAvailable = Math.max(0, ride.seatsAvailable - 1);
      }
      
      // If rejecting a previously accepted passenger, increase available seats
      if (status === 'rejected' && previousStatus === 'accepted') {
        ride.seatsAvailable++;
      }
  
      await ride.save();
      
      // After saving, fetch the updated ride with populated passenger info
      const updatedRide = await PoolRides.findById(req.params.id);
      
      // Manually populate passenger information
      const populatedPassengers = await Promise.all(updatedRide.passengers.map(async (passenger) => {
        try {
          const riderInfo = await Rider.findById(passenger.user);
          
          if (riderInfo) {
            return {
              ...passenger.toObject(),
              name: passenger.name || riderInfo.name,
              profile_picture_url: riderInfo.profile_picture_url || "https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png",
              avatar: riderInfo.profile_picture_url || "https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png"
            };
          }
          return passenger;
        } catch (err) {
          console.error(`Error fetching passenger ${passenger.user}: ${err.message}`);
          return passenger;
        }
      }));
  
      // Convert the Mongoose document to a plain object
      const rideObject = updatedRide.toObject();
      
      // Replace passengers array with populated passengers
      rideObject.passengers = populatedPassengers;
  
      // If accepted, notify the passenger (you can implement this later)
      if (status === 'accepted') {
        // Notification logic would be implemented here
        console.log(`Passenger ${passengerId} accepted for ride ${ride._id}`);
      }
  
      res.json(rideObject);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  
// @route   PUT api/rides/pool/:id/cancel
// @desc    Cancel a ride
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const ride = await PoolRides.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ msg: 'Ride not found' });
    }
    
    // Check if the user is the ride owner
    if (ride.driver.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to cancel this ride' });
    }
    
    // Check if the ride is already cancelled or completed
    if (ride.status === 'cancelled') {
      return res.status(400).json({ msg: 'This ride is already cancelled' });
    }
    
    if (ride.status === 'completed') {
      return res.status(400).json({ msg: 'Cannot cancel a completed ride' });
    }
    
    // Update ride status
    ride.status = 'cancelled';
    ride.updatedAt = Date.now();
    
    // Add cancellation reason if provided
    if (req.body.reason) {
      ride.cancelReason = req.body.reason;
    }
    
    await ride.save();
    
    // Notify all accepted passengers about cancellation
    const acceptedPassengers = ride.passengers.filter(p => p.status === 'accepted');
    
    // This would be replaced with actual notification logic
    if (acceptedPassengers.length > 0) {
      console.log(`Notifying ${acceptedPassengers.length} passengers about ride ${ride._id} cancellation`);
      // Notification logic would go here
    }
    
    res.json(ride);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/rides/pool/:id/complete
// @desc    Mark a ride as completed
// @access  Private
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const ride = await PoolRides.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ msg: 'Ride not found' });
    }
    
    // Check if the user is the ride owner
    if (ride.driver.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to complete this ride' });
    }
    
    // Check if the ride can be completed
    if (ride.status !== 'active') {
      return res.status(400).json({ 
        msg: `Cannot complete a ride that is ${ride.status}` 
      });
    }
    
    // Update ride status
    ride.status = 'completed';
    ride.updatedAt = Date.now();
    
    await ride.save();
    
    // Add to ride history for all participants
    const acceptedPassengerIds = ride.passengers
      .filter(p => p.status === 'accepted')
      .map(p => p.user);
    
    // Add ride to driver's history
    await Rider.findByIdAndUpdate(
      req.user.id,
      { $push: { ride_history: ride._id } }
    );
    
    // Add ride to accepted passengers' history
    if (acceptedPassengerIds.length > 0) {
      await Rider.updateMany(
        { _id: { $in: acceptedPassengerIds } },
        { $push: { ride_history: ride._id } }
      );
    }
    
    res.json(ride);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/rides/pool/upcoming
// @desc    Get upcoming rides where the user is the driver
// @access  Private
router.get('/upcoming', auth, async (req, res) => {
  try {
    const currentDate = new Date();
    
    // Find upcoming rides where the current user is the driver
    const rides = await PoolRides.find({
      'driver.user': req.user.id,
      status: 'active',
      dateTime: { $gt: currentDate }
    }).sort({ dateTime: 1 });

    res.json(rides);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/rides/pool/recurring/:parentId
// @desc    Get all recurring instances of a ride
// @access  Private
router.get('/recurring/:parentId', auth, async (req, res) => {
  try {
    const parentRide = await PoolRides.findById(req.params.parentId);
    
    if (!parentRide) {
      return res.status(404).json({ msg: 'Parent ride not found' });
    }
    
    // Check if the user is the ride owner
    if (parentRide.driver.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to view these rides' });
    }
    
    // Find all recurring instances
    const recurringInstances = await PoolRides.find({
      parentRideId: req.params.parentId,
      isRecurringInstance: true
    }).sort({ dateTime: 1 });
    
    // Include the parent ride in the response
    res.json({
      parentRide,
      recurringInstances
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/rides/pool/:id/update
// @desc    Update ride information
// @access  Private
router.put('/:id/update', [
    auth,
    check('origin', 'Origin is required').not().isEmpty(),
    check('destination', 'Destination is required').not().isEmpty(),
    check('date', 'Date is required').not().isEmpty(),
    check('time', 'Time is required').not().isEmpty(),
    check('seats', 'Number of seats is required').isNumeric(),
    check('fare', 'Fare amount is required').isNumeric(),
    check('vehicleType', 'Vehicle type is required').not().isEmpty()
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const ride = await PoolRides.findById(req.params.id);
      
      if (!ride) {
        return res.status(404).json({ msg: 'Ride not found' });
      }
      
      // Check if the user is the ride owner
      if (ride.driver.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized to update this ride' });
      }
      
      // Check if the ride can be updated
      if (ride.status !== 'active') {
        return res.status(400).json({ 
          msg: `Cannot update a ride that is ${ride.status}` 
        });
      }
      
      // Check if reducing seats would conflict with accepted passengers
      const acceptedPassengerCount = ride.passengers.filter(p => p.status === 'accepted').length;
      if (req.body.seats < acceptedPassengerCount) {
        return res.status(400).json({ 
          msg: `Cannot reduce seats below number of accepted passengers (${acceptedPassengerCount})` 
        });
      }
  
      // Calculate date time from date and time strings
      const dateTime = new Date(`${req.body.date}T${req.body.time}`);
      
      // Calculate available seats
      const seatsAvailable = req.body.seats - acceptedPassengerCount;
      
      // Update ride details
      const rideFields = {
        origin: req.body.origin,
        destination: req.body.destination,
        date: req.body.date,
        time: req.body.time,
        dateTime,
        seats: req.body.seats,
        seatsAvailable,
        fare: req.body.fare,
        vehicleType: req.body.vehicleType,
        notes: req.body.notes || '',
        updatedAt: Date.now()
      };
      
      // Add optional fields if provided
      if (req.body.originCoords) {
        rideFields.originCoords = {
          type: 'Point',
          coordinates: [
            req.body.originCoords.longitude,
            req.body.originCoords.latitude
          ]
        };
      }
      
      if (req.body.destinationCoords) {
        rideFields.destinationCoords = {
          type: 'Point',
          coordinates: [
            req.body.destinationCoords.longitude,
            req.body.destinationCoords.latitude
          ]
        };
      }
      
      // Update recurring ride settings if provided
      if (req.body.isRecurringRide !== undefined) {
        rideFields.isRecurringRide = req.body.isRecurringRide;
        
        if (req.body.isRecurringRide) {
          rideFields.recurringDays = req.body.recurringDays || [];
        }
      }
      
      // Update detour settings if provided
      if (req.body.allowDetour !== undefined) {
        rideFields.allowDetour = req.body.allowDetour;
        
        if (req.body.allowDetour) {
          rideFields.maxDetourDistance = req.body.maxDetourDistance || 2;
          rideFields.maxWaitTime = req.body.maxWaitTime || 10;
        }
      }
      
      // Update flexible pickup settings if provided
      if (req.body.isFlexiblePickup !== undefined) {
        rideFields.isFlexiblePickup = req.body.isFlexiblePickup;
        
        if (req.body.isFlexiblePickup) {
          rideFields.pickupRadius = req.body.pickupRadius || 1;
        }
      }
      
      // Update ride with new fields
      const updatedRide = await PoolRides.findByIdAndUpdate(
        req.params.id,
        { $set: rideFields },
        { new: true }
      );
      
      // If this is a recurring ride parent, update future recurring instances
      if (updatedRide.isRecurringRide && !updatedRide.isRecurringInstance) {
        const futureRecurringInstances = await PoolRides.find({
          parentRideId: updatedRide._id,
          isRecurringInstance: true,
          dateTime: { $gt: new Date() }
        });
        
        // Update each future instance with the new details
        if (futureRecurringInstances.length > 0) {
          const updatePromises = futureRecurringInstances.map(instance => {
            // Keep the original date and time of the instance
            const instanceFields = { ...rideFields };
            delete instanceFields.date;
            delete instanceFields.time;
            delete instanceFields.dateTime;
            
            return PoolRides.findByIdAndUpdate(
              instance._id,
              { $set: instanceFields }
            );
          });
          
          await Promise.all(updatePromises);
        }
      }
      
      res.json(updatedRide);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  
  // @route   POST api/rides/pool/create
  // @desc    Create a new pool ride
  // @access  Private
  router.post('/create', [
    auth,
    check('origin', 'Origin is required').not().isEmpty(),
    check('destination', 'Destination is required').not().isEmpty(),
    check('date', 'Date is required').not().isEmpty(),
    check('time', 'Time is required').not().isEmpty(),
    check('seats', 'Number of seats is required').isNumeric(),
    check('fare', 'Fare amount is required').isNumeric(),
    check('vehicleType', 'Vehicle type is required').not().isEmpty()
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      // Get user information
      const rider = await Rider.findById(req.user.id).select('-password');
      
      if (!rider) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      // Calculate date time from date and time strings
      const dateTime = new Date(`${req.body.date}T${req.body.time}`);
      
      // Create new ride object
      const newRide = new PoolRides({
        driver: {
          user: req.user.id,
          name: rider.name,
          avatar: rider.profile_picture_url
        },
        origin: req.body.origin,
        destination: req.body.destination,
        date: req.body.date,
        time: req.body.time,
        dateTime,
        seats: req.body.seats,
        seatsAvailable: req.body.seats, // Initially all seats are available
        fare: req.body.fare,
        vehicleType: req.body.vehicleType,
        notes: req.body.notes || '',
        status: 'active',
        passengers: []
      });
      
      // Add optional fields if provided
      if (req.body.originCoords) {
        newRide.originCoords = {
          type: 'Point',
          coordinates: [
            req.body.originCoords.longitude,
            req.body.originCoords.latitude
          ]
        };
      }
      
      if (req.body.destinationCoords) {
        newRide.destinationCoords = {
          type: 'Point',
          coordinates: [
            req.body.destinationCoords.longitude,
            req.body.destinationCoords.latitude
          ]
        };
      }
      
      // Add recurring ride settings if provided
      if (req.body.isRecurringRide) {
        newRide.isRecurringRide = true;
        newRide.recurringDays = req.body.recurringDays || [];
      }
      
      // Add detour settings if provided
      if (req.body.allowDetour) {
        newRide.allowDetour = true;
        newRide.maxDetourDistance = req.body.maxDetourDistance || 2;
        newRide.maxWaitTime = req.body.maxWaitTime || 10;
      }
      
      // Add flexible pickup settings if provided
      if (req.body.isFlexiblePickup) {
        newRide.isFlexiblePickup = true;
        newRide.pickupRadius = req.body.pickupRadius || 1;
      }
      
      // Save the ride
      const ride = await newRide.save();
      
      // If this is a recurring ride, create future instances
      if (ride.isRecurringRide && ride.recurringDays.length > 0) {
        await createRecurringInstances(ride);
      }
      
      res.json(ride);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  
  // Helper function to create recurring instances
  async function createRecurringInstances(parentRide) {
    try {
      const dayMapping = {
        'Sunday': 0,
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6
      };
      
      // Create instances for the next 4 weeks
      const instances = [];
      const startDate = new Date(parentRide.dateTime);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 28); // 4 weeks
      
      // Get day of week for the recurring days
      const recurringDayNumbers = parentRide.recurringDays.map(day => dayMapping[day]);
      
      // Start from tomorrow
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + 1);
      
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        
        if (recurringDayNumbers.includes(dayOfWeek)) {
          // Create a new instance for this date
          const newInstanceDate = new Date(currentDate);
          const formattedDate = newInstanceDate.toISOString().split('T')[0];
          
          const newInstance = new PoolRides({
            ...parentRide.toObject(),
            _id: undefined, // Let MongoDB create a new ID
            date: formattedDate,
            dateTime: new Date(`${formattedDate}T${parentRide.time}`),
            isRecurringInstance: true,
            parentRideId: parentRide._id,
            passengers: []
          });
          
          instances.push(newInstance);
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Save all instances
      if (instances.length > 0) {
        await PoolRides.insertMany(instances);
      }
    } catch (err) {
      console.error('Error creating recurring instances:', err);
      throw err;
    }
  }
  
  // @route   DELETE api/rides/pool/:id
  // @desc    Delete a ride
  // @access  Private
  router.delete('/:id', auth, async (req, res) => {
    try {
      const ride = await PoolRides.findById(req.params.id);
      
      if (!ride) {
        return res.status(404).json({ msg: 'Ride not found' });
      }
      
      // Check if the user is the ride owner
      if (ride.driver.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized to delete this ride' });
      }
      
      // Check if there are any accepted passengers
      const hasAcceptedPassengers = ride.passengers.some(p => p.status === 'accepted');
      
      if (hasAcceptedPassengers) {
        return res.status(400).json({ 
          msg: 'Cannot delete a ride with accepted passengers. Cancel it instead.' 
        });
      }
      
      // If this is a parent recurring ride, also delete future instances
      if (ride.isRecurringRide && !ride.isRecurringInstance) {
        await PoolRides.deleteMany({
          parentRideId: ride._id,
          isRecurringInstance: true,
          dateTime: { $gt: new Date() }
        });
      }
      
      // Delete the ride
      await ride.remove();
      
      res.json({ msg: 'Ride deleted' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  
  // @route   GET api/rides/pool/search
  // @desc    Search for available pool rides
  // @access  Private
  router.get('/search', auth, async (req, res) => {
    try {
      // Extract search parameters
      const { origin, destination, date, seats } = req.query;
      
      // Build search query
      const searchQuery = {
        status: 'active',
        seatsAvailable: { $gte: parseInt(seats) || 1 }
      };
      
      // Add date filter if provided
      if (date) {
        searchQuery.date = date;
      }
      
      // Add origin and destination filters if provided
      if (origin) {
        searchQuery.origin = new RegExp(origin, 'i');
      }
      
      if (destination) {
        searchQuery.destination = new RegExp(destination, 'i');
      }
      
      // Don't show rides created by the current user
      searchQuery['driver.user'] = { $ne: req.user.id };
      
      // Find matching rides
      const rides = await PoolRides.find(searchQuery)
        .sort({ dateTime: 1 })
        .limit(50);
        
      res.json(rides);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  
  // @route   POST api/rides/pool/:id/request-seat
  // @desc    Request a seat on a pool ride
  // @access  Private
  router.post('/:id/request-seat', [
    auth,
    check('pickupLocation', 'Pickup location is required').notEmpty(),
    check('dropoffLocation', 'Dropoff location is required').notEmpty()
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const ride = await PoolRides.findById(req.params.id);
      
      if (!ride) {
        return res.status(404).json({ msg: 'Ride not found' });
      }
      
      // Check if ride is active
      if (ride.status !== 'active') {
        return res.status(400).json({ 
          msg: `Cannot request a seat on a ride that is ${ride.status}` 
        });
      }
      
      // Check if there are seats available
      if (ride.seatsAvailable < 1) {
        return res.status(400).json({ msg: 'No seats available on this ride' });
      }
      
      // Check if the user is not the driver
      if (ride.driver.user.toString() === req.user.id) {
        return res.status(400).json({ msg: 'You cannot request a seat on your own ride' });
      }
      
      // Check if user already has a request for this ride
      const existingRequest = ride.passengers.find(
        p => p.user.toString() === req.user.id
      );
      
      if (existingRequest) {
        return res.status(400).json({ 
          msg: `You already have a ${existingRequest.status} request for this ride` 
        });
      }
      
      // Get user information
      const rider = await Rider.findById(req.user.id).select('-password');
      
      if (!rider) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      // Create new passenger request with the structure expected by the frontend
      const newPassenger = {
        user: req.user.id,
        name: rider.name,
        avatar: rider.profile_picture_url,
        pickupLocation: {
          address: req.body.pickupLocation,
          coordinates: req.body.pickupCoordinates || null
        },
        dropoffLocation: {
          address: req.body.dropoffLocation,
          coordinates: req.body.dropoffCoordinates || null
        },
        status: 'pending',
        requestedAt: Date.now()
      };
      
      // Add passenger to ride
      ride.passengers.push(newPassenger);
      await ride.save();
      
      // Notify driver of new request
      // Notification logic would go here
      
      res.json(ride);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  
  module.exports = router;