import { useState } from "react";
import { FaShare } from "react-icons/fa";
import ShareTripModal from "./ShareTripModal";
import "../../styles/trip/ShareTripButton.css";

const ShareTripButton = ({ trip, showShareModal, setShowShareModal }) => {

  return (
    <>
      <button
        className="fixed-share-btn"
        onClick={() => setShowShareModal(true)}
        aria-label="Share Trip"
      >
        Share a Memory&nbsp;<FaShare />
      </button>

      {showShareModal && (
        <ShareTripModal onClose={() => setShowShareModal(false)} trip={trip} />
      )}
    </>
  );
};

export default ShareTripButton;
