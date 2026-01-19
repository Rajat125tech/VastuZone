import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/expertChat.css";

function ExpertChat() {
  const { userId } = useParams();
  const bottomRef = useRef(null);

  const [chat, setChat] = useState(null);
  const [properties, setProperties] = useState([]);
  const [activeProperty, setActiveProperty] = useState(null);
  const [text, setText] = useState("");
  const [userName, setUserName] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const loadChat = useCallback(async () => {
    const res = await fetch(`http://localhost:5001/api/chat/${userId}`);
    const data = await res.json();
    setChat(data);
  }, [userId]);

  const loadUser = useCallback(async () => {
    const res = await fetch(
      `http://localhost:5001/api/users/me/${userId}`
    );
    const data = await res.json();
    setUserName(data.name || "Unknown User");
  }, [userId]);

  const loadProperties = useCallback(async () => {
    const res = await fetch(
      `http://localhost:5001/api/properties/user/${userId}`
    );
    const data = await res.json();
    setProperties(data);
  }, [userId]);

  const markPropertiesReviewed = useCallback(async () => {
    try {
      await fetch(
        `http://localhost:5001/api/properties/mark-reviewed/${userId}`,
        { method: "POST" }
      );
    } catch (err) {
      console.error("Failed to mark properties reviewed", err);
    }
  }, [userId]);
  useEffect(() => {
    if (!userId) return;

    Promise.all([
      loadChat(),
      loadUser(),
      loadProperties(),
      markPropertiesReviewed(),
    ]).finally(() => setLoading(false));
  }, [userId, loadChat, loadUser, loadProperties, markPropertiesReviewed]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);
  const sendMessage = async () => {
    if (!text.trim()) return;

    await fetch(`http://localhost:5001/api/chat/${userId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: "expert",
        text,
      }),
    });

    setText("");
    loadChat();
  };

  if (loading) return <p style={{ padding: 20 }}>Loading chat…</p>;
  if (!chat) return <p style={{ padding: 20 }}>Chat not found</p>;

  return (
    <>
      <Navbar />

      <div className="ecz-scope">
        <div className="ecz-wrapper">

          {/* HEADER */}
          <div className="ecz-header">
            <h2>User Consultation</h2>
            <span>
              User: <strong>{userName}</strong>
            </span>
          </div>

          {/* MAIN LAYOUT */}
          <div className="ecz-layout">

            {/* CHAT COLUMN */}
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
                    <div className="ecz-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}

                <div ref={bottomRef} />
              </div>

              <div className="ecz-input-bar">
                <textarea
                  placeholder="Reply to user…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </div>
            <div className="ecz-property-box">
              <h4>User Properties</h4>

              {properties.length === 0 && (
                <p className="ecz-muted">No properties uploaded.</p>
              )}

              {properties.map((property) => (
                <div
                  key={property._id}
                  className={`ecz-property-item ${
                    activeProperty?._id === property._id ? "active" : ""
                  }`}
                  onClick={() => setActiveProperty(property)}
                >
                  <strong>{property.propertyName}</strong>
                  <span>
                    {property.city} • {property.propertyType}
                  </span>
                </div>
              ))}

              {activeProperty && (
                <div className="ecz-pdf">
                  <h5>Floor Plan</h5>

                  {activeProperty.fileUrl ? (
                    <iframe
                      src={activeProperty.fileUrl}
                      title="Floor Plan"
                    />
                  ) : (
                    <p className="ecz-muted">
                      No floor plan uploaded.
                    </p>
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
