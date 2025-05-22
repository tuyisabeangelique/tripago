import React, { useEffect, useState } from "react";
import { FaComments } from "react-icons/fa";
import "../../styles/trip/DiscussionBar.css";

const DiscussionBar = ({ tripId, isInvitee }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [comments, setComments] = useState([]);
  const [collaborators, setCollaborators] = useState([]);

  const fetchComments = async () => {
    console.log("Fetching comments");
    try {
      const res = await fetch(
        `/CSE442/2025-Spring/cse-442aj/backend/api/trips/getComments.php?tripId=${tripId}`
      );
      const data = await res.json();
      console.log("Comments fetched: data is: ", data);

      if (data.success) {
        setComments(data.comments);
        console.log("Comments fetched: ", data);
      } else {
        console.warn("Failed to fetch comments:", data.message);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const res = await fetch(
          `/CSE442/2025-Spring/cse-442aj/backend/api/trips/getCollaborators.php?tripId=${tripId}`
        );
        const data = await res.json();
        if (data.success) {
          setCollaborators(data.collaborators);
        }
      } catch (err) {
        console.error("Error fetching collaborators:", err);
      }
    };

    fetchCollaborators();
  }, [tripId]);

  useEffect(() => {
    if (open) {
      fetchComments();
    }
  }, [open]);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      const res = await fetch(
        "/CSE442/2025-Spring/cse-442aj/backend/api/trips/addComment.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tripId, message }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setMessage("");
        fetchComments();
      } else {
        alert(data.message || "Failed to send comment.");
      }
    } catch (err) {
      console.error("Send comment error:", err);
    }
  };

  return (
    <div className={`discussion-bar ${open ? "open" : "collapsed"}`}>
      <div className="discussion-header" onClick={() => setOpen(!open)}>
        <FaComments /> {open ? "Discussion" : "Discussion"}
      </div>
      <div className={`discussion-body-wrapper ${open ? "open" : ""}`}>
        <div className="discussion-body">
          <div className="discussion-members">
            <p>
              {isInvitee ? (
                <>
                  <strong>Trip collaborators:</strong>{" "}
                  {collaborators.length > 0
                    ? collaborators
                        .map((c) => `${c.firstName} ${c.lastName}`)
                        .join(", ")
                    : "No collaborators listed yet."}
                </>
              ) : (
                <>
                  <strong>Planning with:</strong>{" "}
                  {collaborators.length > 0
                    ? collaborators
                        .map((c) => `${c.firstName} ${c.lastName}`)
                        .join(", ")
                    : "Just you for now"}
                </>
              )}
            </p>
          </div>
          <div className="messages-placeholder">
            {comments.length === 0 ? (
              <p>No messages yet. Start the conversation!</p>
            ) : (
              comments.map((c, i) => (
                <div
                  key={i}
                  className={`comment ${c.is_action ? "action-comment" : ""}`}
                >
                  {!c.is_action && (
                    <img
                      src={c.image}
                      alt={`${c.username}'s avatar`}
                      className="comment-avatar"
                    />
                  )}

                  <div className="comment-bubble">
                    {c.is_action ? (
                      <>{c.comment}</>
                    ) : (
                      <>
                        <strong>{c.username}</strong>: {c.comment}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="discussion-input">
            <input
              type="text"
              placeholder="Type your suggestions here"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button className="collab-add-btn" onClick={handleSend}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionBar;
