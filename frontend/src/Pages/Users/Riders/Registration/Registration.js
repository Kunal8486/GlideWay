import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import ReCAPTCHA from "react-google-recaptcha"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import { useNavigate, useLocation } from "react-router-dom"
import "./Registration.css"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "950973384946-h3kdaot9u66156jjm8mo9our9pegl9ue.apps.googleusercontent.com"
const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY

const Registration = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const recaptchaRef = useRef(null)

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    email_verification_code: "",
    phone_number: "",
    password: "",
    confirm_password: "",
    gender: "",
    dob: "",
    googleId: undefined,
  })

  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState(null)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [resendAttempts, setResendAttempts] = useState(0)
  const [lastResendTime, setLastResendTime] = useState(null)

  // Environment variable validation
  useEffect(() => {
    const requiredEnvVars = {
      'GOOGLE_CLIENT_ID': GOOGLE_CLIENT_ID,
      'REACT_APP_API_BASE_URL': process.env.REACT_APP_API_BASE_URL,
      'REACT_APP_RECAPTCHA_SITE_KEY': RECAPTCHA_SITE_KEY
    };

    Object.entries(requiredEnvVars).forEach(([name, value]) => {
      if (!value) {
        console.error(`Missing environment variable: ${name}`);
        setServerError(`Configuration error. Please contact support.`);
      }
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
    
    // Clear server error when user makes changes
    if (serverError) {
      setServerError("")
    }
  }

  const sendEmailVerification = async () => {
    const currentTime = Date.now()
    const timeSinceLastResend = lastResendTime ? currentTime - lastResendTime : Infinity

    // Check if 900 seconds have passed since last resend
    if (timeSinceLastResend < 900000) {
      setServerError("Please wait 15 Min before requesting another code")
      return
    }

    // Prevent sending if maximum resend attempts reached
    if (resendAttempts >= 3) {
      setServerError("Maximum resend attempts reached. Please wait 5 minutes.")
      return
    }

    setIsLoading(true)
    setServerError("")
    setSuccess("")

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/send-verification-email`, {
        email: formData.email
      }, { timeout: 10000 })

      setSuccess(res.data.message || "Verification code sent to your email")
      
      // Update last resend time and attempts
      setLastResendTime(currentTime)
      setResendAttempts(prev => prev + 1)
      
      // Start the 900-second timer
      setResendTimer(900)
    } catch (err) {
      if (!err.response) {
        setServerError("Network error. Please check your connection and try again.")
      } else if (err.response.status === 429) {
        setServerError("Too many requests. Please try again later.")
      } else {
        const errorMessage = err.response?.data?.error || "Failed to send verification code"
        setServerError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Reset resend attempts after 5 minutes
  useEffect(() => {
    let resetTimeout;
    if (resendAttempts >= 3) {
      resetTimeout = setTimeout(() => {
        setResendAttempts(0)
        setLastResendTime(null)
      }, 5 * 60 * 1000) // 5 minutes
    }

    return () => {
      if (resetTimeout) clearTimeout(resetTimeout)
    }
  }, [resendAttempts])

  // Timer countdown effect
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prevTimer => {
          if (prevTimer <= 1) {
            clearInterval(timer)
            return 0
          }
          return prevTimer - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [resendTimer])

  const verifyEmailCode = async () => {
    setIsLoading(true)
    setServerError("")
    setSuccess("")

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/verify-email`, {
        email: formData.email,
        verification_code: formData.email_verification_code
      }, { timeout: 10000 })

      setIsEmailVerified(true)
      setSuccess(res.data.message || "Email verified successfully")
      setResendTimer(900)
      nextStep()
    } catch (err) {
      if (!err.response) {
        setServerError("Network error. Please check your connection and try again.")
      } else if (err.response.status === 429) {
        setServerError("Too many verification attempts. Please try again later.")
      } else {
        setServerError(err.response?.data?.error || "Invalid verification code")
      }
      setIsEmailVerified(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async (credentialResponse) => {
    setIsLoading(true);
    setServerError("");
    setSuccess("");
    
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/google`,
        {
          token: credentialResponse.credential,
          captchaToken  // Send captcha token to backend for verification
        },
        { 
          withCredentials: true,
          timeout: 10000 // 10 second timeout
        }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", "rider");
      setSuccess(res.data.message || "Google registration successful! Redirecting...");

      setTimeout(() => {
        const from = location.state?.from?.pathname || "/profile";
        navigate(from);
      }, 2000);
    } catch (err) {
      if (!err.response) {
        setServerError("Network error. Please check your connection and try again.");
      } else if (err.response.status === 409) {
        setServerError("Account already exists. Please login instead.");
      } else {
        setServerError(err.response?.data?.error || "Google login failed");
      }
    } finally {
      setIsLoading(false);
      // Reset captcha after submission
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setCaptchaToken(null);
    }
  };

  const validateStep = () => {
    const newErrors = {}

    switch (currentStep) {
      case 1:
        // Name validation
        if (!formData.name.trim()) {
          newErrors.name = "Name is required"
        } else if (formData.name.trim().length < 2) {
          newErrors.name = "Name must be at least 2 characters"
        }
        break;

      case 2:
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!formData.email) {
          newErrors.email = "Email is required"
        } else if (!emailRegex.test(formData.email)) {
          newErrors.email = "Please enter a valid email"
        }

        // Phone validation
        const phoneRegex = /^\d{10,15}$/
        if (!formData.phone_number) {
          newErrors.phone_number = "Phone number is required"
        } else if (!phoneRegex.test(formData.phone_number.replace(/[^\d]/g, ''))) {
          newErrors.phone_number = "Please enter a valid phone number"
        }
        break;

      case 3:
        // Email verification validation
        if (!formData.email_verification_code) {
          newErrors.email_verification_code = "Verification code is required"
        } else if (formData.email_verification_code.length !== 6 || !/^\d+$/.test(formData.email_verification_code)) {
          newErrors.email_verification_code = "Verification code must be 6 digits"
        }
        break;

      case 4:
        // Password validation
        if (!formData.password) {
          newErrors.password = "Password is required"
        } else if (formData.password.length < 8) {
          newErrors.password = "Password must be at least 8 characters"
        } else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])/.test(formData.password)) {
          newErrors.password = "Password must include uppercase, lowercase, number, and special character"
        }

        // Confirm password validation
        if (!formData.confirm_password) {
          newErrors.confirm_password = "Please confirm your password"
        } else if (formData.password !== formData.confirm_password) {
          newErrors.confirm_password = "Passwords do not match"
        }
        break;

      case 5:
        // Gender validation
        if (!formData.gender) {
          newErrors.gender = "Please select your gender"
        }

        // Date of birth validation
        if (!formData.dob) {
          newErrors.dob = "Date of birth is required"
        } else {
          const birthDate = new Date(formData.dob)
          const today = new Date()
          const age = today.getFullYear() - birthDate.getFullYear()
          const monthDiff = today.getMonth() - birthDate.getMonth()
          
          if (age < 13 || (age === 13 && monthDiff < 0)) {
            newErrors.dob = "You must be at least 13 years old"
          } else if (age > 120) {
            newErrors.dob = "Please enter a valid date of birth"
          }
        }
        break;

      case 6:
        // Captcha validation
        if (!captchaToken) {
          newErrors.captcha = "Please complete the reCAPTCHA"
        }
        break;
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(Math.min(currentStep + 1, 7))
    }
  }

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1))
  }

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token)

    // Clear captcha error if a token is received
    if (errors.captcha) {
      const newErrors = { ...errors };
      delete newErrors.captcha;
      setErrors(newErrors);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess("")
    setServerError("")

    // Final validation
    if (validateStep()) {
      setIsLoading(true)

      try {
        const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/register`, {
          ...formData,
          captchaToken  // Send captcha token to backend
        }, { 
          withCredentials: true,
          timeout: 10000 // 10 second timeout
        })

        setSuccess(res.data.message || "Registration successful! Redirecting to login...")
        setTimeout(() => navigate("/login"), 2000)
      } catch (err) {
        if (!err.response) {
          setServerError("Network error. Please check your connection and try again.")
        } else if (err.response.status === 409) {
          setServerError("Email already registered. Please login instead.")
        } else if (err.response.status === 429) {
          setServerError("Too many requests. Please try again later.")
        } else {
          const errorMessage = err.response?.data?.error || "Registration failed. Please try again."
          setServerError(errorMessage)

          // Handle field-specific errors from backend if available
          if (err.response?.data?.fieldErrors) {
            setErrors(err.response.data.fieldErrors)
          }
        }
      } finally {
        setIsLoading(false)
        // Reset captcha
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        setCaptchaToken(null);
      }
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="usreg-form-group">
            <label htmlFor="name" className="usreg-form-label">Full Name</label>
            <div className="usreg-input-wrapper">
              <div className="usreg-input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "usreg-input usreg-input-error" : "usreg-input"}
              />
            </div>
            {errors.name && <span className="usreg-error-message">{errors.name}</span>}
            <button
              type="button"
              className="usreg-button usreg-next-button"
              onClick={nextStep}
            >
              Next
            </button>
          </div>
        )

      case 2:
        return (
          <>
            <div className="usreg-form-group">
              <label htmlFor="email" className="usreg-form-label">Email Address</label>
              <div className="usreg-input-wrapper">
                <div className="usreg-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "usreg-input usreg-input-error" : "usreg-input"}
                />
              </div>
              {errors.email && <span className="usreg-error-message">{errors.email}</span>}
            </div>

            <div className="usreg-form-group">
              <label htmlFor="phone_number" className="usreg-form-label">Phone Number</label>
              <div className="usreg-input-wrapper">
                <div className="usreg-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <input
                  id="phone_number"
                  type="tel"
                  name="phone_number"
                  placeholder="Your phone number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className={errors.phone_number ? "usreg-input usreg-input-error" : "usreg-input"}
                />
              </div>
              {errors.phone_number && <span className="usreg-error-message">{errors.phone_number}</span>}
            </div>

            <div className="usreg-form-button-group">
              <button
                type="button"
                className="usreg-button usreg-prev-button"
                onClick={prevStep}
              >
                Previous
              </button>
              <button
                type="button"
                className="usreg-button usreg-next-button"
                onClick={() => {
                  if (validateStep()) {
                    sendEmailVerification();
                    nextStep();
                  }
                }}
              >
                Next
              </button>
            </div>
          </>
        )

      case 3:
        return (
          <div className="usreg-form-group">
            <label htmlFor="email_verification_code" className="usreg-form-label">Email Verification</label>
            <div className="usreg-verification-container">
              <div className="usreg-input-wrapper">
                <div className="usreg-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <input
                  id="email_verification_code"
                  type="text"
                  name="email_verification_code"
                  placeholder="Enter 6-digit verification code"
                  value={formData.email_verification_code}
                  onChange={handleChange}
                  className={errors.email_verification_code ? "usreg-input usreg-input-error" : "usreg-input"}
                  maxLength="6"
                />
              </div>
              <button
                type="button"
                className="usreg-verification-button"
                onClick={sendEmailVerification}
                disabled={isLoading || resendTimer > 0 || resendAttempts >= 3}
              >
                {resendAttempts >= 3 ? (
                  "Retry Later"
                ) : (
                  resendTimer > 0
                    ? `Resend (${resendTimer}s)`
                    : (isLoading ? "Sending..." : "Send Code")
                )}
              </button>
            </div>
            {errors.email_verification_code && <span className="usreg-error-message">{errors.email_verification_code}</span>}
            {resendAttempts >= 3 && (
              <span className="usreg-error-message">
                Too many resend attempts. Please wait 5 minutes before trying again.
              </span>
            )}

            <div className="usreg-form-button-group">
              <button
                type="button"
                className="usreg-button usreg-prev-button"
                onClick={prevStep}
              >
                Previous
              </button>
              <button
                type="button"
                className="usreg-button usreg-next-button"
                onClick={verifyEmailCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="usreg-loading-text">
                    <span className="usreg-spinner"></span>
                    Verifying...
                  </span>
                ) : (
                  "Verify Email"
                )}
              </button>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="usreg-form-group">
            <label htmlFor="password" className="usreg-form-label">Password</label>
            <div className="usreg-input-wrapper">
              <div className="usreg-input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Create a secure password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "usreg-input usreg-input-error" : "usreg-input"}
              />
            </div>
            {errors.password && <span className="usreg-error-message">{errors.password}</span>}
            
            <label htmlFor="confirm_password" className="usreg-form-label">Confirm Password</label>
            <div className="usreg-input-wrapper">
              <div className="usreg-input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <input
                id="confirm_password"
                type="password"
                name="confirm_password"
                placeholder="Confirm your password"
                value={formData.confirm_password}
                onChange={handleChange}
                className={errors.confirm_password ? "usreg-input usreg-input-error" : "usreg-input"}
              />
            </div>
            {errors.confirm_password && <span className="usreg-error-message">{errors.confirm_password}</span>}

            <div className="usreg-form-button-group">
              <button
                type="button"
                className="usreg-button usreg-prev-button"
                onClick={prevStep}
              >
                Previous
              </button>
              <button
                type="button"
                className="usreg-button usreg-next-button"
                onClick={nextStep}
              >
                Next
              </button>
            </div>
          </div>
        )

      case 5:
        return (
          <>
            <div className="usreg-form-row">
              <div className="usreg-form-group usreg-half-width">
                <label htmlFor="gender" className="usreg-form-label">Gender</label>
                <div className="usreg-select-wrapper">
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={errors.gender ? "usreg-select usreg-select-error" : "usreg-select"}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="usreg-select-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
                {errors.gender && <span className="usreg-error-message">{errors.gender}</span>}
              </div>

              <div className="usreg-form-group usreg-half-width">
                <label htmlFor="dob" className="usreg-form-label">Date of Birth</label>
                <div className="usreg-input-wrapper">
                  <div className="usreg-input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                  <input
                    id="dob"
                    type="date"
                    name="dob"
                    max={new Date().toISOString().split('T')[0]}
                    value={formData.dob}
                    onChange={handleChange}
                    className={errors.dob ? "usreg-input usreg-input-error" : "usreg-input"}
                  />
                </div>
                {errors.dob && <span className="usreg-error-message">{errors.dob}</span>}
              </div>
            </div>

            <div className="usreg-form-button-group">
              <button
                type="button"
                className="usreg-button usreg-prev-button"
                onClick={prevStep}
              >
                Previous
              </button>
              <button
                type="button"
                className="usreg-button usreg-next-button"
                onClick={nextStep}
              >
                Next
              </button>
            </div>
          </>
        )

      case 6:
        return (
          <>
            <div className="usreg-recaptcha-container">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={handleCaptchaChange}
              />
              {errors.captcha && (
                <span className="usreg-error-message">
                  {errors.captcha}
                </span>
              )}
            </div>

            <div className="usreg-form-group usreg-terms">
              <input type="checkbox" id="terms" className="usreg-checkbox" required />
              <label htmlFor="terms" className="usreg-checkbox-label">
                I agree to the <a href="/terms-of-service" className="usreg-link">Terms of Service</a> and <a href="/privacy-policy" className="usreg-link">Privacy Policy</a>
              </label>
            </div>

            <div className="usreg-form-button-group">
              <button
                type="button"
                className="usreg-button usreg-prev-button"
                onClick={prevStep}
              >
                Previous
              </button>
              <button
                type="submit"
                className={`usreg-button usreg-submit-button ${isLoading ? 'usreg-loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="usreg-loading-text">
                    <span className="usreg-spinner"></span>
                    Processing...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="usreg-registration-page">
      {/* Background animation elements */}
      <div className="usreg-bg-animation">
        <div className="usreg-bg-circle usreg-circle-1"></div>
        <div className="usreg-bg-circle usreg-circle-2"></div>
        <div className="usreg-bg-circle usreg-circle-3"></div>
        <div className="usreg-bg-shape usreg-shape-1"></div>
        <div className="usreg-bg-shape usreg-shape-2"></div>
      </div>

      <div className="usreg-container">
        
        <div className="usreg-card">
          <div className="usreg-card-header">
            <h1 className="usreg-title">Create an Account</h1>
            <p className="usreg-subtitle">Sign up to get started with our services</p>
          </div>

          {/* Progress indicator */}
          <div className="usreg-progress-container">
            {[1, 2, 3, 4, 5, 6].map(step => (
              <div 
                key={step} 
                className={`usreg-progress-step ${currentStep >= step ? 'usreg-step-active' : ''}`}
              />
            ))}
          </div>

          {/* Google Sign-up Button */}
          {currentStep === 1 && (
            <div className="usreg-oauth-container">
              <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => setServerError("Google authentication failed. Please try again.")}
                  text="signup_with"
                  size="large"
                  width="100%"
                  theme="outline"
                  shape="rectangular"
                />
              </GoogleOAuthProvider>
              <div className="usreg-divider">
                <span>or sign up with email</span>
              </div>
            </div>
          )}

          {/* Error and success messages */}
          {serverError && (
            <div className="usreg-message usreg-error">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {serverError}
            </div>
          )}

          {success && (
            <div className="usreg-message usreg-success">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              {success}
            </div>
          )}

          {/* Form steps */}
          <form onSubmit={handleSubmit} className="usreg-form">
            {renderStep()}
          </form>

          {/* Login link */}
          <div className="usreg-login-link">
            Already have an account? <a href="/login" className="usreg-link">Log in</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registration;