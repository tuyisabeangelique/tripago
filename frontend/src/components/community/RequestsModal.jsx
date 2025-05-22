import React, {useState,useEffect} from "react";
import "../../styles/community/RequestsModal.css";
import axios from 'axios'
import { encode } from "html-entities";
import { useNavigate } from "react-router-dom"; 

const RequestsModal = ({ isOpen, onClose, type, incomingRequests,setIncomingRequests, sentRequests }) => {
  const [successMessage, setSuccessMessage] = useState(""); // State for the success message

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 2000); // Adjust the duration as needed

      return () => clearTimeout(timer);
    }
  }, [successMessage]);


  const navigate = useNavigate(); 
  if (!isOpen) return null;

  const approveRequest = async(name) => {

    //name should have name of person, first and last

    const namesArray = name.split(" ");
    const first_name = namesArray[0];
    const last_name = namesArray[1];

    //associative array to send to backend with first and last name
    const formData = {first_name:first_name,last_name:last_name};

    try {
      //send request to approve request with first and last name
      const response = await axios.post("/CSE442/2025-Spring/cse-442aj/backend/api/approveFrndReqst.php",formData,{
        headers:{
          'Content-Type':'application/json'
        }
      })

      const result = response.data;

      if (result.success){
        //if we get here, it means that the users friend has been set successfully
        //delete the entry, and alert that the friend has been added

        //remove entry when success!
        setIncomingRequests(prevRequests => prevRequests.filter(req => req.name !== name));
        setSuccessMessage("You are now the friend of " + first_name);
      } else {
        setSuccessMessage("An error has occurred accepting the request");
      }
      
    } catch (error){

      if (error.response) {
        console.error("Server responded with:", error.response.data);
        console.error("Status code:", error.response.status);
        console.error("Headers:", error.response.headers);
     } else if (error.request) {
       console.error("No response received. Request:", error.request);
     } else {  
       console.error("Error setting up the request:", error.message);
     }
       console.error("Original error:", error); // Log the full error for debugging.
    }

  }


  const deleteRequest = async(name) => {

    //name should have name of person, first and last

    const namesArray = name.split(" ");
    const first_name = namesArray[0];
    const last_name = namesArray[1];

    //associative array to send to backend with first and last name
    const formData = {first_name:first_name,last_name:last_name};

    try {
      //send request to approve request with first and last name
      const response = await axios.post("/CSE442/2025-Spring/cse-442aj/backend/api/deleteFrndReqst.php",formData,{
        headers:{
          'Content-Type':'application/json'
        }
      })

      const result = response.data;

      if (result.success){
        //if we get here, it means that the users friend has been set successfully
        //delete the entry, and alert that the friend has been added

        //remove entry when success!
        setIncomingRequests(prevRequests => prevRequests.filter(req => req.name !== name));
        setSuccessMessage("The request was successfully deleted");
      } else {
        setSuccessMessage("There was an error removing the request");
      }
      
    } catch (error){

      if (error.response) {
        console.error("Server responded with:", error.response.data);
        console.error("Status code:", error.response.status);
        console.error("Headers:", error.response.headers);
     } else if (error.request) {
       console.error("No response received. Request:", error.request);
     } else {  
       console.error("Error setting up the request:", error.message);
     }
       console.error("Original error:", error); // Log the full error for debugging.
    }

  }

  /*

  */

  return (
    <div className="request-modal-overlay modal-overlay">
      <div className="request-modal-content modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{type === "incoming" ? "Incoming Requests" : "Friends"}</h2>
        {successMessage && (
          <div className="modal-overlay">
            <div className="modal-content send-req-modal-content"> 
              {successMessage}
            </div>
          </div>
        )}
        {type === "incoming" ? (
          <ul className="requests-list">
            {incomingRequests.map((req) => (
              <li key={req.id}>
                {encode(req.name)}
                <div>
                  <button className="approve-btn"onClick={() => approveRequest(req.name)}>Approve</button>
                  <button className="reset-btn" onClick={() => deleteRequest(req.name)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="requests-list">
            {sentRequests.map((req) => (
              <li key={req.id}>
                <span
                  className="clickable-name"
                  onClick={() => navigate(`/traveler-profile/${encodeURIComponent(req.email)}`)}
                >
                  {encode(req.name)}
                </span>
                <span className={`status ${req.status.toLowerCase()}`}>{req.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RequestsModal;
