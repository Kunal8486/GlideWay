const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const Driver = require('../Models/Driver');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/DriverAuth');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Add file validation
const fileFilter = (req, file, cb) => {
    // Accept image files and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only image and PDF files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

// Driver registration endpoint
router.post('/register', upload.fields([
    { name: 'profile_picture', maxCount: 1 },
    { name: 'license_front', maxCount: 1 },
    { name: 'license_back', maxCount: 1 },
    { name: 'vehicle_insurance', maxCount: 1 }
]), async (req, res) => {
    try {
        // Extract all fields from req.body
        const {
            name,
            email,
            phone_number,
            password,
            gender,
            age,
            referral_code,
            vehicle_make,
            vehicle_model,
            vehicle_registration,
            vehicle_year,
            vehicle_color,
            license_number,
            license_expiry,
            license_state
        } = req.body;

        // Basic server-side validation (matching frontend validation)
        if (!name || !email || !phone_number || !password || !gender || !age ||
            !vehicle_make || !vehicle_model || !vehicle_registration || !vehicle_year || !vehicle_color ||
            !license_number || !license_expiry || !license_state) {
            return res.status(400).json({ error: "All required fields must be filled" });
        }

        // Email validation
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // Check if email already exists
        const existingDriver = await Driver.findOne({ email });
        if (existingDriver) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Validate age
        const parsedAge = parseInt(age);
        if (parsedAge < 18 || parsedAge > 70) {
            return res.status(400).json({ error: "Driver must be between 18 and 70 years old" });
        }

        // Validate license expiry
        const expiryDate = new Date(license_expiry);
        const today = new Date();
        if (expiryDate < today) {
            return res.status(400).json({ error: "License has expired" });
        }

        // Validate vehicle year
        const parsedVehicleYear = parseInt(vehicle_year);
        const currentYear = new Date().getFullYear();
        if (parsedVehicleYear < 1990 || parsedVehicleYear > currentYear + 1) {
            return res.status(400).json({ error: "Invalid vehicle year" });
        }

        // Check if required files were uploaded
        const requiredFiles = ['profile_picture', 'license_front', 'license_back', 'vehicle_insurance'];
        for (let file of requiredFiles) {
            if (!req.files[file]) {
                return res.status(400).json({ error: `${file.replace('_', ' ')} is required` });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Store uploaded file paths
        const profilePictureUrl = req.files.profile_picture[0].path;
        const licenseFrontUrl = req.files.license_front[0].path;
        const licenseBackUrl = req.files.license_back[0].path;
        const vehicleInsuranceUrl = req.files.vehicle_insurance[0].path;

        // Create new driver document
        const driver = new Driver({
            name,
            email,
            phone_number,
            password: hashedPassword,
            gender,
            age: parsedAge,
            license_number,
            license_expiry: expiryDate,
            license_front_url: licenseFrontUrl,
            license_back_url: licenseBackUrl,
            license_state, // Added license state
            vehicle_details: {
                make: vehicle_make,
                model: vehicle_model,
                registration_number: vehicle_registration,
                year: parsedVehicleYear, // Corrected vehicle year storage
                color: vehicle_color // Added vehicle color to details
            },
            profile_picture_url: profilePictureUrl,
            vehicle_insurance_url: vehicleInsuranceUrl,
            status: 'pending', // Default status for new drivers
            
            // Optional fields
            ...(referral_code && { referral_code }),
        });

        await driver.save();
        res.status(201).json({ 
            success: true,
            message: "Driver registered successfully!",
            driver: {
                id: driver._id,
                name: driver.name,
                email: driver.email
            }
        });
    } catch (error) {
        console.error("Registration Error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Registration failed. Please try again." });
    }
});




// Driver login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Find driver by email
        const driver = await Driver.findOne({ email });
        if (!driver) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, driver.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Check if driver is verified
        if (!driver.is_verified) {
            return res.status(403).json({ 
                error: "Account pending verification",
                status: "pending"
            });
        }

        // Create and sign JWT
        const token = jwt.sign(
            { 
                id: driver._id,
                email: driver.email,
                role: 'driver'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return success with token
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            driver: {
                id: driver._id,
                name: driver.name,
                email: driver.email,
                profile_picture: driver.profile_picture_url
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Login failed. Please try again." });
    }
});





router.get('/profile', authenticateToken, async (req, res) => {
    try {
      // Check if user ID exists in the token
      if (!req.user || !req.user.id) {
        return res.status(400).json({ msg: 'No driver ID provided' });
      }
  
      const driver = await Driver.findById(req.user.id)
        .select('-password -resetPasswordToken -resetPasswordExpires')
        .lean();
      
      if (!driver) {
        return res.status(404).json({ msg: 'Driver not found' });
      }
  
      return res.json(driver);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Server error' });
    }
  });
  


  /**
   * @route   PUT /api/drivers/profile
   * @desc    Update driver profile
   * @access  Private
   */
  router.put('/profile', authenticateToken, async (req, res) => {
    try {
      // Check if user ID exists in the token
      if (!req.user || !req.user.id) {
        return res.status(400).json({ msg: 'No driver ID provided' });
      }
      
      // Fields that drivers are allowed to update
      const allowedUpdates = [
        'name', 
        'phone_number', 
        'profile_picture_url',
        'availability'
      ];
      
      // Create profileFields object with only allowed fields
      const profileFields = {};
      for (const [key, value] of Object.entries(req.body)) {
        if (allowedUpdates.includes(key)) {
          profileFields[key] = value;
        }
      }
  
      // Special handling for location
      if (req.body.location) {
        profileFields.location = {
          latitude: req.body.location.latitude,
          longitude: req.body.location.longitude
        };
      }
  
      // Update driver profile
      const driver = await Driver.findByIdAndUpdate(
        req.user.id,
        { $set: profileFields },
        { new: true, runValidators: true }
      ).select('-password -resetPasswordToken -resetPasswordExpires');
      
      if (!driver) {
        return res.status(404).json({ msg: 'Driver not found' });
      }
  
      return res.json(driver);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Server error' });
    }
  });
  
  /**
   * @route   GET /api/drivers/:driverId
   * @desc    Get driver profile by ID
   * @access  Private
   */
  router.get('/:driverId', authenticateToken, async (req, res) => {
    try {
      // Check if driverId parameter exists
      if (!req.params.driverId) {
        return res.status(400).json({ msg: 'No driver ID provided' });
      }
  
      const driver = await Driver.findById(req.params.driverId)
        .select('-password -resetPasswordToken -resetPasswordExpires')
        .lean();
      
      if (!driver) {
        return res.status(404).json({ msg: 'Driver not found' });
      }
  
      // Check if the requesting user has permission to view this profile
      // (Admin users or the driver themselves)
      if (req.user.role !== 'admin' && req.user.id !== driver._id.toString()) {
        return res.status(403).json({ msg: 'Not authorized to view this profile' });
      }
  
      return res.json(driver);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Driver not found' });
      }
      return res.status(500).json({ msg: 'Server error' });
    }
  });
  
  /**
   * @route   PUT /api/drivers/:driverId/status
   * @desc    Update driver status (admin only)
   * @access  Private/Admin
   */
  router.put('/:driverId/status', authenticateToken, async (req, res) => {
    try {
      // Check if driverId parameter exists
      if (!req.params.driverId) {
        return res.status(400).json({ msg: 'No driver ID provided' });
      }
      
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Not authorized to perform this action' });
      }
  
      const { status } = req.body;
      
      // Validate status
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status value' });
      }
  
      const driver = await Driver.findByIdAndUpdate(
        req.params.driverId,
        { 
          $set: { 
            status,
            // Automatically set is_verified to true if approved
            is_verified: status === 'approved' ? true : false 
          } 
        },
        { new: true, runValidators: true }
      ).select('-password -resetPasswordToken -resetPasswordExpires');
      
      if (!driver) {
        return res.status(404).json({ msg: 'Driver not found' });
      }
  
      return res.json(driver);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Server error' });
    }
  });
  
  /**
   * @route   GET /api/drivers/:driverId/trips
   * @desc    Get driver trip history
   * @access  Private
   */
  router.get('/:driverId/trips', authenticateToken, async (req, res) => {
    try {
      // Check if driverId parameter exists
      if (!req.params.driverId) {
        return res.status(400).json({ msg: 'No driver ID provided' });
      }
      
      const driver = await Driver.findById(req.params.driverId)
        .populate('ride_history')
        .select('ride_history');
      
      if (!driver) {
        return res.status(404).json({ msg: 'Driver not found' });
      }
  
      // Check if the requesting user has permission
      if (req.user.role !== 'admin' && req.user.id !== driver._id.toString()) {
        return res.status(403).json({ msg: 'Not authorized to view this data' });
      }
  
      return res.json(driver.ride_history);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Server error' });
    }
  });
  


module.exports = router;