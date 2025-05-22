import React, { useEffect, useState } from "react";
import "../../styles/user/UserProfile.css";
import UserAvatar from "../../assets/UserAvatar.png";
import parisPicture from "../../assets/paris.jpg";
import charlestonPicture from "../../assets/charleston.jpg";
import plane from "../../assets/plane.png";
import house from "../../assets/house.png";
import car from "../../assets/car.png";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import MobileSidebarToggle from "../../components/MobileSidebarToggle";
import Sidebar from "../../components/Sidebar";
import { encode } from "html-entities";
import axios from "axios";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext.jsx";
import FriendsModal from "../../components/community/FriendsModal.jsx";
import HelpTooltip from "../../components/HelpTooltip.jsx";
import DeleteTrip from "../../components/trip/DeleteTrip.jsx";

const AllTrips = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState(""); // Sorting option
  const [trips, setTrips] = useState([]);
  const [collabTrips, setCollabTrips] = useState([]);
  const [logged, setLogged] = useState([]);
  const [notLogged, setNotLogged] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 480);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchTrips = async () => {
      console.log("Fetching trips...");

      try {
        const res = await fetch(
          "/CSE442/2025-Spring/cse-442aj/backend/api/trips/getAllTrips.php",
          {
            credentials: "include",
          }
        );

        console.log("Response object:", res);

        const data = await res.json();

        console.log("Data returned from PHP:", data);

        if (data.success) {
          console.log("Trips received:", data.trips);
          setTrips(data.trips);
          console.log("Collab trips received:", data.collaborating);
          setCollabTrips(data.collaborating || []);

          setLogged(data.trips.filter((trip) => trip.logged == true));
          setNotLogged(data.trips.filter((trip) => trip.logged != true));
        } else {
          console.error("Backend error message:", data.message);
        }
      } catch (error) {
        console.error("Fetch failed:", error);
      }
    };

    fetchTrips();

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

  // Sort trips by selected criteria
  const handleSortChange = (event) => {
    const value = event.target.value;
    setSortBy(value);

    let sortedTrips = [...trips];
    if (value === "date") {
      sortedTrips.sort(
        (a, b) => new Date(b.start_date) - new Date(a.start_date)
      );
    } else if (value === "price") {
      sortedTrips.sort((a, b) => a.price - b.price);
    }

    setTrips(sortedTrips);

    setLogged(sortedTrips.filter((trip) => trip.logged == true));
    setNotLogged(sortedTrips.filter((trip) => trip.logged != true));
  };

  const postToLog = async (trip) => {
    const updatedTrip = { ...trip, logged: true };

    try {
      const response = await axios.post(
        "/CSE442/2025-Spring/cse-442aj/backend/api/trips/postToLog.php",
        updatedTrip,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = response.data;
      console.log("postToLog Form Response: ", result);

      if (result.success) {
        const newTrips = trips.map((t) =>
          t.id === updatedTrip.id ? updatedTrip : t
        );
        setTrips(newTrips);
        setLogged(newTrips.filter((t) => t.logged));
        setNotLogged(newTrips.filter((t) => !t.logged));
      }
    } catch (err) {
      console.log("Error posting to log: ", err);
    }
  };

  const removeFromLog = async (trip) => {
    const updatedTrip = { ...trip, logged: false };

    try {
      const response = await axios.post(
        "/CSE442/2025-Spring/cse-442aj/backend/api/trips/postToLog.php",
        updatedTrip,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = response.data;
      console.log("postToLog Form Response: ", result);

      if (result.success) {
        const newTrips = trips.map((t) =>
          t.id === updatedTrip.id ? updatedTrip : t
        );
        setTrips(newTrips);
        setLogged(newTrips.filter((t) => t.logged));
        setNotLogged(newTrips.filter((t) => !t.logged));
      }
    } catch (err) {
      console.log("Error removing from log: ", err);
    }
  };

  const handleViewMore = (trip) => {
    setSelectedTrip(trip);
    setShowModal(true);
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
      <Sidebar isOpen={!isMobile || isSidebarOpen} />

      <div className="all-trips-container">
        <div className="user-profile-main-content all-trips-main-content">
          <div className="browse-trips_tooltip-container">
            <HelpTooltip>
              {" "}
              See all your trips, organized by type. Private Trips are <span className="tooltip-purple">just for
              you</span>. Group Trips are ones you’ve been <span className="tooltip-purple">invited</span> to co-plan with
              others. Shared Trips are <span className="tooltip-purple">public</span> — viewable in the Community
              section
            </HelpTooltip>
            <h3>Browse Your Trips</h3>
          </div>
          {/* All Trips Header with Sorting */}
          <div className="trips-header">
            <button
              className="start-trip-btn-all-trips"
              onClick={() => navigate("/profile/new-destination")}
            >
              Start new trip
            </button>
            <div className="sort-options">
              <label>Sort By: </label>
              <select value={sortBy} onChange={handleSortChange}>
                <option value="">Select</option>
                <option value="date">Date (Newest → Oldest)</option>
                <option value="price">Price (Lowest → Highest)</option>
              </select>
            </div>
          </div>

          <h4 className="alltrips-h4">Private Trips</h4>
          {/* cName changed from trips-container */}
          <div className={`trips-container all-trips-trips-container`}>
            {notLogged.length === 0 ? (
              <p className="no-trips-message">
                Looks like you have no trips yet. Click the button above to get
                started.
              </p>
            ) : (
              notLogged.map((trip) => (
                <div key={trip.id} className="at-trip-card">
                  {/* Post to Community Button */}
                  <button
                    className="log-button"
                    onClick={() => postToLog(trip)}
                  >
                    Share to Community
                  </button>

                  {/* View Button */}
                  <button
                    className="view-button"
                    onClick={() => {
                      const selected = {
                        name: trip.destination,
                        countryCode: "",
                        startDate: trip.start_date,
                        endDate: trip.end_date,
                        imageUrl: trip.image_url || "",
                        hotel: {
                          name: trip.hotel_name,
                          price: trip.hotel_price,
                        },
                      };
                      console.log("When clicking view, we send,");
                      console.log(selected);
                      
                      localStorage.setItem(
                        "selectedTrip",
                        JSON.stringify(selected)
                      );
                      navigate("/profile");
                    }}
                    >
                    Edit
                  </button>

                  {/* Delete Button */}
                  <DeleteTrip trip={trip} trips={trips} setTrips={setTrips} setLogged={setLogged} setNotLogged={setNotLogged}/>

                  {/* Trip Info */}
                  <div className="trip-info">
                    <h4 className="trip-destination">
                      {encode(trip.destination)}
                    </h4>
                    <p className="trip-dates">{encode(trip.dates)}</p>
                    <p className="trip-price">${trip.price}</p>
                  </div>

                  {/* Trip Image */}
                  <img
                    src={
                      trip.image_url ||
                      "/CSE442/2025-Spring/cse-442aj/backend/uploads/default_img.png"
                    }
                    alt={encode(trip.destination)}
                    className="at-trip-image"
                  />
                </div>
              ))
            )}
          </div>

          <h4 className="alltrips-h4">Group Trips</h4>
          <div className={`trips-container all-trips-trips-container`}>
            {collabTrips.length === 0 ? (
              <p className="no-trips-message">
                You’re not collaborating on any trips yet.
              </p>
            ) : (
              collabTrips.map((trip) => (
                <div key={trip.id} className="at-trip-card">
                  {/* No Share button */}
                  <button
                    className="view-button"
                    onClick={() => {
                      const selected = {
                        name: trip.destination,
                        countryCode: "",
                        startDate: trip.start_date,
                        endDate: trip.end_date,
                        imageUrl: trip.image_url || "",
                        hotel: {
                          name: trip.hotel_name,
                          price: trip.hotel_price,
                        },
                      };
                      console.log("Viewing group trip:", selected);
                      navigate("/profile", {
                        state: { tripId: trip.id, fromInvite: true},
                      });
                    }}
                  >
                    Edit as collaborator
                  </button>

                  {/* Trip Info */}
                  <div className="trip-info">
                    <h4 className="trip-destination">
                      {encode(trip.destination)}
                    </h4>
                    <p className="trip-dates">{trip.dates}</p>
                    <p className="trip-price">${trip.price}</p>
                  </div>

                  <img
                    src={
                      trip.image_url ||
                      "/CSE442/2025-Spring/cse-442aj/backend/uploads/default_img.png"
                    }
                    alt={encode(trip.destination)}
                    className="at-trip-image"
                  />
                </div>
              ))
            )}
          </div>

          <h4 className="alltrips-h4">Shared Trips</h4>
          {/* cName changed from trips-container */}
          <div className={`trips-container all-trips-trips-container`}>
            {logged.length === 0 ? (
              <p className="no-trips-message">
                Share a trip with the community by clicking the button on the
                top left of each trip card.
              </p>
            ) : (
              logged.map((trip) => (
                <div key={trip.id} className="at-trip-card">
                  {/* Remove from Travel Log Button */}
                  <button
                    className="log-button"
                    onClick={() => removeFromLog(trip)}
                  >
                    Unshare from Community
                  </button>

                  {/* View Button */}
                  <button
                    className="view-button at-view"
                    onClick={() => {
                      const selected = {
                        name: trip.destination,
                        countryCode: "", // optional
                        startDate: trip.start_date,
                        endDate: trip.end_date,
                        imageUrl: trip.image_url || "",
                      };
                      console.log("When clicking view, we send,");
                      console.log(selected);

                      localStorage.setItem(
                        "selectedTrip",
                        JSON.stringify(selected)
                      );
                      navigate("/profile");
                    }}
                  >
                    View
                  </button>

                  {/* Delete Trip */}
                  <DeleteTrip trip={trip} trips={trips} setTrips={setTrips} setLogged={setLogged} setNotLogged={setNotLogged}/>

                  {/* Trip Info */}
                  <div className="trip-info">
                    <h4 className="trip-destination">
                      {encode(trip.destination)}
                    </h4>
                    <p className="trip-dates">{trip.dates}</p>

                    <p className="trip-price">${trip.price}</p>
                  </div>

                  <button
                    className="view-more-btn at-view-more-btn"
                    onClick={() => handleViewMore(trip)}
                  >
                    View Comments & Itinerary
                  </button>

                  {/* Trip Image */}
                  <img
                    src={
                      trip.image_url ||
                      "/CSE442/2025-Spring/cse-442aj/backend/uploads/default_img.png"
                    }
                    alt={encode(trip.destination)}
                    className="at-trip-image"
                  />
                </div>
              ))
            )}
          </div>
        </div>
        <FriendsModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          user={`${user?.firstName} ${user?.lastName}`}
          location={selectedTrip?.destination}
          imageUrl={selectedTrip?.image_url}
          comment={selectedTrip?.comment}
          isFriend={true}
          tripId={selectedTrip?.id}
          userEmail={user?.email} // current user's email
          currentUserEmail={user?.email}
        />
      </div>
    </>
  );
};

export default AllTrips;
