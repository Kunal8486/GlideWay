import React, { useState, useEffect, useCallback } from 'react';
import { 
  Eye, EyeOff, Upload, X, CheckCircle, AlertCircle, 
  UserCheck, Car, FileText, Camera, Calendar, PhoneCall, 
  Info, Lock, Shield, Star 
} from 'lucide-react';
import './BecomeDriver.css';

const BecomeDriver = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    gender: '',
    age: '',
    referral_code: '',

    // Vehicle Information
    vehicle_make: '',
    vehicle_model: '',
    vehicle_registration: '',
    vehicle_year: '',
    vehicle_color: '',

    // License Information
    license_number: '',
    license_expiry: '',
    license_state: '',

    // Document Uploads
    profile_picture: null,
    license_front: null,
    license_back: null,
    vehicle_insurance: null
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirm_password: false
  });
  const [previews, setPreviews] = useState({
    profile_picture: null,
    license_front: null,
    license_back: null,
    vehicle_insurance: null
  });

  // Validation Rules
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
    referral_code: (value) => {
      return value && !/^[A-Z0-9]{6}$/i.test(value) 
        ? 'Referral code must be 6 alphanumeric characters' 
        : '';
    },
    vehicle_make: (value) => !value.trim() ? 'Vehicle make is required' : '',
    vehicle_model: (value) => !value.trim() ? 'Vehicle model is required' : '',
    vehicle_registration: (value) => {
      if (!value.trim()) return 'Vehicle registration is required';
      if (value.length < 5) return 'Invalid registration number';
      return '';
    },
    vehicle_year: (value) => {
      if (!value) return 'Vehicle year is required';
      const year = parseInt(value);
      const currentYear = new Date().getFullYear();
      if (year < 1990 || year > currentYear + 1) {
        return 'Invalid vehicle year';
      }
      return '';
    },
    vehicle_color: (value) => !value.trim() ? 'Vehicle color is required' : '',
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
    license_state: (value) => !value.trim() ? 'License state is required' : '',
    profile_picture: (file) => !file ? 'Profile picture is required' : '',
    license_front: (file) => !file ? 'Front license photo is required' : '',
    license_back: (file) => !file ? 'Back license photo is required' : '',
    vehicle_insurance: (file) => !file ? 'Vehicle insurance document is required' : ''
  };

  // Validation Functions
  const validateField = (name, value) => {
    const validateRule = validationRules[name];
    return validateRule ? validateRule(value) : '';
  };

  const validateStepFields = (step) => {
    const stepsFields = {
      1: ['name', 'email', 'phone_number', 'password', 'confirm_password', 'gender', 'age', 'referral_code'],
      2: ['vehicle_make', 'vehicle_model', 'vehicle_registration', 'vehicle_year', 'vehicle_color'],
      3: ['license_number', 'license_expiry', 'license_state'],
      4: ['profile_picture', 'license_front', 'license_back', 'vehicle_insurance']
    };

    const newErrors = {};
    stepsFields[step].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    return newErrors;
  };

  // Input Handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // File Upload Handling
  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

    let error = '';
    if (file.size > maxSize) {
      error = 'File size must be less than 5MB';
    } else if (!validTypes.includes(file.type)) {
      error = 'Only JPG, JPEG, PNG, and PDF files are allowed';
    }

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

  // Step Navigation
  const nextStep = () => {
    const stepErrors = validateStepFields(currentStep);
    
    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
      setErrors({});
    } else {
      setErrors(stepErrors);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const allErrors = {
      ...validateStepFields(1),
      ...validateStepFields(2),
      ...validateStepFields(3),
      ...validateStepFields(4)
    };

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
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

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/driver/register`, {
        method: "POST",
        body: formDataObject,
      });

      const data = await response.json();
      
      if (response.ok) {
        alert("Driver registered successfully!");
        // Reset form
        resetForm();
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

  // Form Reset Method
  const resetForm = () => {
    setFormData({
      name: '', email: '', phone_number: '', password: '', confirm_password: '',
      gender: '', age: '', referral_code: '',
      vehicle_make: '', vehicle_model: '', vehicle_registration: '', 
      vehicle_year: '', vehicle_color: '',
      license_number: '', license_expiry: '', license_state: '',
      profile_picture: null, license_front: null, 
      license_back: null, vehicle_insurance: null
    });
    setPreviews({
      profile_picture: null, license_front: null, 
      license_back: null, vehicle_insurance: null
    });
    setCurrentStep(1);
    setTouched({});
    setErrors({});
  };

  // Render Input Fields
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

  // File Upload Render
  const renderFileUpload = (field, label) => (
    <div className="file-upload-section">
      <label className="label required-label">{label}</label>
      <div className="file-upload">
        <label className={`upload-button ${errors[field] && touched[field] ? 'error' : ''}`}>
          <Upload size={20} />
          <span>Upload {label}</span>
          <input
            type="file"
            accept="image/*,application/pdf"
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

  // Progress Bar Component
  const ProgressBar = () => {
    const steps = [
      { icon: <UserCheck />, title: 'Personal' },
      { icon: <Car />, title: 'Vehicle' },
      { icon: <FileText />, title: 'License' },
      { icon: <Camera />, title: 'Documents' },
      { icon: <CheckCircle />, title: 'Submit' }
    ];

    return (
      <div className="progress-container">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={`progress-step ${currentStep === index + 1 ? 'active' : index + 1 < currentStep ? 'completed' : ''}`}
          >
            <div className="progress-icon">{step.icon}</div>
            <div className="progress-title">{step.title}</div>
          </div>
        ))}
      </div>
    );
  };

  // Step Rendering Methods
  const renderPersonalInformation = () => (
    <div className="step-section">
      <h2 className="step-title"><UserCheck /> Personal Information</h2>
      <div className="form-grid">
        {renderField('Name', 'name')}
        {renderField('Email', 'email', 'email')}
        {renderField('Phone Number', 'phone_number', 'tel')}
        
        <div className="password-container">
          {renderField('Password', 'password', showPassword.password ? 'text' : 'password')}
          <button 
            type="button" 
            onClick={() => togglePasswordVisibility('password')} 
            className="password-toggle"
          >
          </button>
        </div>
        
        <div className="password-container">
          {renderField('Confirm Password', 'confirm_password', showPassword.confirm_password ? 'text' : 'password')}
          <button 
            type="button" 
            onClick={() => togglePasswordVisibility('confirm_password')} 
            className="password-toggle"
          >
          </button>
        </div>

        {renderField('Gender', 'gender', 'select', [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' }
        ])}
        {renderField('Age', 'age', 'number')}
        {renderField('Referral Code (Optional)', 'referral_code')}
      </div>
    </div>
  );

  const renderVehicleInformation = () => (
    <div className="step-section">
      <h2 className="step-title"><Car /> Vehicle Information</h2>
      <div className="form-grid">
        {renderField('Vehicle Make', 'vehicle_make')}
        {renderField('Vehicle Model', 'vehicle_model')}
        {renderField('Vehicle Registration', 'vehicle_registration')}
        {renderField('Vehicle Year', 'vehicle_year', 'number')}
        {renderField('Vehicle Color', 'vehicle_color')}
      </div>
    </div>
  );

  const renderLicenseInformation = () => (
    <div className="step-section">
      <h2 className="step-title"><FileText /> License Details</h2>
      <div className="form-grid">
        {renderField('License Number', 'license_number')}
        {renderField('License Expiry Date', 'license_expiry', 'date')}
        {renderField('License State', 'license_state')}
      </div>
    </div>
  );

  const renderDocumentUploads = () => (
    <div className="step-section">
      <h2 className="step-title"><Camera /> Document Uploads</h2>
      <div className="form-grid">
        {renderFileUpload('profile_picture', 'Profile Picture')}
        {renderFileUpload('license_front', 'License Front')}
        {renderFileUpload('license_back', 'License Back')}
        {renderFileUpload('vehicle_insurance', 'Vehicle Insurance')}
      </div>
    </div>
  );

  const renderSubmitReview = () => (
    <div className="step-section">
      <h2 className="step-title"><CheckCircle /> Review & Submit</h2>
      <div className="review-section">
        <div className="review-column">
          <h3>Personal Information</h3>
          <p><strong>Name:</strong> {formData.name}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Phone:</strong> {formData.phone_number}</p>
          <p><strong>Gender:</strong> {formData.gender}</p>
          <p><strong>Age:</strong> {formData.age}</p>
          {formData.referral_code && <p><strong>Referral Code:</strong> {formData.referral_code}</p>}
        </div>
        <div className="review-column">
          <h3>Vehicle Details</h3>
          <p><strong>Make:</strong> {formData.vehicle_make}</p>
          <p><strong>Model:</strong> {formData.vehicle_model}</p>
          <p><strong>Registration:</strong> {formData.vehicle_registration}</p>
          <p><strong>Year:</strong> {formData.vehicle_year}</p>
          <p><strong>Color:</strong> {formData.vehicle_color}</p>
        </div>
        <div className="review-column">
          <h3>License Information</h3>
          <p><strong>License Number:</strong> {formData.license_number}</p>
          <p><strong>Expiry Date:</strong> {formData.license_expiry}</p>
          <p><strong>State:</strong> {formData.license_state}</p>
        </div>
        <div className="review-column">
          <h3>Uploaded Documents</h3>
          {previews.profile_picture && <p>Profile Picture: Uploaded</p>}
          {previews.license_front && <p>License Front: Uploaded</p>}
          {previews.license_back && <p>License Back: Uploaded</p>}
          {previews.vehicle_insurance && <p>Vehicle Insurance: Uploaded</p>}
        </div>
      </div>
    </div>
  );

  // Cleanup for file previews
  useEffect(() => {
    return () => {
      Object.values(previews).forEach(preview => {
        if (preview) URL.revokeObjectURL(preview);
      });
    };
  }, []);

  // Main Render
  return (
    <div className="driver-registration-container">
      <form onSubmit={handleSubmit} className="registration-card">
        <ProgressBar />
        
        <div className="form-content">
          {currentStep === 1 && renderPersonalInformation()}
          {currentStep === 2 && renderVehicleInformation()}
          {currentStep === 3 && renderLicenseInformation()}
          {currentStep === 4 && renderDocumentUploads()}
          {currentStep === 5 && renderSubmitReview()}

          {errors.submit && (
            <div className="error-banner">
              <AlertCircle size={20} />
              {errors.submit}
            </div>
          )}

          <div className="navigation-buttons">
            {currentStep > 1 && (
              <button 
                type="button" 
                onClick={prevStep} 
                className="btn btn-secondary"
              >
                Previous
              </button>
            )}
            {currentStep < 5 && (
              <button 
                type="button" 
                onClick={nextStep} 
                className="btn btn-primary"
              >
                Next
              </button>
            )}
            {currentStep === 5 && (
              <button 
                type="submit" 
                className={`btn btn-success ${isSubmitting ? 'submitting' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default BecomeDriver;