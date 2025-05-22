import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Login.css";
import axios from "axios";

const PasswordReset = () => {
  const navigate = useNavigate();

  const [resetMessage, setResetMessage] = useState(""); // New state for reset message
  const [errorMessage, setErrorMessage] = useState(""); // New state for error message

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = async (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Password Reset Data:", formData);
    try {
      const response = await fetch(
        "/CSE442/2025-Spring/cse-442aj/backend/api/reset_password.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email }),
        }
      );

      const result = await response.json();
      console.log("Response:", result);

      if (result.status === "success") {
        setResetMessage(`Check your email for the reset link: ${result.resetLink}`);
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="login-container ">
      <h2>Reset Password</h2>
          {resetMessage && (
      <div style={{ color: '#52DDA2',
        marginBottom: '10px',
        fontWeight: 'bold',
        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)' }}>
        {resetMessage}
      </div>
    )}
    {errorMessage && (
      <div style={{ color: 'red', marginBottom: '10px' }}>
        {errorMessage}
      </div>
    )}
      <form onSubmit={handleSubmit}>
        <input
          className="email-input-box"
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {/* The Send Link button takes you to the New Password Page */}
        <button type="submit" className="login_signup-button">
          Send Link
        </button>
      </form>

      <p className="forgot_password_link">
        <button className="link-button" onClick={() => navigate("/login")}>
          I know my password.
        </button>
      </p>
      <p>
        <button className="link-button" onClick={() => navigate("/signup")}>
          Don't have an account? Sign up here.
        </button>
      </p>
    </div>
  );
};

export default PasswordReset;
