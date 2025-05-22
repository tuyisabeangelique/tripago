import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import Paris from "../assets/paris.jpg";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import "../styles/recommended.css";
import MobileSidebarToggle from "../components/MobileSidebarToggle.jsx";
import '../styles/trip/AcceptRejectDest.css';
import { UserContext } from "../context/UserContext.jsx";
import { useLocation } from "react-router-dom";


const Favorites = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [favorites, setFavorites] = useState({});
  // const [destinations, setDestinations] = useState([]);
  const [destinationImages, setDestinationImages] = useState([]);
  const [error, setError] = useState(null);
  const [imagesFetched, setImagesFetched] = useState(false); // Flag to ensure images are fetched only once
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 480);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = UserContext;
const location = useLocation();
const destinations = location.state?.destinations || [];
  
  useEffect(() => {

    // Copied from userprofile.jsx
    const handleResize = () => {
      setIsMobile(false);
      const isNowMobile = window.innerWidth <= 480;
      console.log(
        "Window width:",
        window.innerWidth,
        "| isMobile:",
        isNowMobile
      );

      setIsMobile(isNowMobile);
      console.log("is mobile: ", isNowMobile);

    };

    handleResize(); // Run on first load
    window.addEventListener("resize", handleResize); // Watch for resizes

  }, []);

  const toggleFavorite = async (destination) => {
    const isFavorited = favorites[destination.name];
    setFavorites((prev) => ({ ...prev, [destination.name]: !isFavorited }));
  
    try {
      const url = isFavorited
        ? "/CSE442/2025-Spring/cse-442aj/backend/api/favorites/removeFavorite.php"
        : "/CSE442/2025-Spring/cse-442aj/backend/api/favorites/addFavorite.php";
  
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: destination.name,
          countryCode: destination.countryCode,
        }),
      });
  
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to update favorites");
      }
  
      console.log(`${destination.name} ${isFavorited ? "removed from" : "added to"} favorites.`);
    } catch (error) {
      console.error("Error updating favorites:", error);
      alert("An error occurred while updating favorites.");
    }
  };
  

  // Save trip selection
  const handleNewTrip = (destination) => {
    localStorage.setItem(
      "selectedTrip",
      JSON.stringify({ name: destination.name, cityCode: destination.iataCode, newTrip: true })
    );
    navigate("/profile");
  };

  const filteredDestinations = destinations.filter(destination =>
    //destination.city_name.toLowerCase().includes(searchQuery.toLowerCase())
    destination.name.toLowerCase().includes(searchQuery.toLowerCase())
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
      {console.log("send to sidebar: ", !isMobile || isSidebarOpen)}
      <Sidebar isOpen={!isMobile || isSidebarOpen} />
    <div style={{display: 'flex', width:'100%', height: '100vh', textAlign: 'left'}}>

    <div style={{paddingTop: '5rem', paddingBottom: '10rem', display: 'flex', flexWrap: 'wrap', height: '600vh', backgroundColor: '#f3f4f6', backgroundSize: 'cover', width: '100%' }}>
      
      <div class="card_positions">
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#374151", marginTop: "2rem" }}>
          Select a <span style={{ color: "#7c3aed" }}>Trip</span>
        </h2>

        <input
        className="location-search-input"
          type="text"
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            marginTop: "1rem",
            width: "50%",
            maxWidth: "1000px",
            padding: "0.5rem",
            borderRadius: "0.5rem",
            border: "1px solid #ccc",
            fontSize: "1rem",
            textAlign: "center",
          }}
        />

        <p
        className="reject-text"
        onClick={() => navigate('/profile/new-destination')}
        >
          I want something else.
        </p>

        <div style={{
          marginTop: "2rem",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "1rem",
          width: "100%",
          maxWidth: "900px",
        }}>
          {filteredDestinations.map((destination, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "white",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
                //cursor: "pointer",
                width: '100%',
                maxWidth: "500px",
                minWidth: '300px',
                transition: "border 0.3s ease-in-out"
                /*border: selectedLocation === destination.name ? "3px solid #7c3aed" : "3px solid transparent",*/
              }}
              onClick={() => setSelectedLocation(destination.name)}
            >
              <img src={destination.image_url} onError={(e) => (e.target.src = Paris)} alt={destination.name} style={{ width: "100%", height: "150px", objectFit: "cover" }} />
              <div style={{ padding: "1rem", textAlign: "center", width: "100%" }}>
                <p style={{ margin: '0px', fontWeight: "600" }}>{destination.name}</p>
                <p style={{ margin: '0px', color: "gray", fontSize: "0.875rem" }}>{destination.country_name}</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "75%", padding: "0.5rem 1rem" }}>
                <button
                  style={{
                    backgroundColor: "#10b981",
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={(e) => { e.stopPropagation(); handleNewTrip(destination); }}
                >
                  New Trip
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedLocation && (
          <p style={{ marginTop: "1rem", fontSize: "1rem", fontWeight: "500", color: "#7c3aed" }}>
            Selected: {selectedLocation}
          </p>
        )}
      </div>
    </div>
    </div>
    </>
  );
};

export default Favorites;
