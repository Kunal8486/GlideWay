import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  // For React Router v6
import Card from "../../Components/Card/Card";
import Button from "../../Components/Buttons/Button";
import Input from "../../Components/Input/Input";
import useInput from "../../Components/hooks/use-input";
import GoogleButton from "react-google-button";
import './Login.css';

const Login = (props) => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();  // For React Router v6
  
  // Input validation hooks for email and password
  const {
    value: enteredEmail,
    hasError: emailHasError,
    isValid: emailIsValid,
    valueChangeHandler: emailInputHandler,
    reset: resetEmail,
  } = useInput((value) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value));

  const {
    value: enteredPassword,
    hasError: passwordHasError,
    isValid: passwordIsValid,
    valueChangeHandler: passwordInputHandler,
    reset: resetPassword,
  } = useInput((value) => value.length > 7); // Password must be at least 8 characters

  // Submit handler for the login form
  const submitHandler = async (event) => {
    event.preventDefault();
    setError(null); // Reset error on new attempt

    // Validation check
    if (!emailIsValid || !passwordIsValid) return;

    const userData = {
      email: enteredEmail.toLowerCase(),
      password: enteredPassword,
    };

    try {
      const response = await fetch("http://localhost:5000/api/riders/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      console.log("User logged in:", data);
      alert("Login successful!");

      // Store the token in localStorage for session management
      localStorage.setItem("authToken", data.token);

      // Optionally, store user info (like role or ID) for future use
      localStorage.setItem("userRole", data.role);  // Save role if needed

      // Reset form inputs after successful login
      resetEmail();
      resetPassword();

      // Redirect the user to the dashboard
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || "An error occurred during login.");
      console.error("Error during login:", error.message);
    }
  };

  // Form validation flag
  const formIsValid = emailIsValid && passwordIsValid;

  return (
    <Card className="login">
      <h2 className="title">Welcome Back !!</h2>
      <p className="subtitle">Login to access your account</p>

      {error && <p className="error">{error}</p>} {/* Display error message */}

      <form onSubmit={submitHandler} className="loginForm">
        {/* Email Input */}
        <Input
          id="email"
          label="E-mail"
          type="email"
          value={enteredEmail}
          onChange={emailInputHandler}
          isValid={!emailHasError}
        />
        {emailHasError && <p className="error">Please enter a valid email.</p>}

        {/* Password Input */}
        <Input
          id="password"
          label="Password"
          type="password"
          value={enteredPassword}
          onChange={passwordInputHandler}
          isValid={!passwordHasError}
        />
        {passwordHasError && (
          <p className="error">Password must be at least 8 characters long.</p>
        )}

        {/* Submit Button */}
        <div className="actions">
          <Button type="submit" className="btn" disabled={!formIsValid}>
            Login
          </Button>
        </div>

        {/* Forgot Password & Sign Up Links */}
        <div className="extraActions">
          <a href="/forgot-password" className="link">
            Forgot Password?
          </a>
          <a href="/signup" className="link">
            Don't have an account? Sign Up
          </a>
        </div>

        {/* Google Login Option */}
        <div className="divider">
          <span className="line"></span>
          <span className="orText">OR</span>
          <span className="line"></span>
        </div>

        <div className="googleLogin">
          <GoogleButton onClick={() => console.log("Google login clicked")} />
        </div>
      </form>
    </Card>
  );
};

export default Login;
