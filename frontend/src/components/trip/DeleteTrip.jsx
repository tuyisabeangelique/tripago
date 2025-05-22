import React, { useState } from "react";
import axios from "axios";
import { FaRegTrashAlt } from "react-icons/fa";

const DeleteTrip = ({trip, trips, setTrips, setLogged, setNotLogged}) => {
  
  const handleDeleteTrip = async (trip) => {

    try {
      const response = await axios.post(
        "/CSE442/2025-Spring/cse-442aj/backend/api/trips/deleteTrip.php",
        trip,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = response.data;
      console.log("deleteTrip Form Response: ", result);

      const newTrips = trips.filter((t) =>
        t.id !== trip.id
      );
      setTrips(newTrips);
      setLogged(newTrips.filter((t) => t.logged));
      setNotLogged(newTrips.filter((t) => !t.logged));

    } catch (err) {
      console.log("Error deleting trip: ", err);
    }
    
    setVisible(!visible)

  };
  
  const [visible, setVisible] = useState(false);

  return (
    <div className="delete-trip-wrapper">
      {visible &&
        <div className="delete-trip-box">
          Are you sure you want to delete this trip? This action cannot be undone.
          <button className="confirm-delete" onClick={() => handleDeleteTrip(trip)}>Delete</button>
          <button className="cancel-delete" onClick={() => setVisible(!visible)}>Cancel</button>
        </div>
      }
      <button className="delete-trip-button" onClick={() => setVisible(!visible)}>
        <FaRegTrashAlt/>
      </button>
    </div>
  );
};


export default DeleteTrip;
