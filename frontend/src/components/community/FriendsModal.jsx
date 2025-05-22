import React, { useEffect, useState } from "react";
import "../../styles/community/FriendsModal.css";
import axios from "axios";
import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import DeleteComment from "./DeleteComment.jsx";

const FriendsModal = ({
  isOpen,
  onClose,
  user,
  location,
  imageUrl,
  comment,
  isFriend,
  tripId,
  userEmail,
  currentUserEmail,
}) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [itinerary, setItinerary] = useState([]);
  const [memories, setMemories] = useState([]);

  console.log("Is friend?: ", isFriend);

  // Load comments and itinerary
  useEffect(() => {
    if (isOpen && isFriend && tripId && userEmail) {
      axios
        .post(
          "/CSE442/2025-Spring/cse-442aj/backend/api/community/getComments.php",
          {
            tripId: tripId,
          }
        )
        .then((res) => {
          console.log("After getComments.php, result is: ", res.data);
          setComments(res.data.comments);
        })
        .catch((err) => console.error("Error loading comments:", err));

      console.log(
        "Getting community activities and tripid, useremail are: ",
        tripId,
        userEmail
      );
      axios
        .post(
          "/CSE442/2025-Spring/cse-442aj/backend/api/community/getCommunityActivities.php",
          {
            tripId: tripId,
            email: userEmail,
          }
        )
        .then((res) => {
          console.log("getCommunityActivities.php returned:", res.data);
          if (res.data.success && Array.isArray(res.data.activities)) {
            setItinerary(res.data.activities);
          } else {
            setItinerary([]);
          }
        })
        .catch((err) => console.error("Error loading itinerary:", err));
    }

    const fetchMemories = async () => {

      try {
        const response = await axios.post("/CSE442/2025-Spring/cse-442aj/backend/api/trips/getMemories.php", {id: tripId}, {
          headers: { "Content-Type": "application/json" },
        });
        const result = response.data;
        console.log("getMemories form response: ", result);

        const mem = []
        for (const memory of result.memories) {
          memory["images"] = []
          for (const image of result.images) {
            if (image.memory_id === memory.id) {
              memory["images"].push(image.image_url)
            }
          }
          mem.push(memory);
        }
        setMemories(mem);

      } catch(err) {
          console.log("Error fetching memories: ", err);
      }
    };

    fetchMemories();

  }, [isOpen, isFriend, tripId, userEmail]);

  // Submit a new comment
  const handleAddComment = async () => {
    if (newComment.trim() === "") return;
  
    try {
      await axios.post(
        "/CSE442/2025-Spring/cse-442aj/backend/api/community/addComment.php",
        {
          tripId: tripId,
          commenter: currentUserEmail,
          text: newComment,
        }
      );
  
      // Re-fetch updated comments after successful post
      const res = await axios.post(
        "/CSE442/2025-Spring/cse-442aj/backend/api/community/getComments.php",
        { tripId: tripId }
      );
  
      if (res.data.success) {
        setComments(res.data.comments);
      } else {
        console.warn("Could not refresh comments.");
      }
  
      setNewComment("");
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };
  

  const handleSendRequest = async () => {
    try {
      const response = await fetch(
        "/CSE442/2025-Spring/cse-442aj/backend/api/sendFriendRequest.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ searchTerm: userEmail }), // friend email
        }
      );

      const result = await response.json();
      console.log("After sendFriendRequest: ", result);
      if (result.success) {
        alert("Friend request sent!");
      } else {
        alert(result.message || "Request failed.");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("Something went wrong.");
    }
  };

  if (!isOpen) return null;

  // Style for image slideshow
  const divStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundSize: "cover",
    height: "400px",
  };

  // Properties of image slideshow
  const properties = {
    transitionDuration: 200,
    prevArrow: <a className="prev">◀</a>,
    nextArrow: <a className="next">▶</a>,
    autoplay: false,
    canSwipe: true,
    cssClass: "slide-container",
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <h2>
          <span className="bold">{user}'s</span> trip to{" "}
          <span className="highlight">{location}</span>.
        </h2>
        {comment && <p className="trip-comment">"{comment}"</p>}

        <div className="modal-image-container">
          <img src={imageUrl} alt={location} className="modal-image" />
          <p className="trip-location">Downtown {location}</p>
        </div>

        {!isFriend ? (
          <div className="friends-restriction">
            <p>You must be friends to view the itinerary and comments.</p>
            <button className="send-request-btn" onClick={handleSendRequest}>
              Send Friend Request
            </button>
          </div>
        ) : (
          <>
            <div className="itinerary-section">
              <h3>Itinerary</h3>
              <ul>
                {itinerary.map((item, i) => (
                  <li key={i}>
                    <span className="itinerary-day">Day {item.day + 1}:</span>
                    <span className="itinerary-name">{item.name}</span>
                    <span className="itinerary-price"> (${item.price})</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="memories-section">
              <h3>Memories</h3>
                {memories.length === 0 ? (
                  <p className="no-memories-message">
                    Looks like this trip has no memories.
                  </p>
                ) : (
                  memories.map((memory) => (
                    <div key={memory.id} className="memory-card">
                      <div className={"slide-container"}>
                        <Slide {...properties} arrows={memory.images.length > 1}>
                          {memory.images.map((slideImage, index) => (
                            <div key={index}>
                              <div
                                className={"memory-image"}
                                style={{
                                  ...divStyle,
                                  backgroundImage: `url(${slideImage})`,
                                }}
                              />
                            </div>
                          ))}
                        </Slide>
                      </div>

                      <p>{memory.caption}</p>
                    </div>
                  ))
                )}
            </div>

            <div className="comments-section">
              <h3>Comments</h3>
              <div className="comments-list">
                {comments.map((c, i) => (
                  <div key={i} className="comment">
                    <div>
                      <span className="comment-user">{c.first_name} {c.last_name}:</span>{" "}
                      {c.comment_text}
                    </div>
                    {currentUserEmail === c.commenter_email &&
                      <DeleteComment comment={c} tripId={tripId} setComments={setComments} />
                    }
                  </div>
                ))}
              </div>

              <div className="add-comment">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="comment-input"
                />
                <button className="comment-btn" onClick={handleAddComment}>
                  Post
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FriendsModal;
