import React, { useState } from 'react'
import { useContext } from "react";
import { UserContext } from "../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";
import '../styles/Login.css'
import axios from 'axios'


const Login = () => {

  const [errorMessage, setErrorMessage] = useState(""); // State for error message

  const { setUser } = useContext(UserContext);

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log("Login Data:", formData);
    
    try{
      
      const response = await axios.post("/CSE442/2025-Spring/cse-442aj/backend/security/login.php",formData,{
        headers:{
          'Content-Type':'application/json'
        }
      })
      
      const result = response.data
      console.log("Login response",result);
      if (result.success) {
        setUser({
          firstName: result.first_name,
          lastName: result.last_name,
          username: result.first_name,
          email: formData.email
        });

        console.log("In login, user is: ", result)

        navigate('/user-profile', {
          state: { fromLogin: false }
        });
      } else {
        //alert(result.message)
        setErrorMessage("Authentication failed");
      }
      
    } catch(error){
      console.log("Error during login: ",error.response);
    }

    
  };

  return (
    <div className="login-container ">
    <h2>Login to Tripa<span>go</span></h2>
    {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display error message */}

    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        placeholder="Email address"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <button type="submit" className='login_signup-button'>Login</button>
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

export default Login