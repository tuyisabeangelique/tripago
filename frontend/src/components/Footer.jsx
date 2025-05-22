import React from 'react'
import { useLocation } from "react-router-dom"; 

const Footer = () => {
  const location = useLocation();

  const footerPages = new Set([
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/new-password",
    // "/style-guide",
  ]);

  let render = footerPages.has(location.pathname);

  if (location.pathname.startsWith("/new-password")) {
    render = true;
  }

  if (render) {
    console.log("Footer will appear on page: " + location.pathname);
    return (
      <footer className="footer">
        <p>© Copyright 2025 Tripago. All rights reserved.</p>
      </footer>
    );
  } else {
    console.log("Footer will not appear on page: " + location.pathname);
    return null; // Do not render the footer
  }

};

export default Footer;
