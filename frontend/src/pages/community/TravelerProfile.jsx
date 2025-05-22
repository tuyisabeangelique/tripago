import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/user/UserProfile.css";
import UserAvatar from "../../assets/UserAvatar.png";
import { encode } from "html-entities";
import Sidebar from "../../components/Sidebar.jsx";
import MobileSidebarToggle from "../../components/MobileSidebarToggle.jsx";
import { useNavigate } from "react-router-dom";
import FriendsModal from "../../components/community/FriendsModal.jsx";
import HelpTooltip from "../../components/HelpTooltip.jsx";

const TravelerProfile = () => {
  const { email } = useParams();
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    username: "",
    profilePic: UserAvatar,
  });
  const [stats, setStats] = useState({
    totalTrips: 0,
    countriesVisited: 0,
    points: {
      total: 0,
      breakdown: {
        trips: 0,
        trip_days: 0,
        expenses: 0,
        activities: 0,
      },
    },
  });
  const [friendsList, setFriendsList] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 480);
  const [userTrips, setUserTrips] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [bucketList, setBucketList] = useState([]);
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
          `/CSE442/2025-Spring/cse-442aj/backend/api/community/getPublicUserInfo.php?email=${email}`
        );
        const data = await res.json();
        if (data.success) {
          setUser({
            firstName: data.user.first_name,
            lastName: data.user.last_name,
            username: data.user.username,
            profilePic: data.user.user_image_url || UserAvatar,
          });
          setStats((prevStats) => ({
            ...prevStats,
            totalTrips: data.totalTrips,
            countriesVisited: data.countriesVisited,
          }));
          setFriends(data.friends);

          // Fetch user points
          const pointsRes = await fetch(
            `/CSE442/2025-Spring/cse-442aj/backend/api/users/getUserPoints.php?email=${email}`
          );
          const pointsData = await pointsRes.json();

          if (pointsData.success) {
            setStats((prevStats) => ({
              ...prevStats,
              points: pointsData.points,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch traveler info:", err);
      }
    };

    fetchUserInfo();

    const fetchBucketList = async () => {
      try {
        const res = await fetch(
          `/CSE442/2025-Spring/cse-442aj/backend/api/community/getBucketList.php?email=${email}`
        );
        const data = await res.json();
        if (data.success) {
          setBucketList(data.bucketList);
        }
      } catch (err) {
        console.error("Failed to fetch bucket list:", err);
      }
    };

    fetchBucketList();

    const fetchUserTrips = async () => {
      try {
        const res = await fetch(
          `/CSE442/2025-Spring/cse-442aj/backend/api/community/getTripsByEmail.php?email=${email}`
        );
        const data = await res.json();

        console.log("Trips fetched: ", data);

        if (data.success) {
          const tripsWithEmail = data.trips.map((trip) => ({
            ...trip,
            email: email, // inject the email from useParams
          }));
          setUserTrips(tripsWithEmail);
        }
      } catch (err) {
        console.error("Failed to fetch user trips:", err);
      }
    };

    fetchUserTrips();

    const handleResize = () => {
      const isNowMobile = window.innerWidth <= 480;
      setIsMobile(isNowMobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [email]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetch(
          "/CSE442/2025-Spring/cse-442aj/backend/api/getFriends.php",
          { credentials: "include" }
        );
        const data = await res.json();
        if (data.success) {
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

  const isFriend = selectedTrip
    ? friendsList.includes(selectedTrip.email)
    : false;

  return (
    <>
      {isMobile && (
        <MobileSidebarToggle
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
      )}
      <Sidebar isOpen={!isMobile || isSidebarOpen} />
      <div className="profile-container public_profile-container">
        <button className="back-btn" onClick={() => navigate("/community")}>
          ← Back to Community
        </button>
        <div className="profile-header user-profile-section">
          <img
            src={user.profilePic}
            alt="Traveler Avatar"
            className="profile-avatar"
          />
          <div className="header-info">
            <h1>
              {encode(user.firstName)} {encode(user.lastName)}
            </h1>
            <p className="username-text">@{user.username}</p>
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
                <ul>
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
              <p data-points={stats.points.breakdown.activities}>
                Activity Bonus
              </p>
            </div>
          </div>
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
          isFriend={isFriend}
          tripId={selectedTrip?.id}
          userEmail={email} // traveler’s email from useParams
          currentUserEmail={user?.email}
        />
      </div>
    </>
  );
};

export default TravelerProfile;
