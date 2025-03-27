import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReCAPTCHA from "react-google-recaptcha";
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './DriverLogin.css';

const DriverLogin = ({ handleLogin }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);

    // Environment variable validation
    useEffect(() => {
        const requiredEnvVars = [
            process.env.GOOGLE_CLIENT_ID,
            process.env.REACT_APP_API_BASE_URL,
            process.env.REACT_APP_RECAPTCHA_SITE_KEY
        ];
        
        requiredEnvVars.forEach(varName => {
            if (!process.env[varName]) {
                console.error(`Missing environment variable: ${varName}`);
            }
        });
    }, []);

    // Comprehensive validation rules
    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        // Captcha validation
        if (!captchaToken) {
            newErrors.captcha = 'Please complete the reCAPTCHA verification';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear specific error when user starts typing
        if (errors[name]) {
            const newErrors = { ...errors };
            delete newErrors[name];
            setErrors(newErrors);
        }
    };

    const handleCaptchaChange = (token) => {
        setCaptchaToken(token);
        
        // Clear captcha error if a token is received
        if (errors.captcha) {
            const newErrors = { ...errors };
            delete newErrors.captcha;
            setErrors(newErrors);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Validate form
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/api/driver/login`, 
                {
                    email: formData.email,
                    password: formData.password,
                    captchaToken
                },
                { 
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true 
                }
            );

            // Call handleLogin with token and role
            handleLogin(response.data.token, 'driver');

            // Success notification or redirect
            const from = location.state?.from?.pathname || "/driver-dashboard";
            navigate(from, { replace: true });
        } catch (error) {
            setErrors({
                submit: error.response?.data?.error || 'Login failed. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
            // Reset captcha
            if (window.grecaptcha) {
                window.grecaptcha.reset();
            }
            setCaptchaToken(null);
        }
    };


    return (
        <div className="driver-login-container">
            <div className="login-card">
                <div className="card-header">
                    <h2>Driver Portal</h2>
                    <p>Sign in to your driver account</p>
                </div>

                {/* Error Banner */}
                {errors.submit && (
                    <div className="error-banner">
                        <AlertCircle size={20} className="error-icon" />
                        <span>{errors.submit}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form" noValidate>
                    {/* Email Input */}
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            className={errors.email ? 'input-error' : ''}
                            required
                        />
                        {errors.email && (
                            <span className="error-message">
                                <AlertCircle size={16} />
                                {errors.email}
                            </span>
                        )}
                    </div>

                    {/* Password Input */}
                    <div className="form-group password-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                id="password"
                                type={passwordVisible ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Enter your password"
                                className={errors.password ? 'input-error' : ''}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setPasswordVisible(!passwordVisible)}
                                aria-label={passwordVisible ? "Hide password" : "Show password"}
                            >
                                {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.password && (
                            <span className="error-message">
                                <AlertCircle size={16} />
                                {errors.password}
                            </span>
                        )}
                    </div>

                    {/* reCAPTCHA */}
                    <div className="recaptcha-container">
                        <ReCAPTCHA
                            sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                            onChange={handleCaptchaChange}
                        />
                        {errors.captcha && (
                            <span className="error-message">
                                <AlertCircle size={16} />
                                {errors.captcha}
                            </span>
                        )}
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        className={`login-button ${isSubmitting ? 'submitting' : ''}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="loading-indicator">
                                <span className="spinner"></span>
                                Logging in...
                            </span>
                        ) : (
                            <>
                                <LogIn size={20} />
                                Log In
                            </>
                        )}
                    </button>


                    {/* Additional Links */}
                    <div className="form-footer">
                        <p>
                            Don't have a driver account? 
                            <Link to="/become-driver" className="accent-link">
                                Register as a driver
                            </Link>
                        </p>
                        <p>
                            <Link to="/driver/forgot-password" className="accent-link">
                                Forgot password?
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DriverLogin;