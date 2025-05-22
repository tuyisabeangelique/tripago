// export default UserProfile;
import React, { useEffect, useState } from "react";
import "../../styles/user/UserProfile.css";
import UserAvatar from "../../assets/UserAvatar.png";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import MobileSidebarToggle from "../../components/MobileSidebarToggle.jsx";
import { encode } from "html-entities";
import FriendsModal from "../../components/community/FriendsModal.jsx";
import HelpTooltip from "../../components/HelpTooltip.jsx";
import imageCompression from 'browser-image-compression';

const UserProfile = () => {
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    profilePic: UserAvatar,
  });

  const [friends, setFriends] = useState([]);
  const [stats, setStats] = useState({
    totalTrips: 0,
    countriesVisited: 0,
    points: {
      total: 0,
      breakdown: {
        trips: 0,
        trip_days: 0,
        expenses: 0, 
        activities: 0
      }
    }
  });
  const [bucketList, setBucketList] = useState([]);
  const [newDestination, setNewDestination] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 480);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tripInvites, setTripInvites] = useState([]);
  const [userTrips, setUserTrips] = useState([]);
  const navigate = useNavigate();

  const [selectedTrip, setSelectedTrip] = useState(null); 

  const handleViewMore = (trip) => {
    setSelectedTrip(trip);
  };

  const handleCloseModal = () => {
    setSelectedTrip(null);
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch(
          "/CSE442/2025-Spring/cse-442aj/backend/api/users/getUserInfo.php",
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        console.log("User data received:", data);

        if (data.success) {
          setUser({
            firstName: data.user.first_name,
            lastName: data.user.last_name,
            username: data.user.username,
            email: data.user.email,
            profilePic: data.user.user_image_url || UserAvatar,
          });
          console.log("Fetching bucket list from userInfo w email: ", data.user.email)
          fetchBucketList(data.user.email)
        } else {
          console.warn("Could not fetch user info:", data.message);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    const fetchBucketList = async (email) => {
      console.log("Fetching bucket list, email is: ", email)
      try {
        const res = await fetch(
          "/CSE442/2025-Spring/cse-442aj/backend/api/community/getBucketList.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        );
        const data = await res.json();
        console.log("Bucket list data: ", data)
        if (data.success) {
          setBucketList(data.bucketList);
        }
      } catch (err) {
        console.error("Failed to fetch bucket list:", err);
      }
    };

    fetchUserInfo();

  }, []);

  useEffect(() => {

    const fetchUserTrips = async () => {
      try {
        const res = await fetch(
          `/CSE442/2025-Spring/cse-442aj/backend/api/community/getTripsByEmail.php?email=${user.email}`
        );
        const data = await res.json();

        console.log("Trips fetched: ", data);

        if (data.success) {
          const tripsWithEmail = data.trips.map((trip) => ({
            ...trip,
            email: user.email, // inject the email from useParams
          }));
          setUserTrips(tripsWithEmail);
        }
      } catch (err) {
        console.error("Failed to fetch user trips:", err);
      }
    };

    fetchUserTrips();

  }, [user.email])

  useEffect(() => {
    if (!user.email) return;

    const fetchTripInvites = async () => {
      console.log("Getting invites")
      try {
        const res = await fetch(
          "/CSE442/2025-Spring/cse-442aj/backend/api/trips/getTripInvites.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email }),
          }
        );

        const data = await res.json();
      console.log("Getting invites resp: ", data)

        if (data.success) {
          setTripInvites(data.invites);
      console.log("Data success and tripInv are: ", data.invites)

        } else {
          console.warn("No invites found");
        }
      } catch (err) {
        console.error("Error fetching invites:", err);
      }
    };

    fetchTripInvites();
  }, [user.email]);

  const fetchFriends = async () => {
    console.log("Getting friends");
    try {
      const res = await fetch(
        "/CSE442/2025-Spring/cse-442aj/backend/api/getFriends.php",
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      console.log("Response from getting friends is: ", data);

      if (data.success) {
        setFriends(data.friends);
      } else {
        console.warn("Failed to fetch friends:", data.message);
      }
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  };

  useEffect(() => {
    if (!user.email) return;

    const fetchStats = async () => {
      try {
        // Fetch trip stats
        const tripStatsRes = await fetch(
          "/CSE442/2025-Spring/cse-442aj/backend/api/trips/getTripStats.php",
          {
            credentials: "include",
          }
        );
        const tripStatsData = await tripStatsRes.json();

        // Fetch user points
        const pointsRes = await fetch(
          `/CSE442/2025-Spring/cse-442aj/backend/api/users/getUserPoints.php`,
          {
            credentials: "include",
          }
        );
        const pointsData = await pointsRes.json();

        setStats(prevStats => ({
          ...prevStats,
          totalTrips: tripStatsData.success ? tripStatsData.totalTrips : 0,
          countriesVisited: tripStatsData.success ? tripStatsData.countriesVisited : 0,
          points: pointsData.success ? pointsData.points : {
            total: 0,
            breakdown: {
              trips: 0,
              trip_days: 0,
              expenses: 0,
              activities: 0
            }
          }
        }));
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
    fetchFriends();
    
  }, [user.email]);

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth <= 480;
      setIsMobile(isNowMobile);
    };
  
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    try {
      // Compress the image
      const options = {
        maxSizeMB: 1, // Limit to 1MB
        maxWidthOrHeight: 1024, // Resize if necessary
        useWebWorker: true,
      };
  
      const compressedFile = await imageCompression(file, options);
  
      const formData = new FormData();
      formData.append("image", compressedFile);
  
      const res = await fetch(
        "/CSE442/2025-Spring/cse-442aj/backend/api/users/uploadUserImage.php",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
  
      const data = await res.json();
  
      if (data.success) {
        setUser((prev) => ({
          ...prev,
          profilePic: `${data.imageUrl}?t=${Date.now()}`, // bust cache
        }));
      } else {
        console.error("Upload failed:", data.message);
      }
    } catch (err) {
      console.error("Image compression/upload error:", err);
    }
  };

  const addDestination = async () => {
    if (!newDestination.trim()) return;

    try {
      const response = await fetch(
        "/CSE442/2025-Spring/cse-442aj/backend/api/community/addToBucketList.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            destination: newDestination.trim(),
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setBucketList((prev) => [...prev, newDestination.trim()]);
        setNewDestination("");
      } else {
        alert("Failed to add destination: " + result.message);
      }
    } catch (error) {
      console.error("Error adding destination:", error);
      alert("Something went wrong while adding the destination.");
    }
  };

  const handleAcceptInvite = async (tripId) => {
    console.log("Accepting invite and tripId and email is", tripId, user.email)
    try {
      const res = await fetch(
        "/CSE442/2025-Spring/cse-442aj/backend/api/trips/acceptInvite.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tripId, email: user.email }),
        }
      );

      const data = await res.json();
      console.log("After accepting invite and data is", data)
      if (data.success) {

        setTripInvites((prev) =>
          prev.filter((invite) => invite.trip_id !== tripId)
        );

        fetchFriends(); // Update Friends section 

        navigate("/profile", {
          state: {
            tripId: tripId,
            fromInvite: true,
          },
        });
      } else {
        console.error("Accept failed:", data.message);
      }
    } catch (err) {
      console.error("Error accepting invite:", err);
    }
  };

  const handleIgnoreInvite = async (tripId) => {
    try {
      const res = await fetch(
        "/CSE442/2025-Spring/cse-442aj/backend/api/trips/removeCollaborator.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tripId, email: user.email }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setTripInvites((prev) =>
          prev.filter((invite) => invite.trip_id !== tripId)
        );
      } else {
        console.error("Ignore failed:", data.message);
      }
    } catch (err) {
      console.error("Error ignoring invite:", err);
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
      <div className="profile-container">
        <div className="profile-header user-profile-section">
          <label
            htmlFor="profile-pic-upload"
            className="profile-pic-label"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <img
              src={user.profilePic}
              alt="User Avatar"
              className="profile-avatar"
            />
          </label>
          <input
            type="file"
            id="profile-pic-upload"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
          <p className="update-text">Click image to update</p>
          <div className="header-info">
            <h1>
              {encode(user.firstName)} {encode(user.lastName)}
            </h1>
            <p className="username-text">@{user.username}</p>
            <button
              className="edit-name-btn"
              onClick={() => navigate("/settings/profile-details")}
            >
              <FaEdit /> Edit Details
            </button>
          </div>
        </div>

        <div className="trip-invites user-profile-section">
          <h3>Trip Invites</h3>
          {tripInvites.length === 0 ? (
            <p>When someone invites you to plan a trip with them, you'll see the request here.</p>
          ) : (
            <ul>
              {tripInvites.map((invite, index) => (
                <li key={index}>
                  <span>@{invite.senderName}{" "}</span>
                  invited you to plan a trip.
                  <div style={{ marginTop: "6px" }}>
                    <button
                      className="add-new-dest-btn"
                      onClick={() => handleAcceptInvite(invite.tripId)}
                    >
                     Go plan
                    </button>
                    <button
                      className="ignore-invite-btn"
                      onClick={() => handleIgnoreInvite(invite.tripId)}
                    >
                      Ignore
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bucket-list user-profile-section">
          <h3>Travel Bucket List</h3>
          <ul>
            {bucketList.length === 0 ? (
              <p>No destinations added yet.</p>
            ) : (
              bucketList.map((place, index) => <li key={index}>{place}</li>)
            )}
          </ul>
          <div className="add-destination">
            <input
              type="text"
              value={newDestination}
              onChange={(e) => setNewDestination(e.target.value)}
              placeholder="Add a new destination..."
            />
            <button onClick={addDestination} className="add-new-dest-btn">
              Add
            </button>
          </div>
        </div>

        <div className="trip-stats user-profile-section">
          <h3>Trip Stats</h3>
          <p>Total Trips Taken: {stats.totalTrips}</p>
          <p>Countries Visited: {stats.countriesVisited}</p>
          <div className="points-section">
          <div className="tooltip-container">
              <HelpTooltip>
                <h4>
                  <span className="tooltip-purple">
                    Earn points as you explore!
                  </span>
                </h4>
                <ul
                >
                  <li>
                    <strong>Trip Bonus:</strong> 100 points per trip
                  </li>
                  <li>
                    <strong>Day Bonus:</strong> 25 points for each day of your
                    trips
                  </li>
                  <li>
                    <strong>Expense Bonus:</strong> 15 points per expense you
                    add
                  </li>
                  <li>
                    <strong>Activity Bonus:</strong> 10 points per activity you
                    plan
                  </li>
                </ul>
              </HelpTooltip>
              <h4>Travel Points: {stats.points.total}</h4>
            </div>
            <div className="points-breakdown">
              <p data-points={stats.points.breakdown.trips}>Trip Bonus</p>
              <p data-points={stats.points.breakdown.trip_days}>Day Bonus</p>
              <p data-points={stats.points.breakdown.expenses}>Expense Bonus</p>
              <p data-points={stats.points.breakdown.activities}>Activity Bonus</p>
            </div>
          </div>
        </div>

        <div className="friends-list user-profile-section">
          <h3>Friends</h3>
          <ul>
            {friends.length === 0 ? (
              <p>You have no friends yet.</p>
            ) : (
              friends.map((friend, index) => (
                <li
                  key={index}
                  className="clickable-name"
                  onClick={() =>
                    navigate(
                      `/traveler-profile/${encodeURIComponent(friend.email)}`
                    )
                  }
                  style={{ cursor: "pointer", textDecoration: "none" }}
                >
                  {encode(friend.first_name)} {encode(friend.last_name)}
                </li>
              ))
            )}
          </ul>
          <p
            onClick={() => navigate("/community")}
            className="find-new-friends-p"
          >
            Find new friends in the Community tab
          </p>
        </div>
        
        <div className="trip-list user-profile-section">
          <h3>Shared Trips</h3>
          {userTrips.length === 0 ? (
            <p>No trips shared publicly.</p>
          ) : (
            userTrips.map((trip) => (
              <div key={trip.id} className="trip-card">
                <div className="trip-info">
                  <h2>
                    <span className="bold">{encode(user.firstName)}'s</span>{" "}
                    trip to{" "}
                    <span className="highlight">{encode(trip.city_name)}</span>
                  </h2>
                  {trip.comment && (
                    <p className="trip-comment">"{encode(trip.comment)}"</p>
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
                    src={trip.image_url}
                    alt={trip.city_name}
                    className="trip-image"
                  />
                </div>
              </div>
            ))
          )}
        </div>
        <FriendsModal
          isOpen={selectedTrip !== null}
          onClose={handleCloseModal}
          user={`${user.firstName} ${user.lastName}`}
          location={selectedTrip?.city_name}
          imageUrl={selectedTrip?.image_url}
          comment={selectedTrip?.comment}
          isFriend={true}
          tripId={selectedTrip?.id}
          userEmail={user.email} // traveler’s email from useParams
          currentUserEmail={user?.email}
        />
      </div>
    </>
  );
};

export default UserProfile;
