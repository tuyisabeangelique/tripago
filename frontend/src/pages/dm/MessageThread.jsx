import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../../styles/dm/MessageThread.css";
import Van from "../../assets/Van.png";
import { UserContext } from "../../context/UserContext.jsx";

const MessageThread = () => {
  const { name } = useParams();
  const { user } = UserContext;
  const decodedName = decodeURIComponent(name);
  const navigate = useNavigate();
  const location = useLocation();
  const avatar = location.state?.image;
  const email = location.state?.email;
  const senderEmail = user?.email;
  
  const [messages, setMessages] = React.useState([]);
  const [newMessage, setNewMessage] = React.useState("");

  const [showDummyMessages, setShowDummyMessages] = React.useState(true);


  React.useEffect(() => {
    //fetch(`/CSE442/2025-Spring/cse-442aj/backend/api/dm/getMessages.php?sender=${senderEmail}&receiver=${email}`)
    let intervalId;

    const fetchMessages = () => {
    fetch(`/CSE442/2025-Spring/cse-442aj/backend/api/dm/getMessages.php?receiver=${email}`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error("Failed to fetch messages", err));
    }
    fetchMessages();

    intervalId = setInterval(fetchMessages, 3000);
    return () => clearInterval(intervalId);
  }, [email]);

  const sendMessage = () => {
    const msg = {
      //sender: email,
      receiver: email,
      message: newMessage
    };

    
  
    fetch("/CSE442/2025-Spring/cse-442aj/backend/api/dm/sendMessages.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg),
    })
      .then((res) => res.json())
      .then(() => {
        const newMsg = {
          ...msg,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, newMsg]);
        setNewMessage("");
      })
      .catch((err) => console.error("Failed to send message", err));
  };

  return (
    <div className="message-thread-container">
      <div className="message-thread-header">
        <button className="dm-back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <img src={avatar} alt={name} className="thread-avatar" />
        <h2
          className="thread-name"
          onClick={() =>
            navigate(`/traveler-profile/${encodeURIComponent(email)}`)
          }
        >
          {decodedName}
        </h2>
      </div>

      <div className="message-bubble-list">
        {messages.length === 0 ? (
          <div className="thread-empty-state">
            <img
              src={Van}
              alt="Van illustration"
              className="thread-empty-image"
            />
            <p className="thread-empty-title">No messages yet</p>
            <p className="thread-empty-sub">
              Start the conversation with {decodedName.split(" ")[0]}
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`message-bubble ${
                msg.sender === email ? "from-them" : "from-me"
              }`}
            >
              <div className="bubble-text">{msg.message}</div>
              <div className="bubble-time">{msg.timestamp}</div>
            </div>
          ))
        )}
      </div>

      <div className="message-input-container ">
        <input 
          className="message-input" 
          placeholder="Type a message..." 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}/>
        <button className="collab-add-btn" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default MessageThread;
