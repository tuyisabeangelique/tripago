import PropTypes from "prop-types";
import { FaEdit } from "react-icons/fa";
import airplaneIllustration from "../../assets/airplane.svg";
import "../../styles/trip/TripHeader.css";
import TripCollaborators from "./TripCollaborators";

const TripHeader = ({
  firstName,
  lastName,
  picture = airplaneIllustration,
  tripID, 
  isInvitee
}) => {
  const isCustomPicture = picture !== airplaneIllustration;
  console.log("In header, tripID is: ", tripID)

  return (
    <div className="header-content">
      <div className="header-illustration">
        <img
          src={picture}
          alt="Profile Illustration"
          className={`header-image ${isCustomPicture && "custom-picture"}`}
        />
      </div>
      <div className="collab-button-wrapper">
          <TripCollaborators  tripId={tripID} firstName={firstName} lastName={lastName} isInvitee={isInvitee}/>
        </div>
    </div>
  );
};

TripHeader.propTypes = {
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  picture: PropTypes.string,
};

export default TripHeader;
