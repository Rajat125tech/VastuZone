import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import "../styles/chat.css";

function Consult() {
  const user = auth.currentUser;
  const userId = user?.uid;

  const bottomRef = useRef(null);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchChat = async () => {
      try {
        const res = await fetch(
          `https://vastuzone-backend.onrender.com/api/chat/${userId}`
        );
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Failed to load chat", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    socket.connect();
    socket.emit("joinRoom", userId);

    socket.on("newMessage", ({ message }) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("newMessage");
      socket.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  
  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      await fetch(
        `https://vastuzone-backend.onrender.com/api/chat/${userId}/message`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: "user",
            text,
          }),
        }
      );

      setText(""); 
    } catch (err) {
      console.error("Message send failed", err);
    }
  };

  return (
    <div className="user-chat-page">
      <Navbar />

      <div className="user-chat-nav">
        <button className="chat-back-btn" onClick={() => navigate("/dashboard")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Go Back
        </button>
      </div>

      <div className="user-chat-shell">
        <div className="user-chat-card">

          <div className="user-chat-header">
            <div>
              <h2>Concierge Chat</h2>
              <p className="user-chat-subtitle">
                Direct access to VastuZone's Lead Geometric Consultants.
              </p>
            </div>

            <div className="expert-meta">
              <div className="status-badge">
                <div className="status-dot"></div>
                <span className="status-text">Live Now</span>
              </div>
              <span className="expert-reply-time">
                Typical response: 2-4 hours
              </span>
            </div>
          </div>

          <div className="appointment-cta">
            <p>
              Require a deeper spatial audit? <strong>Schedule a 1:1 Video Consultation.</strong>
            </p>
            <button
              className="book-btn"
              onClick={() => navigate("/book-appointment")}
            >
              Book Premium Session
            </button>
          </div>

          <div className="user-chat-messages">
            {loading && (
              <div className="chat-empty">Connecting to secure server...</div>
            )}

            {!loading && messages.length === 0 && (
              <div className="chat-empty">
                Your consultation history will appear here. Ask your first question above.
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={
                  msg.sender === "user"
                    ? "user-bubble user"
                    : "user-bubble expert"
                }
              >
                {msg.text}
              </div>
            ))}

            <div ref={bottomRef} />
          </div>

          <div className="user-chat-input">
            <input
              placeholder="Type your message here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Consult;
