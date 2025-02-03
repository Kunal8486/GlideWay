import React from "react";
import Card from "../../Components/Card/Card";
import Button from "../../Components/Buttons/Button";
import Input from "../../Components/Input/Input";
import useInput from "../../Components/hooks/use-input";
import GoogleButton from "react-google-button";
import "./Signup.css";

const Signup = (props) => {
  const {
    value: enteredName,
    hasError: nameHasError,
    isValid: nameIsValid,
    valueChangeHandler: nameInputHandler,
    reset: resetName,
  } = useInput((value) => value.trim().length > 3);

  const {
    value: enteredEmail,
    hasError: emailHasError,
    isValid: emailIsValid,
    valueChangeHandler: emailInputHandler,
    reset: resetEmail,
  } = useInput((value) =>
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
  );

  const {
    value: enteredPassword,
    hasError: passwordHasError,
    isValid: passwordIsValid,
    valueChangeHandler: passwordInputHandler,
    reset: resetPassword,
  } = useInput((value) => value.length > 7);

  const {
    value: enteredDob,
    hasError: dobHasError,
    isValid: dobIsValid,
    valueChangeHandler: dobInputHandler,
    reset: resetDob,
  } = useInput((value) => value.trim() !== "");

  const {
    value: enteredGender,
    hasError: genderHasError,
    isValid: genderIsValid,
    valueChangeHandler: genderInputHandler,
    reset: resetGender,
  } = useInput((value) => ["male", "female", "other"].includes(value));

  const {
    value: enteredPhoneNumber,
    hasError: phoneHasError,
    isValid: phoneIsValid,
    valueChangeHandler: phoneInputHandler,
    reset: resetPhone,
  } = useInput((value) => /^[0-9]{10}$/.test(value)); // Validate 10-digit mobile number

  const submitHandler = async (event) => {
    event.preventDefault();

    if (!nameIsValid || !emailIsValid || !passwordIsValid || !dobIsValid || !genderIsValid || !phoneIsValid) return;

    const userData = {
      name: enteredName.trim(),
      email: enteredEmail.toLowerCase(),
      password: enteredPassword,
      dob: enteredDob,
      gender: enteredGender,
      phone_number: enteredPhoneNumber, // Add phone number to data
    };

    try {
      const response = await fetch("http://localhost:5000/api/riders/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to sign up.");
      }

      const data = await response.json();
      console.log("User signed up successfully:", data);
      alert("Signup successful! Please log in.");

      resetName();
      resetEmail();
      resetPassword();
      resetDob();
      resetGender();
      resetPhone(); // Reset phone number input after successful signup
    } catch (error) {
      console.error("Error during signup:", error.message);
      alert(error.message || "An error occurred.");
    }
  };

  const formIsValid = nameIsValid && emailIsValid && passwordIsValid && dobIsValid && genderIsValid && phoneIsValid;

  return (
    <Card className="signup">
      <h2 className="title">Create Your Account</h2>
      <p className="subtitle">Sign up to get started with Glide Way</p>

      <form onSubmit={submitHandler} className="signupForm">
        <Input
          id="name"
          label="Full Name"
          type="text"
          value={enteredName}
          onChange={nameInputHandler}
          isValid={!nameHasError}
          placeholder="Enter your full name"
        />
        {nameHasError && <p className="error">Name must be at least 4 characters long.</p>}

        <Input
          id="email"
          label="E-mail"
          type="email"
          value={enteredEmail}
          onChange={emailInputHandler}
          isValid={!emailHasError}
          placeholder="example@domain.com"
        />
        {emailHasError && <p className="error">Please enter a valid email.</p>}

        <Input
          id="password"
          label="Password"
          type="password"
          value={enteredPassword}
          onChange={passwordInputHandler}
          isValid={!passwordHasError}
          placeholder="Create a strong password"
        />
        {passwordHasError && <p className="error">Password must be at least 8 characters long.</p>}

        <Input
          id="dob"
          label="Date of Birth"
          type="date"
          value={enteredDob}
          onChange={dobInputHandler}
          isValid={!dobHasError}
        />
        {dobHasError && <p className="error">Please enter your date of birth.</p>}

        <Input
          id="phone_number"
          label="Mobile Number"
          type="text"
          value={enteredPhoneNumber}
          onChange={phoneInputHandler}
          isValid={!phoneHasError}
          placeholder="Enter your 10-digit mobile number"
        />
        {phoneHasError && <p className="error">Please enter a valid 10-digit mobile number.</p>}

        <div className="formControl">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            value={enteredGender}
            onChange={genderInputHandler}
            className={`select ${genderHasError ? "invalid" : ""}`}
          >
            <option value="" disabled>Select your gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        {genderHasError && <p className="error">Please select a valid gender.</p>}

        <div className="actions">
          <Button type="submit" className="btn" disabled={!formIsValid}>
            Sign Up
          </Button>
        </div>

        <div className="extraActions">
          <a href="/login" className="link">
            Already have an account? Login
          </a>
        </div>

        <div className="divider">
          <span className="line"></span>
          <span className="orText">OR</span>
          <span className="line"></span>
        </div>

        <div className="googleSignup">
          <GoogleButton onClick={() => console.log("Google signup clicked")} />
        </div>
      </form>
    </Card>
  );
};

export default Signup;
