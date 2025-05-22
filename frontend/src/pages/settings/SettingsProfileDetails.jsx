import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Settings.css';
import MobileSidebarToggle from "../../components/MobileSidebarToggle";
import Sidebar from "../../components/Sidebar";
import { FaCog } from 'react-icons/fa';
import axios from 'axios';

const SettingsProfileDetails = () => {
  const [successMessage, setSuccessMessage] = useState(""); // State for the success message

  useEffect(() => {
      if (successMessage) {
        const timer = setTimeout(() => {
          setSuccessMessage("");
        }, 1500); // Adjust the duration as needed
  
        return () => clearTimeout(timer);
      }
    }, [successMessage]);
  
  
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 480);
  const [isMobile, setIsMobile] = useState(false);
  
  // Get the current email
  useEffect(() => {
    const callCurrentEmail = async () => {
      await axios.get("/CSE442/2025-Spring/cse-442aj/backend/api/getemail.php")
      .then(res => setFormData({
        "displayName": "",
        "email": res.data
      }))
      .catch(err => console.log(err))
    }
    callCurrentEmail()
    
    const handleResize = () => {
      const isNowMobile = window.innerWidth <= 480;
      
      setIsMobile(isNowMobile);
    };
  
    handleResize(); // Run on first load
    window.addEventListener("resize", handleResize); // Watch for resizes
  
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log("Profile Details Form Data:", formData);

    try {
      const response = await axios.post("/CSE442/2025-Spring/cse-442aj/backend/api/settingsprofiledetails.php", formData, {
        headers:{
          'Content-Type': 'application/json'
        }
      })
      const result = response.data
      console.log("Profile Details Form Response: ", result);
      setSuccessMessage(result.message);
      //alert(result.message)
    } catch(error) {
      setSuccessMessage("There was an error changing your email");
      console.log("Error updating profile details:", error)
    }
  };

  return (
    <>
    {/* Hamburger toggle for mobile */}
    {isMobile && (
      <MobileSidebarToggle
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />
    )}

    {/* Sidebar: always visible on desktop, toggled on mobile */}
    <Sidebar isOpen={!isMobile || isSidebarOpen && !menuOpen} />

    <div className="settings-container">

      {/* Gear Button */}
      <button className="gear-menu" onClick={() => setMenuOpen(!menuOpen)}>
        <FaCog></FaCog>
      </button>

      {/* Left Sidebar */}
      <div className={`settings-left ${menuOpen ? "open" : ""}`}>
        <h3>Preferences</h3>
        <button onClick={() => navigate("/settings/accessibility")}>Accessibility</button>
        <button onClick={() => navigate("/settings/language-and-region")}>Language & Region</button>

        <h3>Profile</h3>
        <button className="selected" onClick={() => navigate("/settings/profile-details")}>Profile Details</button>

        <h3>Privacy & Security</h3>
        <button onClick={() => navigate("/settings/manage-password")}>Manage Password</button>
        <button onClick={() => navigate("/settings/recent-activity")}>Recent Activity</button>
        <button onClick={() => navigate("/settings/my-data")}>My Data</button>
        <button onClick={() => navigate("/settings/delete-account")}>Delete Account</button>

        <h3>Legal</h3>
        <button onClick={() => navigate("/settings/terms-of-service")}>Terms of Service</button>
        <button onClick={() => navigate("/settings/privacy-policy")}>Privacy Policy</button>
        
      </div>

      {/* Right Panel */}
      <div className="settings-right">
        <h2>Profile Details</h2>

        {successMessage && (
          <div className="modal-overlay">
            <div className="modal-content send-req-modal-content"> 
              {successMessage}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Update Username</label>
            <input
              type="text"
              name="displayName"
              placeholder="Enter new username"
              value={formData.displayName}
              onChange={handleChange}
              // required
            />
          </div>

          <div className="form-group">
            <label>Update Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter new email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit">Save Changes</button>
        </form>
      </div>
    </div>
    </>
  );
};

export default SettingsProfileDetails;