import React from "react";
import "../styles/Navbar.css";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/Tripago_VX.png";
import backArrow from "../assets/arrow-left.png";
import fav from "../assets/favicon.png";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { UserContext } from "../context/UserContext.jsx";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isBrowseHotelsPage = location.pathname === "/browse-hotels";
  const isProfilePage = location.pathname === "/profile";

  const tripId = searchParams.get("tripId");
  const fromInvite = searchParams.get("fromInvite");

  const { user, setUser } = useContext(UserContext);

  return (
    <nav className="navbar">
      {isBrowseHotelsPage ? (
        <div className="browse-hotels-nav">
          <img
            src={backArrow}
            alt="Back"
            className="back-arrow"
            onClick={() =>
              navigate("/profile", {
                state: {
                  tripId,
                  fromInvite,
                },
              })
            } // Navigate to profile
            style={{ cursor: "pointer" }}
          />
          <img src={fav} alt="Tripago Favicon" className="tripago-fav" />
          <h1 className="hotels-header">Search for Hotels</h1>
        </div>
      ) : (
        <div className={`logo ${isProfilePage ? "center-logo-profile" : ""}`}>
          <button
            className="logo-btn"
            onClick={() => {
              if (user) {
                navigate("/user-profile");
              } else {
                navigate("/");
              }
            }}
          >
            <img src={logo} alt="Tripago Logo" />
          </button>
        </div>
      )}

      {location.pathname === "/" ||
      location.pathname === "/login" ||
      location.pathname === "/signup" ||
      location.pathname.startsWith("/new-password") ||
      location.pathname === "/forgot-password" ? (
        <ul className="nav-links">
          <li>
            <button className="navbar-links" onClick={() => navigate("/login")}>
              Login
            </button>
          </li>
          <li>
            <button
              className="navbar-links"
              onClick={() => navigate("/signup")}
            >
              Signup
            </button>
          </li>
        </ul>
      ) : (
        <ul className="nav-links">
          <li>
            <button
              className="navbar-links"
              onClick={async () => {
                try {
                  const response = await axios.post(
                    "/CSE442/2025-Spring/cse-442aj/backend/security/logout.php",
                    {},
                    {
                      withCredentials: true,
                      headers: {
                        "Content-Type": "application/json",
                      },
                    }
                  );

                  const result = response.data;
                  console.log("Logout result:", result);
                  if (result.success) {
                    setUser(null); // clears user context
                    navigate("/login");
                  } else {
                    alert("Logout failed.");
                  }
                } catch (error) {
                  console.error("Logout error:", error);
                }
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
