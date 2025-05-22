import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Settings.css';
import MobileSidebarToggle from "../../components/MobileSidebarToggle";
import Sidebar from "../../components/Sidebar";
import { FaCog } from 'react-icons/fa';

const SettingsTermsOfService = () => {
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
        <button onClick={() => navigate("/settings/accessibility")}>Accessibility</button>
        <button onClick={() => navigate("/settings/language-and-region")}>Language & Region</button>

        <h3>Profile</h3>
        <button onClick={() => navigate("/settings/profile-details")}>Profile Details</button>

        <h3>Privacy & Security</h3>
        <button onClick={() => navigate("/settings/manage-password")}>Manage Password</button>
        <button onClick={() => navigate("/settings/recent-activity")}>Recent Activity</button>
        <button onClick={() => navigate("/settings/my-data")}>My Data</button>
        <button onClick={() => navigate("/settings/delete-account")}>Delete Account</button>

        <h3>Legal</h3>
        <button className="selected" onClick={() => navigate("/settings/terms-of-service")}>Terms of Service</button>
        <button onClick={() => navigate("/settings/privacy-policy")}>Privacy Policy</button>
        
      </div>

      {/* Right Panel */}
      <div className="settings-right">
        <div className="terms-of-service__container">
        <h2>Terms of Service</h2>
        <p>
          By using Tripago, you agree to the following terms and conditions. Please read them carefully before proceeding.
        </p>

        <h3>1. Acceptance of Terms</h3>
        <p>
          By accessing or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
        </p>

        <h3>2. User Responsibilities</h3>
        <p>
          You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
        </p>

        <h3>3. Prohibited Activities</h3>
        <p>
          Users may not engage in any activity that violates applicable laws, infringes on the rights of others, or disrupts the functionality of the service.
        </p>

        <h3>4. Modifications to the Terms</h3>
        <p>
          We reserve the right to update these terms at any time. Continued use of our services after modifications constitutes acceptance of the new terms.
        </p>

        <h3>5. Contact Information</h3>
        <p>
          If you have any questions regarding these Terms of Service, please contact our support team.
        </p>

        <button className="download-btn terms-btn">Download Terms of Service</button>
      </div>
      </div>

    </div>
    </>
  );
};

export default SettingsTermsOfService;
