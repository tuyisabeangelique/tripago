import React from "react";
import "../styles/Sidebar.css";
import { FaBars, FaTimes } from "react-icons/fa";

const MobileSidebarToggle = ({ isOpen, toggleSidebar }) => {
  return (
    <button className="sidebar-hamburger-btn" onClick={toggleSidebar}>
      {isOpen ? <FaTimes className="hamburger-icon-times" /> : <FaBars className="hamburger-icon-bars"/>}
    </button>
  );
};

export default MobileSidebarToggle;
