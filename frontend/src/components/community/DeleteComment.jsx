import React, { useState } from "react";
import axios from "axios";
import { FaRegTrashAlt } from "react-icons/fa";

const DeleteComment = ({comment, tripId, setComments}) => {
  
  const handleDeleteComment = async (comment) => {

    try {
      const response = await axios.post(
        "/CSE442/2025-Spring/cse-442aj/backend/api/community/deleteComment.php",
        comment,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = response.data;
      console.log("deleteComment Form Response: ", result);

      // Re-fetch updated comments after successful deletion
      const res = await axios.post(
        "/CSE442/2025-Spring/cse-442aj/backend/api/community/getComments.php",
        { tripId: tripId }
      );
  
      if (res.data.success) {
        setComments(res.data.comments);
      } else {
        console.warn("Could not refresh comments.");
      }
    } catch (err) {
      console.log("Error deleting comment: ", err);
    }

    setVisible(!visible)

  };
  
  const [visible, setVisible] = useState(false);

  return (
    <div className="delete-comment-wrapper">
      {visible &&
        <div className="delete-comment-box">
          Are you sure you want to delete this comment?
          <button className="confirm-delete" onClick={() => handleDeleteComment(comment)}>Delete</button>
          <button className="cancel-delete" onClick={() => setVisible(!visible)}>Cancel</button>
        </div>
      }
      <button className="delete-comment-button" onClick={() => setVisible(!visible)}>
        <FaRegTrashAlt/>
      </button>
    </div>
  );
};


export default DeleteComment;
