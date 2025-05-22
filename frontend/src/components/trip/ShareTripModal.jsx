import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { FaImage, FaQuoteLeft, FaTrash } from "react-icons/fa";
import "../../styles/trip/ShareTripModal.css";
import { UserContext } from "../../context/UserContext.jsx";
import axios from 'axios';
import imageCompression from 'browser-image-compression';

const ShareTripModal = ({ onClose, trip }) => {
  const [quote, setQuote] = useState("");
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [isShared, setIsShared] = useState(false);
  const modalRef = useRef(null);
  const { user } = UserContext;

  /* Email trip */

    const [shareData, setShareData] = useState({ email: '' });
    const [emailList, setEmailList] = useState([]);

    const handleChange = (e) => {
      setShareData({ ...shareData, [e.target.name]: e.target.value });
    };

    const HandleAddingEmails = (e) => {
      // Prevent adding empty or duplicate email
      if (
        shareData.email &&
        !emailList.includes(shareData.email)
      ) {
        const updatedList = [...emailList, shareData.email];
        setEmailList(updatedList);
        setShareData({ email: '' });
    }
  }
  
    const handleEmailSubmit = async (e) => {
      e.preventDefault();

      const tripName = JSON.parse(localStorage.getItem("selectedTrip"))?.name;
      const tripImage = JSON.parse(localStorage.getItem("selectedTrip"))?.imageUrl;
      const userName = user?.name;
      console.log("User sending message: " + tripImage);
      // Convert images to base64 (if they're File objects)
      const base64Images = await Promise.all(images.map(async (file) => {
        const reader = new FileReader();
        return new Promise((resolve) => {
          reader.onloadend = () => {
            resolve({
              filename: file.name,
              data: reader.result.split(",")[1], // strip base64 prefix
              type: file.type
            });
          };
          reader.readAsDataURL(file);
        });
      }));


        // Send emails to everyone in the updated list
        for (const email of emailList) {
          try {
           // const response = await fetch('http://localhost/tripago/send_trip.php', {
            const response = await fetch("/CSE442/2025-Spring/cse-442aj/backend/api/send_trip.php", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: email,
                quote: quote,
                trip: tripName,
                userName: userName,
                tripImage: tripImage,
                photos: base64Images
              })
            });
  
            const result = await response.json();
            console.log(`Sent to ${email}:`, result);
          } catch (error) {
            console.error(`Failed to send to ${email}:`, error);
          }
        }
    };
  
    const removeEmail = (index) => {
      const updatedList = [...emailList];
      updatedList.splice(index, 1);
      setEmailList(updatedList);
    };


/*
  const handleChange = (e) => {
    setShareData({ ...shareData, [e.target.name]: e.target.value });
  }; */

  /*
  const [shareData, setShareData] = useState({
    email: "",
    quote: "",
    trip: "",
    userName: ""
  });

  
  const handleEmailSubmit = async () => {
    try {
      const response = await fetch('http://localhost/tripago/send_trip.php', {
      //const response = await fetch('/CSE442/2025-Spring/cse-442aj/backend/api/send_trip.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: shareData.email,
          quote: quote,
          trip: JSON.parse(localStorage.getItem("selectedTrip"))?.name,
          userName: "Jane"
        })
      });
      
      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error('Error:', error);
    }
  }; */

  /*---------------------------------*/

  const handleQuoteChange = (e) => {
    setQuote(e.target.value);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    const options  = {
      maxSizeMB: 2,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    // Compress the images
    const compressedImages = [];
    for (const file of files) {
      const compressedImage = await imageCompression(file, options);
      compressedImages.push(compressedImage)
    }
    
    // Create preview URLs for the images
    const newPreviewImages = compressedImages.map((file) => URL.createObjectURL(file))
    setPreviewImages([...previewImages, ...newPreviewImages]);

    // Store the actual files
    setImages([...images, ...compressedImages]);
  };

  const removeImage = (index) => {
    const updatedPreviewImages = [...previewImages];
    const updatedImages = [...images];

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previewImages[index]);

    updatedPreviewImages.splice(index, 1);
    updatedImages.splice(index, 1);

    setPreviewImages(updatedPreviewImages);
    setImages(updatedImages);
  };

  const handleShare = async () => {

    const formData = new FormData();
    
    formData.set("tripId", trip.id);
    formData.set("caption", quote);
    for (const img of images) {
      formData.append("images[]", img);
    }

    try {

      const response = await axios.post(
        // CHANGE TO BACKEND
        "/CSE442/2025-Spring/cse-442aj/backend/api/trips/saveMemory.php",
        formData,
        {headers:
          {"Content-Type": "multipart/form-data"},
        },
      );

      const data = await response.data;
      console.log("Data recieved after saving memory: ", data);

      if (data.success) {
        console.log("saveMemory form response: ", data.message);
      } else {
        console.error("Saving memory failed: ", data.message);
      }

    } catch(err) {
      console.error("Error saving memory: ", err);
    }

    onClose();
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="modal-overlay">
      <div className="share-modal" ref={modalRef}>
        <div className="modal-header">
          <h3>
            Share a <span className="modal-highlight">Memory</span>
          </h3>
        </div>

        <div className="share-content">
          <div className="quote-section">
            <label htmlFor="trip-quote">
              <FaQuoteLeft /> Caption
            </label>
            <textarea
              id="trip-quote"
              className="quote-input"
              placeholder="Share a memorable moment from your trip..."
              value={quote}
              onChange={handleQuoteChange}
              rows={4}
            />
          </div>

          <div className="image-upload-section">
            <div className="image-header">
              <label htmlFor="trip-images">
                <FaImage /> Trip Photos{" "}
                {images.length > 0 && `(${images.length})`}
              </label>
              <div className="upload-container">
                <input
                  type="file"
                  id="trip-images"
                  className="file-input"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
                <label htmlFor="trip-images" className="upload-button">
                  + Add Photos
                </label>
              </div>
            </div>

            {images.length < 1 && (
              <span className="upload-info">No images selected</span>
            )}

            {previewImages.length > 0 && (
              <div className="image-previews">
                {previewImages.map((src, index) => (
                  <div key={index} className="image-preview-container">
                    <img
                      src={src}
                      alt={`Preview ${index + 1}`}
                      className="image-preview"
                    />
                    <div className="image-preview-overlay">
                      <button
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                        aria-label="Remove image"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Email trip */}
            <br/>
            <p style={{ width: '100%', margin: '0', padding: '0' }}>
              Want to share with someone who isn't on Tripago? We'll email a postcard!
            </p>

            <div style={{ width: '100%', display: 'block' }}>
              <input
                className="email-input"
                type="email"
                name="email"
                placeholder="Email address"
                value={shareData.email}
                onChange={handleChange}
                required
              />
              <button onClick={HandleAddingEmails}>Add</button>

              <ul style={{ listStyle: 'none', padding: '0', marginTop: '10px' }}>
                {emailList.map((email, index) => (
                  <li
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginTop: '5px',
                      color: 'black'
                    }}
                  >
                    <span>{email}</span>
                    <button
                      onClick={() => removeEmail(index)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: 'red',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* ------------------ */}
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-button" onClick={(e) => { handleShare(e); handleEmailSubmit(e); }}>
            Post Trip Memory
          </button>
        </div>
      </div>
    </div>
  );
};

ShareTripModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  trip: PropTypes.object.isRequired,
};

export default ShareTripModal;
