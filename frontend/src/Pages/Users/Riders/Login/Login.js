"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import { useNavigate, useLocation } from "react-router-dom"
import "./Login.css"

const GOOGLE_CLIENT_ID = "950973384946-h3kdaot9u66156jjm8mo9our9pegl9ue.apps.googleusercontent.com"

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) console.error("GOOGLE_CLIENT_ID is missing in .env file")
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const res = await axios.post("http://localhost:5000/api/login", formData, { withCredentials: true })
      localStorage.setItem("token", res.data.token)
      setSuccess(res.data.message)
      setTimeout(() => {
        const from = location.state?.from?.pathname || "/profile"
        navigate(from)
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.error || "Login failed")
    }
  }

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/google",
        { token: credentialResponse.credential },
        { withCredentials: true },
      )
      localStorage.setItem("token", res.data.token)
      setSuccess(res.data.message)
      setTimeout(() => {
        const from = location.state?.from?.pathname || "/profile"
        navigate(from)
      }, 2000)
    } catch (err) {
      setError("Google login failed")
    }
  }

  return (
    <div className="login-container">
      <h2>Login to Glide Way</h2>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" onChange={handleChange} value={formData.email} required />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          value={formData.password}
          required
        />
        <button type="submit">Login</button>
      </form>

      <p>Or login with:</p>

        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <GoogleLogin onSuccess={handleGoogleLogin} onError={() => setError("Google Login Failed")} />
        </GoogleOAuthProvider>
     
    </div>
  )
}

export default Login
