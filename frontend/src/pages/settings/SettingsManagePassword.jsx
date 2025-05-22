import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Settings.css';
import MobileSidebarToggle from "../../components/MobileSidebarToggle";
import Sidebar from "../../components/Sidebar";
import { FaCog } from 'react-icons/fa';

const SettingsManagePassword = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 480);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/CSE442/2025-Spring/cse-442aj/backend/api/change_password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
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
          <button onClick={() => navigate("/settings/profile-details")}>Profile Details</button>

          <h3>Privacy & Security</h3>
          <button className="selected" onClick={() => navigate("/settings/manage-password")}>Manage Password</button>
          <button onClick={() => navigate("/settings/recent-activity")}>Recent Activity</button>
          <button onClick={() => navigate("/settings/my-data")}>My Data</button>
          <button onClick={() => navigate("/settings/delete-account")}>Delete Account</button>

          <h3>Legal</h3>
          <button onClick={() => navigate("/settings/terms-of-service")}>Terms of Service</button>
          <button onClick={() => navigate("/settings/privacy-policy")}>Privacy Policy</button>
        </div>

        {/* Right Panel */}
        <div className="settings-right">
          <h2>Manage Password</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="current-password">Current Password</label>
              <input
                type="password"
                id="current-password"
                name="currentPassword"
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                type="password"
                id="new-password"
                name="newPassword"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <div className="password-tooltip">
              <p>✔ 1 uppercase letter</p>
              <p>✔ 1 number or special character</p>
              <p>✔ Longer than 6 characters</p>
            </div>

            <button type="submit">Reset Password</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default SettingsManagePassword;
