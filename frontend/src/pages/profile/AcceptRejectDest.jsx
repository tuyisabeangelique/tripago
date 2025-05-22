import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import fallbackImg from "../../assets/paris.jpg";
import "../../styles/trip/AcceptRejectDest.css";
import Sidebar from "../../components/Sidebar";
import MobileSidebarToggle from "../../components/MobileSidebarToggle";
import { encode } from "html-entities";

const AcceptRejectDest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const recommendations = location.state?.recommendations || [];
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 480);
  const [isMobile, setIsMobile] = useState(false);

  const category = location.state?.category || "default";

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    if (recommendations.length > 0 && category) {
      const storageKey = `lastIndex-${category}`;
      const lastIndexStr = localStorage.getItem(storageKey);
      const lastIndex = lastIndexStr ? parseInt(lastIndexStr, 10) : -1;

      const nextIndex = (lastIndex + 1) % recommendations.length;
      const nextCity = recommendations[nextIndex];

      console.log(`Category: ${category}`);
      console.log(`Last Index: ${lastIndex}`);
      console.log(`Next Index: ${nextIndex}`);
      console.log(`City picked: ${nextCity.name}`);

      localStorage.setItem(storageKey, nextIndex.toString());

      const cityName = nextCity.name;
      const country = nextCity.countryCode;

      setCity(cityName);
      setName(cityName);
      setCountryCode(country);
      setIsImageLoaded(false);
      setImageUrl(nextCity.image_url || fallbackImg);
      setIsImageLoaded(true);
    }
  }, [recommendations, category]);

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth <= 480;
      console.log(
        "Window width:",
        window.innerWidth,
        "| isMobile:",
        isNowMobile
      );
      setIsMobile(isNowMobile);
    };

    handleResize(); // Run on first load
    window.addEventListener("resize", handleResize); // Watch for resizes

    return () => {
      window.removeEventListener("resize", handleResize);
    };
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
      <div className="accept-reject-container">
        <h2>
          How does a trip to{" "}
          <span className="destination-name">{encode(city)}</span> sound?
        </h2>

        {isImageLoaded ? (
          <img
            src={imageUrl || fallbackImg}
            alt={encode(name)}
            className="destination-image"
          />
        ) : (
          <div className="loading-spinner" style={{ margin: "20px auto" }}>
            Loading image...
          </div>
        )}

        <button
          className="accept-button"
          onClick={() => {
            localStorage.setItem(
              "selectedTrip",
              JSON.stringify({ name: city, countryCode, newTrip: true })
            );
            navigate("/profile");
          }}
        >
          Sounds great!
        </button>

        <p
          className="reject-text"
          onClick={() => navigate("/profile/new-destination")}
        >
          I want something else.
        </p>
      </div>
    </>
  );
};

export default AcceptRejectDest;
