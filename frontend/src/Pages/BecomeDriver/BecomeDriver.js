import React, { useState } from 'react';
import { Camera, Car, Upload, Shield } from 'lucide-react';
import './BecomeDriver.css';

const BecomeDriver = () => {
    const [formData, setFormData] = useState({
        // Personal Information
        name: '',
        email: '',
        phone_number: '',
        password: '',
        confirm_password: '',
        profile_picture_url: null,
        gender: '',
        age: '',
        // Driver Information
        license_number: '',
        license_photo: null,
        // Vehicle Information
        vehicle_details: {
            make: '',
            model: '',
            registration_number: ''
        },
        vehicle_insurance_url: null
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [previews, setPreviews] = useState({
        profile: null,
        license: null,
        insurance: null
    });

    // Form validation function
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Invalid email address';
        if (!formData.phone_number.match(/^\+?[\d\s-]{10,}$/)) newErrors.phone_number = 'Invalid phone number';
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password && formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirm_password) newErrors.confirm_password = 'Passwords do not match';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.age || formData.age < 18) newErrors.age = 'Must be at least 18 years old';
        if (!formData.license_number) newErrors.license_number = 'License number is required';
        if (!formData.license_photo) newErrors.license_photo = 'License photo is required';
        if (!formData.vehicle_details.make) newErrors['vehicle_details.make'] = 'Vehicle make is required';
        if (!formData.vehicle_details.model) newErrors['vehicle_details.model'] = 'Vehicle model is required';
        if (!formData.vehicle_details.registration_number) newErrors['vehicle_details.registration_number'] = 'Registration number is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Input change handler
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('vehicle_details.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                vehicle_details: { ...prev.vehicle_details, [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // File upload handler
    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({
                ...prev,
                [field]: 'File size must be less than 5MB'
            }));
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setPreviews(prev => ({
            ...prev,
            [field]: previewUrl
        }));

        setFormData(prev => ({
            ...prev,
            [field]: file
        }));
    };

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setSubmitStatus({
                type: 'error',
                message: 'Please correct the errors in the form'
            });
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            setSubmitStatus({
                type: 'success',
                message: 'Application submitted successfully! We will review your details and contact you soon.'
            });

        } catch (error) {
            setSubmitStatus({
                type: 'error',
                message: 'Failed to submit application. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Field rendering helper
    const renderField = (label, name, type = 'text', required = true) => (
        <div className="field-group">
            <label htmlFor={name} className={`label ${required ? 'required-label' : ''}`}>
                {label}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                value={formData[name] || ''}
                onChange={handleInputChange}
                className={`input ${errors[name] ? 'error' : ''}`}
            />
            {errors[name] && (
                <p className="error-text">{errors[name]}</p>
            )}
        </div>
    );

    // File upload field rendering helper
    const renderFileUpload = (label, name, Icon) => (
        <div className="field-group">
            <label className="label required-label">{label}</label>
            <div className="file-upload">
                <button
                    type="button"
                    className="upload-button"
                    onClick={() => document.getElementById(name).click()}
                >
                    <Icon className="icon" />
                    {formData[name] ? `${label} Uploaded` : `Upload ${label}`}
                </button>
                <input
                    id={name}
                    type="file"
                    className="file-input"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, name)}
                />
                {previews[name] && (
                    <div className="upload-preview">
                        <img src={previews[name]} alt={label} className="preview-image" />
                    </div>
                )}
                {errors[name] && (
                    <p className="error-text">{errors[name]}</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="driver-application">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Become a Driver</h2>
                    <p className="card-description">
                        Join our community of professional drivers and start earning with GlideWay
                    </p>
                </div>

                <div className="card-content">
                    <form onSubmit={handleSubmit}>
                        {/* Personal Information */}
                        <div className="form-section">
                            <h3 className="section-header">Personal Information</h3>
                            {renderField('Full Name', 'name')}
                            {renderField('Email Address', 'email', 'email')}
                            {renderField('Phone Number', 'phone_number', 'tel')}

                            <div className="field-row">
                                {renderField('Password', 'password', 'password')}
                                {renderField('Confirm Password', 'confirm_password', 'password')}
                            </div>

                            <div className="field-row">
                                <div className="field-group">
                                    <label htmlFor="gender" className="label required-label">Gender</label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="select"
                                    >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {errors.gender && (
                                        <p className="error-text">{errors.gender}</p>
                                    )}
                                </div>
                                {renderField('Age', 'age', 'number')}
                            </div>

                            {renderFileUpload('Profile Picture', 'profile_picture_url', Camera)}
                        </div>

                        {/* Driver Information */}
                        <div className="form-section">
                            <h3 className="section-header">Driver Information</h3>
                            {renderField('License Number', 'license_number')}
                            {renderFileUpload('License Photo', 'license_photo', Upload)}
                        </div>

                        {/* Vehicle Information */}
                        <div className="form-section">
                            <h3 className="section-header">Vehicle Information</h3>
                            <div className="field-row">
                                {renderField('Vehicle Make', 'vehicle_details.make')}
                                {renderField('Vehicle Model', 'vehicle_details.model')}
                            </div>
                            {renderField('Registration Number', 'vehicle_details.registration_number')}
                            {renderFileUpload('Insurance Document', 'vehicle_insurance_url', Shield)}
                        </div>
                    </form>
                </div>

                <div className="card-footer">
                    {submitStatus && (
                        <div className={`status-message ${submitStatus.type === 'success' ? 'status-success' : 'status-error'}`}>
                            {submitStatus.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BecomeDriver;
