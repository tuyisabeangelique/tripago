import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Sidebar.css";
import {
  FaUser,
  FaPlaneDeparture,
  FaPlus,
  FaUsers,
  FaCog,
  FaEnvelope,
} from "react-icons/fa";
import { useContext } from "react";
import { UserContext } from "../context/UserContext.jsx";
import { encode } from "html-entities";

const Sidebar = ({ isOpen = true }) => {
  const { user } = useContext(UserContext);
  if (!user) return null;

  console.log("Sidebar is rendered,");

  const username = user?.username || "";
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const isProfilePage = location.pathname === "/profile";

  return (
    <div
      className={`sidebar ${isOpen ? "open" : ""} ${
        isProfilePage ? "sidebar-profile" : ""
      } `}
    >
      <div className="sidebar-header">
        <p>
          Hello, <span className="username">{encode(username)}</span>.
        </p>
      </div>

      <div className="sidebar-menu">
        <button
          className={`sidebar-item ${
            currentPath === "/user-profile" && "sidebar-item-active"
          }`}
          onClick={() => navigate("/user-profile")}
        >
          <FaUser className="sidebar-icon" />
          <span>Profile</span>
        </button>

        <button
          className={`sidebar-item ${
            currentPath === "/all-trips" && "sidebar-item-active"
          }`}
          onClick={() => navigate("/all-trips")}
        >
          <FaPlaneDeparture className="sidebar-icon" />
          <span>All trips</span>
        </button>

        <button
          className={`sidebar-item ${
            currentPath === "/profile/new-destination" && "sidebar-item-active"
          }`}
          onClick={() =>
            navigate("/profile/new-destination", {
              state: { fromLogin: false },
            })
          }
        >
          <FaPlus className="sidebar-icon" />
          <span>New trip</span>
        </button>

        <button
          className={`sidebar-item ${
            currentPath === "/community" && "sidebar-item-active"
          }`}
          onClick={() => navigate("/community")}
        >
          <FaUsers className="sidebar-icon" />
          <span>Community</span>
        </button>

        <button
          className={`sidebar-item ${
            currentPath === "/messages" && "sidebar-item-active"
          }`}
          onClick={() => navigate("/messages")}
        >
          <FaEnvelope className="sidebar-icon" />
          <span>Messages</span>
        </button>

        <button
          className={`sidebar-item ${
            currentPath.startsWith("/settings") && "sidebar-item-active"
          }`}
          onClick={() => navigate("/settings")}
        >
          <FaCog className="sidebar-icon" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
