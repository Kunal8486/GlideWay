import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate, useLocation } from "react-router-dom";
import "./Login.css"; // Assume we're updating this file with new styles

const Login = ({ handleLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const recaptchaRef = useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [captchaToken, setCaptchaToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  // Environment variable validation
  useEffect(() => {
    const requiredEnvVars = {
      'REACT_APP_GOOGLE_CLIENT_ID': process.env.REACT_APP_GOOGLE_CLIENT_ID,
      'REACT_APP_API_BASE_URL': process.env.REACT_APP_API_BASE_URL,
      'REACT_APP_RECAPTCHA_SITE_KEY': process.env.REACT_APP_RECAPTCHA_SITE_KEY
    };

    Object.entries(requiredEnvVars).forEach(([name, value]) => {
      if (!value) {
        console.error(`Missing environment variable: ${name}`);
        setError(`Configuration error. Please contact support.`);
      }
    });
  }, []);

  // Handle account lockout countdown
  useEffect(() => {
    let interval;
    if (isLocked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer(prevTime => {
          if (prevTime <= 1) {
            setIsLocked(false);
            clearInterval(interval);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockTimer]);

  // Form validation function
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Invalid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (!captchaToken) {
      errors.captcha = "Please complete the reCAPTCHA";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      const newErrors = { ...formErrors };
      delete newErrors[name];
      setFormErrors(newErrors);
    }

    // Clear global error when user modifies the form
    if (error) {
      setError("");
    }
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);

    // Clear captcha error if a token is received
    if (formErrors.captcha) {
      const newErrors = { ...formErrors };
      delete newErrors.captcha;
      setFormErrors(newErrors);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: ""
    });
    setFormErrors({});
    setError("");
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
    setCaptchaToken(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Check if account is locked
    if (isLocked) {
      setError(`Account temporarily locked. Try again in ${lockTimer} seconds.`);
      return;
    }

    // Validate form
    if (!validateForm()) return;

    setIsSubmitting(true);
    setIsLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/login`,
        {
          ...formData,
          captchaToken  // Send captcha token to backend for verification
        },
        { 
          withCredentials: true,
          timeout: 10000 // 10 second timeout
        }
      );

      // Reset login attempts on successful login
      setLoginAttempts(0);
      
      // Show success message
      setSuccess("Login successful! Redirecting...");
      
      // Call handleLogin with token and role
      handleLogin(response.data.token, 'rider');

      // Success notification and redirect after a short delay
      setTimeout(() => {
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      }, 1000);
      
    } catch (error) {
      // Increment login attempts
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      // Lock account after 5 failed attempts
      if (newAttempts >= 5) {
        setIsLocked(true);
        setLockTimer(60); // 60-second lockout
        setError("Too many failed attempts. Account locked for 60 seconds.");
      } else {
        // Handle different error scenarios
        if (!error.response) {
          setError("Network error. Please check your connection and try again.");
        } else if (error.response.status === 429) {
          setError("Too many requests. Please try again later.");
        } else if (error.response.status === 401) {
          setError("Invalid email or password. Please try again.");
        } else if (error.response.status === 403) {
          setError("Your account has been suspended. Please contact support.");
        } else {
          setError(error.response?.data?.error || 'Login failed. Please try again.');
        }
      }
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
      
      // Reset captcha
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setCaptchaToken(null);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      // Check if account is locked
      if (isLocked) {
        setError(`Account temporarily locked. Try again in ${lockTimer} seconds.`);
        setIsLoading(false);
        return;
      }
      
      
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/google`,
        {
          token: credentialResponse.credential,
          captchaToken  // Send captcha token to backend for verification
        },
        { 
          withCredentials: true,
          timeout: 10000 // 10 second timeout
        }
      );

      // Reset login attempts on successful login
      setLoginAttempts(0);
      
      // Show success message
      setSuccess("Google login successful! Redirecting...");
      
      handleLogin(res.data.token, 'rider');

      // Success notification and redirect after a short delay
      setTimeout(() => {
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      }, 1000);
    } catch (err) {
      // Increment login attempts
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      // Lock account after 5 failed attempts
      if (newAttempts >= 5) {
        setIsLocked(true);
        setLockTimer(60); // 60-second lockout
        setError("Too many failed attempts. Account locked for 60 seconds.");
      } else {
        setError("Google login failed. Please try again or use email login.");
      }
    } finally {
      setIsLoading(false);
      
      // Reset captcha
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setCaptchaToken(null);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="rid-login-container">
      {/* Background animation elements */}
      <div className="rid-login-bg-animation">
        <div className="rid-bg-circle rid-circle-1"></div>
        <div className="rid-bg-circle rid-circle-2"></div>
        <div className="rid-bg-circle rid-circle-3"></div>
        <div className="rid-bg-shape rid-shape-1"></div>
        <div className="rid-bg-shape rid-shape-2"></div>
      </div>
      
      <div className="rid-login-wrapper">
        <div className="rid-login-brand">
          <div className="rid-logo-container">
            <h1 className="rid-logo">Glide Way</h1>
          </div>
          <div className="rid-brand-message">
            <h2>Travel with ease</h2>
            <p>Your journey is our priority</p>
          </div>
        </div>

        <div className="rid-login-card">
          <div className="rid-login-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account</p>
          </div>

          {error && (
            <div className="rid-alert rid-alert-error" role="alert">
              <div className="rid-alert-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="rid-alert rid-alert-success" role="alert">
              <div className="rid-alert-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <p>{success}</p>
            </div>
          )}

          <form className="rid-login-form" onSubmit={handleSubmit} noValidate>
            <div className="rid-form-group">
              <label htmlFor="email" className="rid-form-label">Email address</label>
              <div className="rid-input-wrapper">
                <div className="rid-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={formErrors.email ? 'rid-input rid-input-error' : 'rid-input'}
                  disabled={isLocked || isLoading}
                />
              </div>
              {formErrors.email && (
                <span className="rid-error-message">
                  {formErrors.email}
                </span>
              )}
            </div>

            <div className="rid-form-group">
              <label htmlFor="password" className="rid-form-label">Password</label>
              <div className="rid-input-wrapper">
                <div className="rid-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={formErrors.password ? 'rid-input rid-input-error' : 'rid-input'}
                  disabled={isLocked || isLoading}
                />
                <button
                  type="button"
                  className="rid-password-toggle"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLocked || isLoading}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                      <line x1="4" y1="4" x2="20" y2="20"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              {formErrors.password && (
                <span className="rid-error-message">
                  {formErrors.password}
                </span>
              )}
            </div>

            <div className="rid-form-options">
              <div className="rid-remember-me">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="rid-checkbox"
                  disabled={isLocked || isLoading}
                />
                <label htmlFor="remember-me" className="rid-checkbox-label">
                  Remember me
                </label>
              </div>

              <div className="rid-forgot-password">
                <a href="/rider-forgot-password" className="rid-link">Forgot password?</a>
              </div>
            </div>

            {/* reCAPTCHA Component */}
            <div className="rid-recaptcha-container">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                onChange={handleCaptchaChange}
              />
              {formErrors.captcha && (
                <span className="rid-error-message">
                  {formErrors.captcha}
                </span>
              )}
            </div>

            <div className="rid-form-actions">
              <button
                type="submit"
                disabled={isLocked || isLoading}
                className={`rid-submit-button ${isLoading ? 'rid-loading' : ''}`}
              >
                {isLoading ? (
                  <span className="rid-loading-text">
                    <span className="rid-spinner"></span>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="rid-reset-button"
                disabled={isLocked || isLoading}
              >
                Reset
              </button>
            </div>
          </form>

          <div className="rid-separator">
            <span>Or continue with</span>
          </div>

          <div className="rid-social-login">
            <GoogleOAuthProvider
              clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            >
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError("Google Login Failed")}
                theme="outline"
                size="large"
                shape="pill"
                disabled={isLocked || isLoading}
              />
            </GoogleOAuthProvider>
          </div>
          
          <div className="rid-signup-prompt">
            <p>Don't have an account?</p>
            <a href="/signup" className="rid-signup-link">Sign up</a>
          </div>
          
          <div className="rid-partner-login">
            <a
              href="/driver/login"
              className="rid-partner-login-btn"
            >
              Login as Partner
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;