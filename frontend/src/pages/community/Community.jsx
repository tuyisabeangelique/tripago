import { useEffect, useState } from "react";
import "../../styles/community/Community.css";
import "../../styles/TripTags.css";
import paris from "../../assets/paris.jpg";
import sandiego from "../../assets/sandiego.jpg";
import FriendsModal from "../../components/community/FriendsModal.jsx";
import RequestsModal from "../../components/community/RequestsModal.jsx";
import axios from "axios";
import Sidebar from "../../components/Sidebar.jsx";
import MobileSidebarToggle from "../../components/MobileSidebarToggle.jsx";
import { encode } from "html-entities";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext.jsx";
import UserAvatar from "../../assets/UserAvatar.png";
import { useNavigate } from "react-router-dom";
import { AVAILABLE_TAGS } from "../../components/trip/TripTags.jsx";

const Community = () => {
  const [trips, setTrips] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [friendsList, setFriendsList] = useState([]); //
  const [modalType, setModalType] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 480);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [usernameSearchTerm, setUsernameSearchTerm] = useState("");
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const [showUsernameSuggestions, setShowUsernameSuggestions] = useState(false);

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
        if (data.success) {
          // Save emails only
          const emails = data.friends.map((friend) => friend.email);
          setFriendsList(emails);
        } else {
          console.warn("Failed to fetch friends:", data.message);
        }
      } catch (err) {
        console.error("Error fetching friends:", err);
      }
    };

    fetchFriends();
  }, []);

