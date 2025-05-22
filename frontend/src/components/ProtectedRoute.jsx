import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    axios
      .get("/CSE442/2025-Spring/cse-442aj/backend/api/cookieVerify.php") 
      .then(response => {
        if (response.data.success) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  if (isAuthenticated === null) {
    return <p>Loading...</p>; // Prevent flickering
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
