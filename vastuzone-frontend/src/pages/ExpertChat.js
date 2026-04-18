import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { socket } from "../socket";
import "../styles/expertChat.css";

const API_BASE_URL = "https://vastuzone-backend.onrender.com";

function ExpertChat() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [chat, setChat] = useState(null);
  const [properties, setProperties] = useState([]);
  const [activeProperty, setActiveProperty] = useState(null);
  const [text, setText] = useState("");
  const [userName, setUserName] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  const loadChat = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/api/chat/${userId}`);
    const data = await res.json();
    setChat(data);
  }, [userId]);

  const loadUser = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/api/users/me/${userId}`);
    const data = await res.json();
    setUserName(data.name || "Unknown User");
  }, [userId]);

  const loadProperties = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/api/properties/user/${userId}`);
    const data = await res.json();
    setProperties(data);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    Promise.all([
      loadChat(),
      loadUser(),
      loadProperties(),
    ]).finally(() => setLoading(false));
  }, [userId, loadChat, loadUser, loadProperties]);

  useEffect(() => {
    if (!userId) return;

    socket.connect();
    socket.emit("joinRoom", userId);

    socket.on("newMessage", ({ message }) => {
      setChat((prev) =>
        prev
          ? { ...prev, messages: [...prev.messages, message] }
          : prev
      );
    });

    return () => {
      socket.off("newMessage");
      socket.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    await fetch(`${API_BASE_URL}/api/chat/${userId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: "expert",
        text,
      }),
    });

    setText(""); 
  };

  const markAsReviewed = async (e, propertyId) => {
    e.stopPropagation();

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/properties/mark-reviewed-single/${propertyId}`,
        { method: "POST" }
      );

      if (res.ok) {
        setProperties((prev) =>
          prev.map((p) =>
            p._id === propertyId ? { ...p, reviewStatus: "reviewed" } : p
          )
        );
        alert("Property marked as reviewed!");
      }
    } catch (err) {
      console.error("Failed to mark reviewed:", err);
      alert("Failed to mark as reviewed");
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading chat…</p>;
  if (!chat) return <p style={{ padding: 20 }}>Chat not found</p>;

  return (
    <>
      <Navbar />

      <div className="ecz-scope">
        <div className="ecz-wrapper">

          <div className="ecz-top-bar">
            <button className="ecz-back-btn" onClick={() => navigate("/expert/dashboard")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Expert Dashboard
            </button>
            <div className="ecz-header">
              <h2>User Consultation</h2>
              <span>Active User: <strong>{userName}</strong></span>
            </div>
          </div>

          <div className="ecz-layout">

            <div className="ecz-chat-box">
              <div className="ecz-messages">
                {chat.messages.length === 0 && (
                  <div className="ecz-empty">
                    User has not sent any messages yet.
                  </div>
                )}

                {chat.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`ecz-bubble ${
                      msg.sender === "expert"
                        ? "ecz-bubble-expert"
                        : "ecz-bubble-user"
                    }`}
                  >
                    <div className="ecz-text">{msg.text}</div>
                    <span className="ecz-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}

                <div ref={bottomRef} />
              </div>

              <div className="ecz-input-bar">
                <textarea
                  placeholder="Type your response here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </div>

            <div className="ecz-property-box">
              <h4>Associated Properties</h4>

              {properties.length === 0 && (
                <p className="ecz-muted">No properties uploaded by this user.</p>
              )}

              {properties.map((property) => (
                <div
                  key={property._id}
                  className={`ecz-property-item ${
                    activeProperty?._id === property._id ? "active" : ""
                  }`}
                  onClick={() => setActiveProperty(property)}
                >
                  <div className="ecz-prop-header">
                    <strong>{property.propertyName}</strong>
                    {property.reviewStatus === "reviewed" ? (
                      <span className="ecz-tag-reviewed">✅ Reviewed</span>
                    ) : (
                      <button
                        className="ecz-btn-review"
                        onClick={(e) => markAsReviewed(e, property._id)}
                      >
                        Mark as Reviewed
                      </button>
                    )}
                  </div>
                  <span>
                    {property.city} • {property.propertyType}
                  </span>
                </div>
              ))}

              {activeProperty && (
                <div className="ecz-pdf">
                  <h5>Architectural Floor Plan</h5>
                  {activeProperty.fileUrl ? (
                    <iframe
                      src={activeProperty.fileUrl}
                      title="Floor Plan"
                    />
                  ) : (
                    <p className="ecz-muted">No floor plan provided.</p>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default ExpertChat;