//HANDLES THE AUTO COMPLETE THING FOR USER SEARCH
  const handleUsernameSearchChange = async (e) => {
    const value = e.target.value;
    setUsernameSearchTerm(value);
  
    if (value.length < 2) { // Adjust the minimum characters as needed
      setUsernameSuggestions([]);
      setShowUsernameSuggestions(false);
      return;
    }
  
    try {
      const res = await fetch(
        `/CSE442/2025-Spring/cse-442aj/backend/api/users/searchUsernames.php?keyword=${encodeURIComponent(
          value
        )}` // Replace with your actual API endpoint for searching users
      );
      const data = await res.json();
  
      setUsernameSuggestions(data.usernames.map(username => ({ username }))); // Map to the expected format
      setShowUsernameSuggestions(true);
    } catch (err) {
      console.error("Error fetching username suggestions:", err);
      setUsernameSuggestions([]);
      setShowUsernameSuggestions(false);
    }
  };


  useEffect(() => {
    console.log("Fetching community trips:");

    axios
      .get(
        "/CSE442/2025-Spring/cse-442aj/backend/api/trips/getCommunityTrips.php"
      )
      .then((res) => {
        setTrips(res.data);
        console.log("Community trips generated from db are: ", res.data);
      })
      .catch((err) => {
        console.error("Failed to load trips", err);
      });
  }, []);

  const isFriend = selectedTrip
    ? friendsList.includes(selectedTrip.email)
    : false;
  // Open modal with selected trip
  const handleViewMore = (trip) => {
    setSelectedTrip(trip);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedTrip(null);
  };

  const [incomingRequests, setIncomingRequests] = useState([]);

  const [sentRequests, setSentRequests] = useState([]); // Initialize as empty array

  const [searchError, setSearchError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(""); // Hide modal after 2 seconds
      }, 1000);

      return () => clearTimeout(timer); // Cleanup on unmount or if message changes
    }
  }, [successMessage]);

  const handleSend = async (e) => {
    e.preventDefault();
    console.log("Username Search Term:", usernameSearchTerm); // Log the correct state
    setSearchTerm(usernameSearchTerm); // Update searchTerm with the input value
    setSearchError(""); // reset any previous error
    try {
      const response = await axios.post(
        "/CSE442/2025-Spring/cse-442aj/backend/api/sendFriendRequest.php",
        { searchTerm: usernameSearchTerm },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const result = response.data;
      console.log("Send reponse: ", response.data);
      if (result.success) {
        setSuccessMessage(result.message);
        setSearchError("");
        setSearchTerm("");
      } else {
        setSearchError(result.message);
      }
    } catch (error) {
      console.log("Error during search: ");
      if (error.response) {
        console.error("Server responded with:", error.response.data);
        console.error("Status code:", error.response.status);
        console.error("Headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received. Request:", error.request);
      } else {
        console.error("Error setting up the request:", error.message);
      }
      console.error("Original error:", error); // Log the full error for debugging.
    }
  };

  //called when you click "view sent requests" button
  //Will show you requests that you sent
  const getSentRequests = async (e) => {
    try {
      console.log("Fetching sent requests with emails!");
      const response = await axios.post(
        "/CSE442/2025-Spring/cse-442aj/backend/api/getSentRequests.php",
        { test: "empty" },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = response.data;

      console.log("Sent requests data:", result);

      let newSentRequests = []; // Create a new array

      // Handle accepted friends
      if (result[0] && result[0].length > 0) {
        result[0].forEach((friend) => {
          newSentRequests.push({
            id: Date.now() + Math.random(),
            name: friend.name,
            email: friend.email, // Extract email
            status: "Accepted",
          });
        });
      }

      // Handle pending requests
      if (result[1] && result[1].length > 0) {
        result[1].forEach((request) => {
          newSentRequests.push({
            id: Date.now() + Math.random(),
            name: request.name,
            email: request.email, // Extract email
            status: "Pending",
          });
        });
      }

      setSentRequests(newSentRequests); // Update sentRequests with the new array
    } catch (error) {
      if (error.response) {
        console.error("Server responded with:", error.response.data);
        console.error("Status code:", error.response.status);
        console.error("Headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received. Request:", error.request);
      } else {
        console.error("Error setting up the request:", error.message);
      }
      console.error("Original error:", error); // Log the full error for debugging.
    }
  };

  const getIncomingRequests = async (e) => {
    try {
      const response = await axios.post(
        "/CSE442/2025-Spring/cse-442aj/backend/api/getIncFriends.php",
        { test: "empty" },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = response.data;
      console.log(result);

      let newIncFriends = [];

      if (result.length > 0) {
        result.forEach((name) => {
          newIncFriends.push({
            id: Date.now() + Math.random(),
            name: name,
          });
        });
      }

      setIncomingRequests(newIncFriends);
    } catch (error) {
      if (error.response) {
        console.error("Server responded with:", error.response.data);
        console.error("Status code:", error.response.status);
        console.error("Headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received. Request:", error.request);
      } else {
        console.error("Error setting up the request:", error.message);
      }
      console.error("Original error:", error); // Log the full error for debugging.
    }
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredTrips = trips
    .filter((trip) => trip.email !== user?.email)
    .filter((trip) => 
      selectedTags.length === 0 || 
      selectedTags.every(tag => trip.tags?.includes(tag))
    );

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
      <div className="community-container">
        {/* Top Section */}
        <div className="community-top">
          <div className="find-friends">
            <label className="find-friends-label">Find Friends</label>

            <div className="find-friends-inputs" style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search by username"
                className="search-input"
                value={usernameSearchTerm}
                onChange={handleUsernameSearchChange}
                onFocus={() => setShowUsernameSuggestions(true)}
                onBlur={() => setTimeout(() => setShowUsernameSuggestions(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && usernameSuggestions.length > 2){
                    e.preventDefault();
                    setUsernameSearchTerm(usernameSuggestions[0].username); 
                    setShowUsernameSuggestions(false);
                  }
                }}
                style={{ border: searchError ? "0.9px solid red" : undefined }}
              />

              {showUsernameSuggestions && usernameSuggestions.length > 0 && (
                  <ul className="autocomplete-dropdown"> 
                    {usernameSuggestions.map((user, index) => (
                      <li
                        key={index}
                        className="autocomplete-option" 
                        onClick={() => {
                          setUsernameSearchTerm(user.username);
                          setShowUsernameSuggestions(false);
                        }}
                      >
                        {encode(user.username)}
                      </li>
                    ))}
                  </ul>
                )}
              <button style={{ marginLeft: "10px" }} onClick={handleSend}>
                Send
              </button>
              {successMessage && (
                <div className="modal-overlay">
                  <div className="modal-content send-req-modal-content">
                    {successMessage}
                  </div>
                </div>
              )}
            </div>
            {searchError && (
              <p
                style={{
                  color: "red",
                  marginTop: "2px",
                  marginBottom: "2px",
                  fontSize: "0.9em",
                }}
              >
                {searchError}
              </p>
            )}
          </div>
          {/* Requests Section */}
          <div className="requests-section">
            <h3>Requests</h3>
            <button
              className="view-requests-btn"
              onClick={() => {
                setModalType("incoming");
                getIncomingRequests();
              }}
            >
              View Incoming Requests
            </button>
            <button
              className="view-requests-btn"
              onClick={() => {
                setModalType("sent");
                getSentRequests();
                console.log("sentRequests: " + sentRequests);
              }}
            >
              View Friends
            </button>
          </div>
        </div>

        <div className="community-bottom">
          {/* Main Section: List of Trips */}
          <div className="trip-list">
            <div className="trip-filters">
              <h3>Filter by Tags</h3>
              <div className="tags-container">
                {AVAILABLE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    className={`tag-chip ${selectedTags.includes(tag) ? 'selected' : ''}`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {encode(tag)}
                  </button>
                ))}
              </div>
            </div>

            <h3>Discover Friends</h3>
            {filteredTrips.length === 0 ? (
              <div className="no-results-message">
                {selectedTags.length > 0 ? (
                  <>
                    <p>No trips found matching the selected tags.</p>
                    <button 
                      className="clear-filters-btn"
                      onClick={() => setSelectedTags([])}
                    >
                      Clear Filters
                    </button>
                  </>
                ) : (
                  <p>No trips have been shared in the community yet.</p>
                )}
              </div>
            ) : (
              filteredTrips.map((trip) => (
                <div key={trip.id} className="trip-card">
                  {/* Left Side: Text & Buttons */}
                  <div className="trip-info">
                    <div className="trip-header">
                      {console.log("default", UserAvatar)}

                      <img
                        src={
                          trip.userImageUrl && trip.userImageUrl.trim() !== ""
                            ? trip.userImageUrl
                            : UserAvatar
                        }
                        onError={(e) => {
                          console.warn("Image failed to load for", trip.user);
                          e.target.onerror = null;
                          e.target.src = UserAvatar;
                        }}
                        alt="User avatar"
                        className="profile-image"
                      />

                      <h2>
                        <span
                          className="bold clickable-name"
                          onClick={() =>
                            navigate(
                              `/traveler-profile/${encodeURIComponent(
                                trip.email
                              )}`
                            )
                          }
                        >
                          {encode(trip.user)}&apos;s
                        </span>{" "}
                        trip to{" "}
                        <span className="highlight">
                          {encode(trip.location)}
                        </span>
                        .
                      </h2>
                    </div>

                    {trip.comment && (
                      <p className="trip-comment">&ldquo;{encode(trip.comment)}&rdquo;</p>
                    )}

                    {trip.tags && trip.tags.length > 0 && (
                      <div className="trip-tags-display">
                        {trip.tags.map(tag => (
                          <span key={tag} className="tag-chip readonly">
                            {encode(tag)}
                          </span>
                        ))}
                      </div>
                    )}

                    {!friendsList.includes(trip.email) && (
                      <button className="send-request-btn">Send Request</button>
                    )}
                    <button
                      className="view-more-btn"
                      onClick={() => handleViewMore(trip)}
                    >
                      View More
                    </button>
                  </div>

                  <div className="community-image">
                    <img
                      src={trip.imageUrl}
                      alt={encode(trip.location)}
                      className="trip-image"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <FriendsModal
          isOpen={selectedTrip !== null}
          onClose={() => setSelectedTrip(null)}
          user={selectedTrip?.user}
          location={selectedTrip?.location}
          imageUrl={selectedTrip?.imageUrl}
          comment={selectedTrip?.comment}
          isFriend={isFriend}
          tripId={selectedTrip?.id}
          userEmail={selectedTrip?.email}
          currentUserEmail={user?.email}
        />
        {/* Requests Modal */}
        <RequestsModal
          isOpen={modalType !== null}
          onClose={() => setModalType(null)}
          type={modalType}
          incomingRequests={incomingRequests}
          setIncomingRequests={setIncomingRequests}
          sentRequests={sentRequests}
        />
      </div>
    </>
  );
};

export default Community;
