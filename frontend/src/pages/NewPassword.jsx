import React, { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import '../styles/Login.css'
import axios from "axios";

const NewPassword = () => {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("key");
  console.log("key: " + token);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    key: token
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/CSE442/2025-Spring/cse-442aj/backend/api/new_password_2.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email, 
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          key: formData.key
        }),
      });
  
      const data = await response.json();
      alert(data.message);
      
      if (data.status === "success") {
        navigate("/login"); // Redirect after success
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } 
  };

  return (
    <div className="login-container ">
    <h2>Create new password</h2>
    <form onSubmit={handleSubmit}>
    <div className="password-container">

       <input
          type="hidden"
          name="key"
          placeholder="key"
          value={token}
          onChange={handleChange}
        />

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
          />
          <div className="password-tooltip">
            <p>✔ 1 uppercase letter</p>
            <p>✔ 1 number or special character</p>
            <p>✔ Longer than 6 characters</p>
          </div>
      </div>
      <button type="submit" className='login_signup-button'>Continue</button>
    </form>

    <p className='forgot_password_link'>
        <button className='link-button' onClick={() => navigate("/forgot-password")}>
          Forgot your password?
        </button>
    </p>
    <p> 
        <button className='link-button' onClick={() => navigate("/signup")}>
        Don't have an account? Sign up here.
        </button>
    </p>
  </div>
  )
}

export default NewPassword
