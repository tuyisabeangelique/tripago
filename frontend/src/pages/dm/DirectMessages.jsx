import React, { useEffect, useState } from "react";
import "../../styles/dm/DirectMessage.css";
import boy from "../../assets/avatars/boy.png";
import girl from "../../assets/avatars/girl.png";
import UserAvatar from "../../assets/UserAvatar.png";
import Sidebar from "../../components/Sidebar.jsx";
import MobileSidebarToggle from "../../components/MobileSidebarToggle.jsx";
import { useNavigate } from "react-router-dom";

const DirectMessages = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth <= 680;

      setIsMobile(isNowMobile);
    };

    handleResize(); // Run on first load
    window.addEventListener("resize", handleResize); // Watch for resizes

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetch(
          "/CSE442/2025-Spring/cse-442aj/backend/api/getFriends.php",
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        console.log("DM frineds are, ", data);

        if (data.success) {
          setFriends(data.friends);
          console.log(data);
        } else {
          console.error("Failed to load friends:", data.message);
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };
    fetchFriends();
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
      <Sidebar isOpen={!isMobile || isSidebarOpen} />

      <div className="direct-messages-container">
        <div className="dm-header-container">
          <h2 className="dm-header">Chats</h2>
          <input className="dm-search-bar" type="text" placeholder="Search" />
        </div>

        {friends.length === 0 ? (
          <div className="dm-empty-state">
            <p>Nothing to see here.</p>
            <p
              onClick={() => navigate("/community")}
              className="find-new-friends-p"
            >
              Find new friends in the Community tab
            </p>
          </div>
        ) : (
          <div className="chat-list">
            {friends.map((friend, index) => (
              <div
                className="chat-item"
                key={index}
                onClick={() =>
                  navigate(
                    `/messages/${encodeURIComponent(
                      friend.first_name + " " + friend.last_name
                    )}`,
                    {
                      state: {
                        image: friend.user_image_url || UserAvatar,
                        email: friend.email
                      },
                    }
                  )
                }
              >
                <img
                  className="chat-avatar"
                  src={friend.user_image_url || UserAvatar}
                  alt={friend.first_name}
                />
                <div className="chat-details">
                  <div className="chat-header">
                    <span className="chat-name">
                      {friend.first_name} {friend.last_name}
                    </span>
                  </div>
                  <div className="chat-message">Start a conversation</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default DirectMessages;
