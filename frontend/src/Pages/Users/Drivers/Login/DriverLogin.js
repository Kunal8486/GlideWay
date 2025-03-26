import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import './DriverLogin.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);

    // Validation rules
    const validationRules = {
        email: (value) => {
            if (!value.trim()) return 'Email is required';
            if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                return 'Invalid email address';
            }
            return '';
        },
        password: (value) => {
            if (!value) return 'Password is required';
            return '';
        }
    };

    // Validate single field
    const validateField = (name, value) => {
        const validateRule = validationRules[name];
        return validateRule ? validateRule(value) : '';
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Touch all fields
        const allTouched = Object.keys(formData).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setTouched(allTouched);

        // Validate all fields
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/driver/login`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();
            
            if (response.ok) {
                // Store token in localStorage
                localStorage.setItem('driverToken', data.token);
                // Redirect to driver dashboard
                window.location.href = '/driver/dashboard';
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                submit: error.message || 'Invalid email or password'
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = (label, name, type = 'text') => (
        <div className="form-group">
            <label className="label required-label">{label}</label>
            {type === 'password' ? (
                <div className="password-field">
                    <input
                        type={passwordVisible ? 'text' : 'password'}
                        name={name}
                        value={formData[name]}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`input ${errors[name] && touched[name] ? 'error' : ''}`}
                    />
                    <button
                        type="button"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        className="toggle-password"
                    >
                        {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
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
        <div className="driver-login">
            <div className="login-card">
                <div className="card-header">
                    <h2 className="card-title">Driver Login</h2>
                    <p className="card-subtitle">Access your driver account</p>
                </div>

                <form onSubmit={handleSubmit} className="card-content">
                    {renderField('Email', 'email', 'email')}
                    {renderField('Password', 'password', 'password')}

                    {errors.submit && (
                        <div className="error-banner">
                            <AlertCircle size={20} />
                            {errors.submit}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`login-button ${isSubmitting ? 'submitting' : ''}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="loading-text">Logging in...</span>
                        ) : (
                            <span className="login-text">
                                <LogIn size={20} />
                                Log In
                            </span>
                        )}
                    </button>

                    <div className="form-footer">
                        <p>Don't have an account? <a href="/become-driver">Register as a driver</a></p>
                        <p><a href="/driver/forgot-password">Forgot password?</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;