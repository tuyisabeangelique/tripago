import React, { useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import "../../styles/trip/TripCollaborators.css";

const TripCollaborators = ({ tripId, firstName, lastName, isInvitee }) => {
  const [showInput, setShowInput] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRemoved, setShowRemoved] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false); // NEW

  const handleAddCollaborator = async () => {
    setError("");
    if (!username.trim()) return;

    try {
      const res = await fetch(
        "/CSE442/2025-Spring/cse-442aj/backend/api/trips/addCollaborator.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tripId, username, firstName, lastName }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setInvitedUsers((prev) => [...prev, { username }]);
        setUsername("");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1300);
      } else {
        setError(data.message || "Failed to add collaborator.");
      }
    } catch (err) {
      console.error("Add collaborator error:", err);
      setError("Something went wrong. Try again.");
    }
  };

  const handleRemoveInvite = async (usernameToRemove) => {
    try {
      const res = await fetch(
        "/CSE442/2025-Spring/cse-442aj/backend/api/trips/removeCollaborator.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tripId, username: usernameToRemove }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setInvitedUsers((prev) =>
          prev.filter((u) => u.username !== usernameToRemove)
        );
        setShowRemoved(true);
        setTimeout(() => setShowRemoved(false), 1300);
      } else {
        console.error("Failed to remove invite:", data.message);
      }
    } catch (err) {
      console.error("Remove collaborator error:", err);
    }
  };

  return (
    <div className="collaborator-wrapper">
      {isInvitee ? (
        <button
          className="collaborator-btn"
          onClick={() => setShowInfoModal(!showInfoModal)}
        >
          Collaborator
        </button>
      ) : (
        <button
          className="collaborator-btn"
          onClick={() => setShowInput((prev) => !prev)}
        >
          <FaUserPlus /> Manage Invites
        </button>
      )}

      {!isInvitee && showInput && (
        <div className="collaborator-popup">
          <p className="collab-info">
            Share this trip with a friend by entering their username. They’ll be
            able to edit trip details with you!
          </p>
          <div className="collab-input-group">
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={error ? "input-error" : ""}
            />
            <button className="collab-add-btn" onClick={handleAddCollaborator}>
              Send Invite
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}

          {invitedUsers.length > 0 && (
            <div className="invited-list">
              {invitedUsers.map((u, i) => (
                <div key={i} className="invited-user">
                  You invited {u.username}.
                  <button
                    className="invited-remove-btn"
                    onClick={() => handleRemoveInvite(u.username)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-content send-req-modal-content">
            Invite sent successfully
          </div>
        </div>
      )}

      {showRemoved && (
        <div className="modal-overlay">
          <div className="modal-content send-req-modal-content">
            Invite removed successfully
          </div>
        </div>
      )}

      {/* Info modal for invitees */}
      {showInfoModal && (
        <div className="collaborator-popup collab-popup-invitee">
            <h3>You’re a Collaborator</h3>
            
            <p className="collab-info">
              You’ve been <span>invited to co-plan</span> this trip! You can help edit the
              itinerary, hotel details, and budget. 
            </p>
            <p className="collab-info">Click the <span>discussion bar below</span> to discuss your trip plans. </p>
        </div>
      )}
    </div>
  );
};

export default TripCollaborators;

