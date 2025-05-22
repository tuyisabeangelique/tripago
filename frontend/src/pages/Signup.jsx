import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Registration Data:", formData);
    setUsernameError(""); // reset error on every submit
    setPasswordError("");

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post(
        "/CSE442/2025-Spring/cse-442aj/backend/api/signup.php",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = response.data;
      console.log("Registration Response", result);

      if (result.success) {
        navigate("/login");
      } else {
        if (result.message.toLowerCase().includes("username")) {
          setUsernameError(result.message);
        } else {
          alert(result.message);
        }
      }
    } catch (error) {
      console.log("Error during signup:", error);
    }
  };

  return (
    <div className="login-container signup-container">
      <h2>
        Ready to <span>go</span>? Sign up for free!
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          style={{ border: usernameError ? ".9px solid red" : undefined }}
        />
        {usernameError && (
          <p
            style={{
              color: "red",
              marginTop: "5px",
              marginBottom: "2px",
              fontSize: "0.9em",
            }}
          >
            {usernameError}
          </p>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <div className="password-container">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            style={{ border: passwordError ? ".9px solid red" : undefined }}
          />
          {passwordError && (
            <p
              style={{
                color: "red",
                marginTop: "5px",
                marginBottom: "2px",
                fontSize: "0.9em",
              }}
            >
              {passwordError}
            </p>
          )}

          <div className="password-tooltip">
            <p>✔ 1 uppercase letter</p>
            <p>✔ 1 number or special character</p>
            <p>✔ Longer than 6 characters</p>
          </div>
        </div>

        <button
          type="submit"
          className="login_signup-button create-account-button"
        >
          Create my account
        </button>
      </form>

      <p>
        <button className="link-button" onClick={() => navigate("/login")}>
          Already have an account? Login here.
        </button>
      </p>
    </div>
  );
};

export default Signup;
