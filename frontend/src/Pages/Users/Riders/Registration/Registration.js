import React, { useState } from "react"
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const sendEmailVerification = async () => {
    setIsLoading(true)
    setServerError("")
    setSuccess("")

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/send-verification-email`, {
        email: formData.email
      })

      setSuccess(res.data.message || "Verification code sent to your email")
    } catch (err) {
      setServerError(err.response?.data?.error || "Failed to send verification code")
    } finally {
      setIsLoading(false)
    }
  }

  const verifyEmailCode = async () => {
    setIsLoading(true)
    setServerError("")
    setSuccess("")

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/verify-email`, {
        email: formData.email,
        verification_code: formData.email_verification_code
      })

      setIsEmailVerified(true)
      setSuccess(res.data.message || "Email verified successfully")
      nextStep()
    } catch (err) {
      setServerError(err.response?.data?.error || "Invalid verification code")
      setIsEmailVerified(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/google`,
        {
          token: credentialResponse.credential,
          captchaToken  // Send captcha token to backend for verification
        },
        { withCredentials: true }
      );

      localStorage.setItem("token", res.data.token);
      setSuccess(res.data.message);

      setTimeout(() => {
        const from = location.state?.from?.pathname || "/profile";
        navigate(from);
      }, 2000);
    } catch (err) {
      setServerError("Google login failed");
    } finally {
      setIsLoading(false);
      // Reset captcha after submission
      if (window.grecaptcha) {
        window.grecaptcha.reset();
      }
      setCaptchaToken(null);
    }
  };

  const validateStep = () => {
    const newErrors = {}

    switch(currentStep) {
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
        }
        break;

      case 4:
        // Password validation
        if (!formData.password) {
          newErrors.password = "Password is required"
        } else if (formData.password.length < 6) {
          newErrors.password = "Password must be at least 6 characters"
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
          if (age < 13) {
            newErrors.dob = "You must be at least 13 years old"
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
        }, { withCredentials: true })

        setSuccess(res.data.message || "Registration successful! Redirecting to login...")
        setTimeout(() => navigate("/login"), 2000)
      } catch (err) {
        const errorMessage = err.response?.data?.error || "Registration failed. Please try again."
        setServerError(errorMessage)

        // Handle field-specific errors from backend if available
        if (err.response?.data?.fieldErrors) {
          setErrors(err.response.data.fieldErrors)
        }
      } finally {
        setIsLoading(false)
        // Reset captcha
        if (window.grecaptcha) {
          window.grecaptcha.reset();
        }
        setCaptchaToken(null);
      }
    }
  }

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "input-error" : ""}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
            <button 
              type="button" 
              className="register-button next-button" 
              onClick={nextStep}
            >
              Next
            </button>
          </div>
        )

      case 2:
        return (
          <>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone_number">Phone Number</label>
              <input
                id="phone_number"
                type="tel"
                name="phone_number"
                placeholder="Your phone number"
                value={formData.phone_number}
                onChange={handleChange}
                className={errors.phone_number ? "input-error" : ""}
              />
              {errors.phone_number && <span className="error-text">{errors.phone_number}</span>}
            </div>

            <div className="form-button-group">
              <button 
                type="button" 
                className="register-button prev-button" 
                onClick={prevStep}
              >
                Previous
              </button>
              <button 
                type="button" 
                className="register-button next-button" 
                onClick={nextStep}
              >
                Next
              </button>
            </div>
          </>
        )

      case 3:
        return (
          <div className="form-group">
            <label htmlFor="email_verification_code">Email Verification</label>
            <p>A verification code has been sent to {formData.email}</p>
            <div className="verification-container">
              <input
                id="email_verification_code"
                type="text"
                name="email_verification_code"
                placeholder="Enter 6-digit verification code"
                value={formData.email_verification_code}
                onChange={handleChange}
                className={errors.email_verification_code ? "input-error" : ""}
                maxLength="6"
              />
              <button 
                type="button" 
                className="resend-verification-button" 
                onClick={sendEmailVerification}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Resend Code"}
              </button>
            </div>
            {errors.email_verification_code && <span className="error-text">{errors.email_verification_code}</span>}
            
            <div className="form-button-group">
              <button 
                type="button" 
                className="register-button prev-button" 
                onClick={prevStep}
              >
                Previous
              </button>
              <button 
                type="button" 
                className="register-button next-button" 
                onClick={verifyEmailCode}
                disabled={isLoading}
              >
                Verify Email
              </button>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Create a secure password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
            
            <label htmlFor="confirm_password">Confirm Password</label>
            <input
              id="confirm_password"
              type="password"
              name="confirm_password"
              placeholder="Confirm your password"
              value={formData.confirm_password}
              onChange={handleChange}
              className={errors.confirm_password ? "input-error" : ""}
            />
            {errors.confirm_password && <span className="error-text">{errors.confirm_password}</span>}
            
            <div className="form-button-group">
              <button 
                type="button" 
                className="register-button prev-button" 
                onClick={prevStep}
              >
                Previous
              </button>
              <button 
                type="button" 
                className="register-button next-button" 
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
            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={errors.gender ? "input-error" : ""}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <span className="error-text">{errors.gender}</span>}
              </div>

              <div className="form-group half-width">
                <label htmlFor="dob">Date of Birth</label>
                <input
                  id="dob"
                  type="date"
                  name="dob"
                  max={new Date().toISOString().split('T')[0]}
                  value={formData.dob}
                  onChange={handleChange}
                  className={errors.dob ? "input-error" : ""}
                />
                {errors.dob && <span className="error-text">{errors.dob}</span>}
              </div>
            </div>

            <div className="form-button-group">
              <button 
                type="button" 
                className="register-button prev-button" 
                onClick={prevStep}
              >
                Previous
              </button>
              <button 
                type="button" 
                className="register-button next-button" 
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
            <div className="recaptcha-container">
              <ReCAPTCHA
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={handleCaptchaChange}
              />
              {errors.captcha && (
                <span className="error-text">
                  {errors.captcha}
                </span>
              )}
            </div>

            <div className="form-group terms">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                I agree to the <a href="/terms-of-service">Terms of Service</a> and <a href="/privacy-policy">Privacy Policy</a>
              </label>
            </div>

            <div className="form-button-group">
              <button 
                type="button" 
                className="register-button prev-button" 
                onClick={prevStep}
              >
                Previous
              </button>
              <button
                type="submit"
                className="register-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-text">
                    <span className="spinner"></span>
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
    <div className="registration-page">
      <div className="registration-card">
        <div className="registration-header">
          <h2>Join Glide Way</h2>
          <p>Create your account to get started</p>
        </div>

        {serverError && (
          <div className="alert error">
            <p>{serverError}</p>
          </div>
        )}

        {success && (
          <div className="alert success">
            <p>{success}</p>
          </div>
        )}

        <form className="registration-form" onSubmit={handleSubmit} noValidate>
          {renderStep()}
        </form>

        <div className="separator">
          <span>Or register with</span>
        </div>

        <div className="social-login">
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setServerError("Google authentication failed")}
              theme="outline"
              shape="pill"
              text="signup_with"
              useOneTap
            />
          </GoogleOAuthProvider>
        </div>

        <p className="login-prompt">
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </div>
    </div>
  )
}

export default Registration