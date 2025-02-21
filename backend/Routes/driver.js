const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const Driver = require('../Models/Driver');
const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Driver registration
router.post('/register', upload.fields([
    { name: 'profile_picture' },
    { name: 'license_front' },
    { name: 'license_back' }
]), async (req, res) => {
    try {
        const { name, email, phone_number, password, gender, age, license_number, license_expiry, vehicle_make, vehicle_model, vehicle_registration } = req.body;

        // ✅ Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Store uploaded file paths
        const profilePictureUrl = req.files['profile_picture'] ? req.files['profile_picture'][0].path : null;
        const licenseFrontUrl = req.files['license_front'] ? req.files['license_front'][0].path : null;
        const licenseBackUrl = req.files['license_back'] ? req.files['license_back'][0].path : null;

        const driver = new Driver({
            name,
            email,
            phone_number,
            password: hashedPassword, // ✅ Store hashed password
            gender,
            age,
            license_number,
            license_expiry,
            profile_picture_url: profilePictureUrl, // ✅ Save file paths
            license_front_url: licenseFrontUrl,
            license_back_url: licenseBackUrl,
            vehicle_details: {
                make: vehicle_make,
                model: vehicle_model,
                registration_number: vehicle_registration
            }
        });

        await driver.save();
        res.status(201).json({ message: "Driver registered successfully!" });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
