"use client"

import React, { useState, useEffect } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate, useLocation } from "react-router-dom";
import "./Login.css";

const Login = ({ handleLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();

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
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

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

  // Form validation function
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/login`,
        {
          ...formData,
          captchaToken  // Send captcha token to backend for verification
        },
        { withCredentials: true }
      );

      // Call handleLogin with token and role
      handleLogin(response.data.token, 'rider');

      // Success notification or redirect
      const from = location.state?.from?.pathname || "/rider-dashboard";
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


  const handleGoogleLogin = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/google`,
        {
          token: credentialResponse.credential,
          captchaToken  // Send captcha token to backend for verification
        },
        { withCredentials: true }
      );

      handleLogin(res.data.token, 'rider');

      setSuccess(res.data.message);

      
    } catch (err) {
      setError("Google login failed");
    } 
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h2>Glide Way</h2>
          <p>Sign in to your account</p>
        </div>

        {error && (
          <div className="alert error" role="alert">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="alert success" role="alert">
            <p>{success}</p>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className={formErrors.email ? 'input-error' : ''}
            />
            {formErrors.email && (
              <span className="error-message">
                {formErrors.email}
              </span>
            )}
          </div>

          <div className="form-group password-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className={formErrors.password ? 'input-error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {formErrors.password && (
              <span className="error-message">
                {formErrors.password}
              </span>
            )}
          </div>

          <div className="form-options">
            <div className="remember-me">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
              />
              <label htmlFor="remember-me">
                Remember me
              </label>
            </div>

            <div className="forgot-password">
              <a href="/rider-forgot-password">Forgot your password?</a>
            </div>
          </div>

          {/* reCAPTCHA Component */}
          <div className="recaptcha-container">
            <ReCAPTCHA
              sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
              onChange={handleCaptchaChange}
            />
            {formErrors.captcha && (
              <span className="error-message">
                {formErrors.captcha}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`submit-button ${isLoading ? 'loading' : ''}`}
          >
            {isLoading ? (
              <span className="loading-text">
                <span className="spinner"></span>
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="separator">
          <span>Or continue with</span>
        </div>

        <div className="social-login">
          <GoogleOAuthProvider
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
          >
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError("Google Login Failed")}
              theme="outline"
              size="large"
              shape="pill"
            />
          </GoogleOAuthProvider>
        </div>

        <p className="signup-prompt">
          Don't have an account?{" "}
          <a href="/signup">Sign up</a>
        </p>
        <div className="partner-login">
          <a
            href="/driver-login"
            className="partner-login-btn"

          >
            Login as Partner
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;