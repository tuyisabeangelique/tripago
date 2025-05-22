import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Settings.css';
import MobileSidebarToggle from "../../components/MobileSidebarToggle";
import Sidebar from "../../components/Sidebar";
import { FaCog } from 'react-icons/fa';

const SettingsAccessibility = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 480);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
      
      const handleResize = () => {
        const isNowMobile = window.innerWidth <= 480;
        
        setIsMobile(isNowMobile);
      };
  
      handleResize(); // Run on first load
      window.addEventListener("resize", handleResize); // Watch for resizes
  
      return () => {
        window.removeEventListener("resize", handleResize);
      };
  }, []);
  
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
        <button className="selected" onClick={() => navigate("/settings/accessibility")}>Accessibility</button>
        <button onClick={() => navigate("/settings/language-and-region")}>Language & Region</button>

        <h3>Profile</h3>
        <button onClick={() => navigate("/settings/profile-details")}>Profile Details</button>

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
        <h2>Accessibility Settings</h2>

        <form>
          <label htmlFor="display-mode">Display Mode</label>
          <select id="display-mode" className='display-mode__container'>
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
          </select>
        </form>
      </div>

    </div>
    </>
  );
};

export default SettingsAccessibility;
