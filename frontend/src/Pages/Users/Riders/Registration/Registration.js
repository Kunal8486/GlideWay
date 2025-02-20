"use client"

import { useState } from "react"
import axios from "axios"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import { useNavigate } from "react-router-dom"
import "./Registration.css"

const GOOGLE_CLIENT_ID = "950973384946-h3kdaot9u66156jjm8mo9our9pegl9ue.apps.googleusercontent.com"

const Registration = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    gender: "",
    dob: "",
    googleId: undefined, 

  })

  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors({...errors, [name]: ""})
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }
    
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
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    
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
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess("")
    
    // Form validation
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)

    try {
      const res = await axios.post("http://localhost:5000/api/register", formData, { withCredentials: true })
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
    }
  }

  const handleGoogleLogin = async (credentialResponse) => {
    setIsLoading(true)
    setServerError("")
    setSuccess("")
    
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/google",
        { token: credentialResponse.credential },
        { withCredentials: true },
      )
      setSuccess(res.data.message || "Google authentication successful! Redirecting...")
      setTimeout(() => navigate("/profile"), 2000)
    } catch (err) {
      setServerError("Google authentication failed. Please try again.")
    } finally {
      setIsLoading(false)
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
          </div>
          
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
          </div>
          
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
          
          <div className="form-group terms">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">
              I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
            </label>
          </div>

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