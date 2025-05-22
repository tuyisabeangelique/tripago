import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Settings.css';
import MobileSidebarToggle from "../../components/MobileSidebarToggle";
import Sidebar from "../../components/Sidebar";
import { FaCog } from 'react-icons/fa';


const DeleteAccount = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 480);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth <= 480;
      setIsMobile(isNowMobile);
    };

    handleResize(); // Run on first load
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleDelete = async () => {
    try {
      const response = await fetch('/CSE442/2025-Spring/cse-442aj/backend/api/users/deleteAccount.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        // Clear cookies and redirect to login
        document.cookie = 'authCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        navigate('/login');
      } else {
        setError(data.message || 'Failed to delete account');
      }
    } catch {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <>
      {isMobile && (
        <MobileSidebarToggle
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
      )}

      <Sidebar isOpen={!isMobile || isSidebarOpen} />
      
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
            <button className="selected" onClick={() => navigate("/settings/delete-account")}>Delete Account</button>

            <h3>Legal</h3>
            <button onClick={() => navigate("/settings/terms-of-service")}>Terms of Service</button>
            <button onClick={() => navigate("/settings/privacy-policy")}>Privacy Policy</button>
        
        </div>

        {/* Right Panel */}
        <div className="settings-right">
          <h2>Delete Account</h2>
          <div className="delete-account-section">
            <p className="warning-text">
              Warning: This action cannot be undone. Deleting your account will:
            </p>
            <ul className="deletion-effects">
              <li>Remove all your personal information</li>
              <li>Delete all your trips and travel plans, including:
                <ul>
                  <li>Trip memories and associated images</li>
                  <li>Trip discussions and comments</li>
                  <li>Travel expenses and financial records</li>
                  <li>Trip activities and itineraries</li>
                  <li>Trip collaborations with other users</li>
                </ul>
              </li>
              <li>Remove your social connections:
                <ul>
                  <li>Friend relationships</li>
                  <li>Comments on other travelers&apos; trips</li>
                  <li>Discussion participations</li>
                </ul>
              </li>
              <li>Delete your personal collections:
                <ul>
                  <li>Favorite destinations</li>
                  <li>Bucket list entries</li>
                  <li>Travel activity history</li>
                </ul>
              </li>
            </ul>

            {!showConfirmation ? (
              <button 
                className="delete-button"
                onClick={() => setShowConfirmation(true)}
              >
                Delete My Account
              </button>
            ) : (
              <div className="confirmation-dialog">
                <p>Please enter your password to confirm deletion</p>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="password-input"
                />
                {error && <p className="error-message">{error}</p>}
                <div className="confirmation-buttons">
                  <button 
                    className="cancel-button"
                    onClick={() => {
                      setShowConfirmation(false);
                      setPassword('');
                      setError('');
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="confirm-delete-button"
                    onClick={handleDelete}
                    disabled={!password}
                  >
                    Confirm Deletion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteAccount; 