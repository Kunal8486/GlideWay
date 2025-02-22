"use client"

import { useState, useEffect } from "react";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate, useLocation } from "react-router-dom";
import "./Login.css";

const GOOGLE_CLIENT_ID = "950973384946-h3kdaot9u66156jjm8mo9our9pegl9ue.apps.googleusercontent.com"

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
    setIsLoading(true)

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
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async (credentialResponse) => {
    setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h2>Glide Way</h2>
          <p>Sign in to your account</p>
        </div>

        {error && (
          <div className="alert error">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="alert success">
            <p>{success}</p>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
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
              <a href="/forget-password">Forgot your password?</a>
            </div>
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
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
      </div>
    </div>
  )
}

export default Login