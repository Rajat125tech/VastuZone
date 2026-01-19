import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
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
          `http://localhost:5001/api/chat/${userId}`
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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      await fetch(`http://localhost:5001/api/chat/${userId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: "user",
          text,
        }),
      });

      setText("");

      const res = await fetch(
        `http://localhost:5001/api/chat/${userId}`
      );
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Message send failed", err);
    }
  };

  return (
    <div className="user-chat-page">
      <Navbar />
      <div className="user-chat-shell">
        <div className="user-chat-card">

          <div className="user-chat-header">
            <div>
              <h2>Consult Vastu Shastri</h2>
              <p className="user-chat-subtitle">
                Ask questions freely. Book a live session when ready.
              </p>
            </div>

            <div className="expert-meta">
              <span className="expert-status online">🟢 Online</span>
              <span className="expert-reply-time">
                Replies within 24 hours
              </span>
            </div>
          </div>

          <div className="appointment-cta">
            <p>
              Want a detailed one-to-one video consultation with the expert?
            </p>
            <button
              className="book-btn"
              onClick={() => navigate("/book-appointment")}
            >
              Book Paid Appointment (₹299)
            </button>
          </div>

          <div className="user-chat-messages">
            {loading && (
              <div className="chat-empty">Loading chat...</div>
            )}

            {!loading && messages.length === 0 && (
              <div className="chat-empty">
                Start your consultation by asking a question ✨
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
              placeholder="Ask about Vastu, energy, directions..."
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
