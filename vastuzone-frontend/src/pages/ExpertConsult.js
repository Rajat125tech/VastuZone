import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/expertConsult.css";

const API_URL = process.env.REACT_APP_API_URL || "https://vastuzone-backend.onrender.com";

function ExpertConsult() {
  const { userId } = useParams();

  const [chat, setChat] = useState(null);
  const [userName, setUserName] = useState("Loading...");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const chatRes = await fetch(
          `${API_URL}/api/chat/${userId}`
        );
        const chatData = await chatRes.json();
        setChat(chatData);
        const userRes = await fetch(
          `${API_URL}/api/users/me/${userId}`
        );
        const userData = await userRes.json();
        setUserName(userData.name || "Unknown User");
      } catch (err) {
        console.error("❌ Failed to load consultation", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    await fetch(`${API_URL}/api/chat/${userId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: "expert",
        text: message,
      }),
    });

    setMessage("");

    const res = await fetch(`${API_URL}/api/chat/${userId}`);
    const data = await res.json();
    setChat(data);
  };

  if (loading) return <p>Loading consultation...</p>;

  return (
    <div>
      <Navbar />

      <div className="expert-consult-container">
        <div className="expert-consult-header">
          <h2>User Consultation</h2>
          <p>
            <strong>User:</strong> {userName}
          </p>
        </div>

        <div className="expert-chat-box">
          <div className="chat-messages">
            {chat.messages.length === 0 && (
              <p className="empty-chat">No messages yet.</p>
            )}

            {chat.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-bubble ${
                  msg.sender === "expert" ? "expert" : "user"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-input">
            <textarea
              rows="3"
              placeholder="Reply to user..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpertConsult;
