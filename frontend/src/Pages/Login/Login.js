import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import Card from "../../Components/Card/Card";
import Button from "../../Components/Buttons/Button";
import Input from "../../Components/Input/Input";
import useInput from "../../Components/hooks/use-input";
import "./Login.css";

const clientId = "950973384946-h3kdaot9u66156jjm8mo9our9pegl9ue.apps.googleusercontent.com"; // Replace with your Google OAuth Client ID

const Login = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
  } = useInput((value) => value.length > 7);

  const submitHandler = async (event) => {
    event.preventDefault();
    setError(null);

    if (!emailIsValid || !passwordIsValid) return;

    const userData = {
      email: enteredEmail.toLowerCase(),
      password: enteredPassword,
    };

    try {
      const response = await fetch("http://localhost:5000/api/riders/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userRole", data.role);

      resetEmail();
      resetPassword();
      navigate("/dashboard");
    } catch (error) {
      setError(error.message || "An error occurred during login.");
    }
  };

  const googleSuccessHandler = async (response) => {
    console.log("Google login response:", response);
    try {
      const res = await fetch("http://localhost:5000/api/riders/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });

      if (!res.ok) {
        throw new Error("Google login failed.");
      }

      const data = await res.json();
      localStorage.setItem("authToken", data.token);
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    }
  };

  const googleFailureHandler = () => {
    setError("Google Sign-In failed. Please try again.");
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Card className="login">
        <h2 className="title">Welcome Back !!</h2>
        <p className="subtitle">Login to access your account</p>
        {error && <p className="error">{error}</p>}

        <form onSubmit={submitHandler} className="loginForm">
          <Input id="email" label="E-mail" type="email" value={enteredEmail} onChange={emailInputHandler} isValid={!emailHasError} />
          {emailHasError && <p className="error">Please enter a valid email.</p>}

          <Input id="password" label="Password" type="password" value={enteredPassword} onChange={passwordInputHandler} isValid={!passwordHasError} />
          {passwordHasError && <p className="error">Password must be at least 8 characters long.</p>}

          <div className="actions">
            <Button type="submit" className="btn" disabled={!emailIsValid || !passwordIsValid}>
              Login
            </Button>
          </div>

          <div className="extraActions">
            <a href="/forgot-password" className="link">Forgot Password?</a>
            <a href="/signup" className="link">Don't have an account? Sign Up</a>
          </div>

          <div className="divider">
            <span className="line"></span>
            <span className="orText">OR</span>
            <span className="line"></span>
          </div>

          <div className="googleLogin">
            <GoogleLogin onSuccess={googleSuccessHandler} onError={googleFailureHandler} />
          </div>
        </form>
      </Card>
    </GoogleOAuthProvider>
  );
};

export default Login;
