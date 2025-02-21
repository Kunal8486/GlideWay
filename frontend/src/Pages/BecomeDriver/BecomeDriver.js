import React, { useState } from 'react';
import { Eye, EyeOff, Upload, X } from 'lucide-react';
import './BecomeDriver.css';

const BecomeDriver = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone_number: '',
        password: '',
        confirm_password: '',
        gender: '',
        age: '',
        license_number: '',
        license_expiry: '',
        vehicle_make: '',
        vehicle_model: '',
        vehicle_registration: '',
        profile_picture: null,
        license_front: null,
        license_back: null
    });

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [previews, setPreviews] = useState({ profile: null, license_front: null, license_back: null });

    // Handle text input changes
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle file uploads
    const handleFileUpload = (e, field) => {
        const file = e.target.files[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        setPreviews(prev => ({ ...prev, [field]: previewUrl }));
        setFormData(prev => ({ ...prev, [field]: file }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (formData.password !== formData.confirm_password) {
            alert("Passwords do not match!");
            return;
        }
    
        const formDataObject = new FormData();
        
        // Append all text fields properly
        Object.keys(formData).forEach((key) => {
            if (formData[key] && key !== "profile_picture" && key !== "license_front" && key !== "license_back") {
                formDataObject.append(key, formData[key]);
            }
        });
    
        // Append file fields properly
        if (formData.profile_picture) {
            formDataObject.append("profile_picture", formData.profile_picture);
        }
        if (formData.license_front) {
            formDataObject.append("license_front", formData.license_front);
        }
        if (formData.license_back) {
            formDataObject.append("license_back", formData.license_back);
        }
    
        try {
            const response = await fetch("http://localhost:5000/api/driver/register", {
                method: "POST",
                body: formDataObject,
            });
    
            const data = await response.json();
            if (response.ok) {
                alert("Driver registered successfully!");
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            console.error("Registration Error:", error);
            alert("Error registering driver.");
        }
    };
       
    return (
        <div className="driver-application">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Become a Driver</h2>
                </div>

                <div className="card-content">
                    <form onSubmit={handleSubmit}>
                        <h3 className="section-header">Personal Information</h3>

                        <label className="label required-label">Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="input" />

                        <label className="label required-label">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="input" />

                        <label className="label required-label">Phone Number</label>
                        <input type="text" name="phone_number" value={formData.phone_number} onChange={handleInputChange} className="input" />

                        <label className="label required-label">Password</label>
                        <div className="password-field">
                            <input type={passwordVisible ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} className="input" />
                            <button type="button" onClick={() => setPasswordVisible(!passwordVisible)}>
                                {passwordVisible ? <EyeOff /> : <Eye />}
                            </button>
                        </div>

                        <label className="label required-label">Confirm Password</label>
                        <div className="password-field">
                            <input type={confirmPasswordVisible ? 'text' : 'password'} name="confirm_password" value={formData.confirm_password} onChange={handleInputChange} className="input" />
                            <button type="button" onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
                                {confirmPasswordVisible ? <EyeOff /> : <Eye />}
                            </button>
                        </div>

                        <label className="label required-label">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleInputChange} className="select">
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>

                        <label className="label required-label">Age</label>
                        <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="input" />

                        <h3 className="section-header">Vehicle Information</h3>

                        <label className="label required-label">Vehicle Make</label>
                        <input type="text" name="vehicle_make" value={formData.vehicle_make} onChange={handleInputChange} className="input" />

                        <label className="label required-label">Vehicle Model</label>
                        <input type="text" name="vehicle_model" value={formData.vehicle_model} onChange={handleInputChange} className="input" />

                        <label className="label required-label">Vehicle Registration Number</label>
                        <input type="text" name="vehicle_registration" value={formData.vehicle_registration} onChange={handleInputChange} className="input" />

                        <h3 className="section-header">Driver’s License</h3>

                        <label className="label required-label">License Number</label>
                        <input type="text" name="license_number" value={formData.license_number} onChange={handleInputChange} className="input" />

                        <label className="label required-label">License Expiry Date</label>
                        <input type="date" name="license_expiry" value={formData.license_expiry} onChange={handleInputChange} className="input" />

                        <h3 className="section-header">Upload Documents</h3>

                        <label className="label required-label">Profile Picture</label>
                        <div className="file-upload">
                            <label>
                                <Upload size={16} /> Upload Image
                                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'profile_picture')} />
                            </label>
                        </div>

                        {previews.profile && (
                            <div className="preview-container">
                                <img src={previews.profile} className="preview-image" alt="Preview" />
                                <button onClick={(e) => { e.preventDefault(); setPreviews({ ...previews, profile: null }); }} className="remove-preview"><X /></button>
                            </div>
                        )}

                        {/* ✅ Submit Button */}
                        <button type="submit" className="submit-button">
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BecomeDriver;
