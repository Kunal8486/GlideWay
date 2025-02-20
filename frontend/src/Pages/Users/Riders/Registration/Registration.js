"use client"

import { useState } from "react"
import axios from "axios"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import { useNavigate } from "react-router-dom"
import "./Registration.css"

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID

const Registration = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    gender: "",
    dob: "",
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const res = await axios.post("http://localhost:5000/api/register", formData, { withCredentials: true })
      setSuccess(res.data.message)
      setTimeout(() => navigate("/login"), 2000)
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed")
    }
  }

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/google",
        { token: credentialResponse.credential },
        { withCredentials: true },
      )
      setSuccess(res.data.message)
      setTimeout(() => navigate("/profile"), 2000)
    } catch (err) {
      setError("Google login failed")
    }
  }

  return (
    <div className="register-container">
      <h2>Register for Glide Way</h2>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="tel" name="phone_number" placeholder="Phone Number" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <select name="gender" onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <input type="date" name="dob" onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>

      <p>Or register with:</p>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <GoogleLogin onSuccess={handleGoogleLogin} onError={() => setError("Google Login Failed")} />
      </GoogleOAuthProvider>
    </div>
  )
}

export default Registration

