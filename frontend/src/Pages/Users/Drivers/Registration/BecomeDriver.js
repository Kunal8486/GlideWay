import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import './BecomeDriver.css';
const BecomeDriver = () => {
    const initialFormState = {
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
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [previews, setPreviews] = useState({
        profile_picture: null,
        license_front: null,
        license_back: null
    });

    // Field validation rules
    const validationRules = {
        name: (value) => {
            if (!value.trim()) return 'Name is required';
            if (value.trim().length < 2) return 'Name must be at least 2 characters';
            return '';
        },
        email: (value) => {
            if (!value.trim()) return 'Email is required';
            if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                return 'Invalid email address';
            }
            return '';
        },
        phone_number: (value) => {
            if (!value.trim()) return 'Phone number is required';
            const cleanNumber = value.replace(/[^\d]/g, '');
            if (cleanNumber.length !== 10) return 'Phone number must be 10 digits';
            return '';
        },
        password: (value) => {
            if (!value) return 'Password is required';
            if (value.length < 8) return 'Password must be at least 8 characters';
            if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                return 'Password must contain uppercase, lowercase and numbers';
            }
            return '';
        },
        confirm_password: (value) => {
            if (!value) return 'Please confirm your password';
            if (value !== formData.password) return 'Passwords do not match';
            return '';
        },
        gender: (value) => !value ? 'Please select your gender' : '',
        age: (value) => {
            if (!value) return 'Age is required';
            if (value < 18) return 'Must be at least 18 years old';
            if (value > 70) return 'Age cannot exceed 70 years';
            return '';
        },
        license_number: (value) => {
            if (!value.trim()) return 'License number is required';
            if (value.length < 5) return 'Invalid license number format';
            return '';
        },
        license_expiry: (value) => {
            if (!value) return 'License expiry date is required';
            const expiryDate = new Date(value);
            const today = new Date();
            if (expiryDate < today) return 'License has expired';
            return '';
        },
        vehicle_make: (value) => !value.trim() ? 'Vehicle make is required' : '',
        vehicle_model: (value) => !value.trim() ? 'Vehicle model is required' : '',
        vehicle_registration: (value) => {
            if (!value.trim()) return 'Vehicle registration is required';
            if (value.length < 5) return 'Invalid registration number';
            return '';
        },
        profile_picture: (file) => {
            if (!file) return 'Profile picture is required';
            return '';
        },
        license_front: (file) => {
            if (!file) return 'Front license photo is required';
            return '';
        },
        license_back: (file) => {
            if (!file) return 'Back license photo is required';
            return '';
        }
    };

    // Validate single field
    const validateField = (name, value) => {
        const validateRule = validationRules[name];
        return validateRule ? validateRule(value) : '';
    };

    // Validate all fields
    const validateForm = () => {
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });
        return newErrors;
    };

    // Handle input blur for validation
    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, formData[name]);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // If field has been touched, validate on change
        if (touched[name]) {
            const error = validateField(name, value);
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const validateFileUpload = (file, field) => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];

        if (!file) {
            return 'File is required';
        }

        if (file.size > maxSize) {
            return 'File size must be less than 5MB';
        }

        if (!validTypes.includes(file.type)) {
            return 'Only JPG, JPEG, and PNG files are allowed';
        }

        return '';
    };

    const handleFileUpload = (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        const error = validateFileUpload(file, field);
        if (error) {
            setErrors(prev => ({ ...prev, [field]: error }));
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setPreviews(prev => ({ ...prev, [field]: previewUrl }));
        setFormData(prev => ({ ...prev, [field]: file }));
        setErrors(prev => ({ ...prev, [field]: '' }));
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const removeFile = (field) => {
        setPreviews(prev => ({ ...prev, [field]: null }));
        setFormData(prev => ({ ...prev, [field]: null }));
        if (touched[field]) {
            setErrors(prev => ({ ...prev, [field]: 'File is required' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Touch all fields
        const allTouched = Object.keys(formData).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setTouched(allTouched);

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            // Scroll to first error
            const firstError = document.querySelector('.error-message');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataObject = new FormData();
            Object.keys(formData).forEach((key) => {
                if (formData[key] !== null) {
                    formDataObject.append(key, formData[key]);
                }
            });

            const response = await fetch("http://localhost:5500/api/driver/register", {
                method: "POST",
                body: formDataObject,
            });

            const data = await response.json();
            
            if (response.ok) {
                alert("Driver registered successfully!");
                // Reset form
                setFormData(initialFormState);
                setPreviews({
                    profile_picture: null,
                    license_front: null,
                    license_back: null
                });
                setTouched({});
                setErrors({});
            } else {
                throw new Error(data.error || 'Registration failed');
            }
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                submit: error.message || 'Error registering driver'
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Cleanup previews on unmount
    useEffect(() => {
        return () => {
            Object.values(previews).forEach(preview => {
                if (preview) URL.revokeObjectURL(preview);
            });
        };
    }, []);

    const renderFileUpload = (field, label) => (
        <div className="file-upload-section">
            <label className="label required-label">{label}</label>
            <div className="file-upload">
                <label className={`upload-button ${errors[field] && touched[field] ? 'error' : ''}`}>
                    <Upload size={20} />
                    <span>Upload {label}</span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, field)}
                        onBlur={(e) => handleBlur(e)}
                        name={field}
                    />
                </label>
                {previews[field] && (
                    <div className="preview-container">
                        <img src={previews[field]} alt={`${label} preview`} className="preview-image" />
                        <button
                            type="button"
                            onClick={() => removeFile(field)}
                            className="remove-preview"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}
                {errors[field] && touched[field] && (
                    <span className="error-message">
                        <AlertCircle size={16} />
                        {errors[field]}
                    </span>
                )}
            </div>
        </div>
    );

    const renderField = (label, name, type = 'text', options = null) => (
        <div className="form-group">
            <label className="label required-label">{label}</label>
            {type === 'select' ? (
                <select
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`select ${errors[name] && touched[name] ? 'error' : ''}`}
                >
                    <option value="">Select {label}</option>
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            ) : type === 'password' ? (
                <div className="password-field">
                    <input
                        type={name === 'password' ? (passwordVisible ? 'text' : 'password') : (confirmPasswordVisible ? 'text' : 'password')}
                        name={name}
                        value={formData[name]}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`input ${errors[name] && touched[name] ? 'error' : ''}`}
                    />
                    <button
                        type="button"
                        onClick={() => name === 'password' ? setPasswordVisible(!passwordVisible) : setConfirmPasswordVisible(!confirmPasswordVisible)}
                        className="toggle-password"
                    >
                        {(name === 'password' ? passwordVisible : confirmPasswordVisible) ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`input ${errors[name] && touched[name] ? 'error' : ''}`}
                />
            )}
            {errors[name] && touched[name] && (
                <span className="error-message">
                    <AlertCircle size={16} />
                    {errors[name]}
                </span>
            )}
        </div>
    );

    return (
        <div className="driver-application">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Become a Driver</h2>
                    <p className="card-subtitle">Join our network of professional drivers</p>
                </div>

                <form onSubmit={handleSubmit} className="card-content">
                    <section>
                        <h3 className="section-header">Personal Information</h3>
                        {renderField('Name', 'name')}
                        {renderField('Email', 'email', 'email')}
                        {renderField('Phone Number', 'phone_number', 'tel')}
                        {renderField('Password', 'password', 'password')}
                        {renderField('Confirm Password', 'confirm_password', 'password')}
                        {renderField('Gender', 'gender', 'select', [
                            { value: 'male', label: 'Male' },
                            { value: 'female', label: 'Female' },
                            { value: 'other', label: 'Other' }
                        ])}
                        {renderField('Age', 'age', 'number')}
                    </section>

                    <section>
                        <h3 className="section-header">Vehicle Information</h3>
                        {renderField('Vehicle Make', 'vehicle_make')}
                        {renderField('Vehicle Model', 'vehicle_model')}
                        {renderField('Vehicle Registration', 'vehicle_registration')}
                    </section>

                    <section>
                        <h3 className="section-header">Driver's License</h3>
                        {renderField('License Number', 'license_number')}
                        {renderField('License Expiry Date', 'license_expiry', 'date')}
                    </section>

                    <section>
                        <h3 className="section-header">Required Documents</h3>
                        {renderFileUpload('profile_picture', 'Profile Picture')}
                        {renderFileUpload('license_front', 'License Front')}
                        {renderFileUpload('license_back', 'License Back')}
                    </section>

                    {errors.submit && (
                        <div className="error-banner">
                            <AlertCircle size={20} />
                            {errors.submit}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="loading-text">Submitting...</span>
                        ) : (
                            <span className="submit-text">
                                <CheckCircle size={20} />
                                Submit Application
                            </span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BecomeDriver;