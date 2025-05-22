import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/hotels/HotelCard.css";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import PropTypes from 'prop-types';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

const HotelCard = ({ hotel, tripId, fromInvite }) => {
  const navigate = useNavigate();
  const position = [hotel.geoCode.latitude, hotel.geoCode.longitude]

  const handleSelectDeal = async () => {
    console.log("Updating trip hotel and  tripId, city_name, hotel_name, hotel_price:" , tripId, hotel.location.split(',')[0].trim(), hotel.name, hotel.bestPrice)
    try {
      const response = await fetch('/CSE442/2025-Spring/cse-442aj/backend/api/trips/updateTripHotel.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trip_id: tripId,   
          city_name: hotel.location.split(',')[0].trim(),
          hotel_name: hotel.name,
          hotel_price: hotel.bestPrice
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update localStorage
        const storedTrip = localStorage.getItem('selectedTrip');
        if (storedTrip) {
          const tripData = JSON.parse(storedTrip);
          tripData.hotel = {
            name: hotel.name,
            price: hotel.bestPrice
          };
          localStorage.setItem('selectedTrip', JSON.stringify(tripData));
        }
        
        // Navigate back and trigger a reload
        navigate("/profile", {
          state: {
            tripId,
            fromInvite,
          },
        });
      } else {
        console.error('Failed to book hotel:', data.message);
      }
    } catch (error) {
      console.error('Error booking hotel:', error);
    }
  };

  return (
    <div className="hotel-card">
      {/* Hotel Map */}
      <div className="hotel-map">
        <MapContainer 
          center={position} 
          zoom={15} 
          style={{ height: "150px", width: "150px", borderRadius: "8px" }}
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={position} />
        </MapContainer>
      </div>

      {/* Hotel Info */}
      <div className="hotel-info">
        <h3 className="hotel-name">{hotel.name}</h3>
        <p className="hotel-location">{hotel.distance} miles from {hotel.location}</p>

        {/* Star Rating */}
        <div className="star-rating">
          {"★".repeat(hotel.rating)}{"☆".repeat(5 - hotel.rating)}
        </div>
      </div>

      {/* Price + CTA */}
      <div className="hotel-cta">
        <p className="best-price">${hotel.bestPrice}</p>
        {hotel.freeBreakfast && <p className="free-breakfast">Free breakfast</p>}
        <button className="modal-button" onClick={handleSelectDeal}>Select Deal</button>
      </div>
    </div>
  );
};

export default HotelCard;