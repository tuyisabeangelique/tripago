import React from "react";
import bedIcon from "../../assets/bed.png";
import personIcon from "../../assets/profile.png";
import childIcon from "../../assets/child.png";
import "../../styles/hotels/TravelersModal.css"; 

const TravelersModal = ({ isOpen, setIsOpen, rooms, setRooms, adults, setAdults }) => {
  if (!isOpen) return null;

  const increase = (setter, value) => setter(value + 1);
  const decrease = (setter, value) => setter(value > 0 ? value - 1 : 0);

  return (
    <div className="modal-overlay" onClick={() => setIsOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Rooms and guests</h3>

        {/* Rooms */}
        <div className="modal-row">
          <div className="modal-label">
            <img src={bedIcon} alt="Rooms" className="modal-icon" />
            <span>Rooms</span>
          </div>
          <div className="modal-counter">
            <button className="modal-btn" onClick={() => decrease(setRooms, rooms)}>-</button>
            <span className="modal-count">{rooms}</span>
            <button className="modal-btn" onClick={() => increase(setRooms, rooms)}>+</button>
          </div>
        </div>

        {/* Adults */}
        <div className="modal-row">
          <div className="modal-label">
            <img src={personIcon} alt="Adults" className="modal-icon" />
            <span>Adults</span>
          </div>
          <div className="modal-counter">
            <button className="modal-btn" onClick={() => decrease(setAdults, adults)}>-</button>
            <span className="modal-count">{adults}</span>
            <button className="modal-btn" onClick={() => increase(setAdults, adults)}>+</button>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="modal-footer">
          <div className="modal-footer">
  <button className="reset-btn" onClick={() => { setRooms(1); setAdults(2); }}>Reset</button>
  <button className="save-btn" onClick={() => setIsOpen(false)}>Save</button>
</div>
        </div>
      </div>
    </div>
  );
};

export default TravelersModal;

