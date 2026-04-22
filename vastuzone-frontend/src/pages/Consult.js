import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { socket } from "../socket";
import { 
  ArrowLeft, 
  Send, 
  Wifi, 
  WifiOff, 
  Calendar, 
  ShieldCheck,
  MoreVertical,
  Video
} from "lucide-react";
import authFetch from "../utils/authFetch";
import "../styles/chat.css";

const API_URL = process.env.REACT_APP_API_URL || "https://vastuzone-backend.onrender.com";

function Consult() {
  const user = auth.currentUser;
  const userId = user?.uid;
  const bottomRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);

  const { isLoading: loadingInitial } = useQuery({
    queryKey: ['chat', userId],
    queryFn: async () => {
      const res = await authFetch(`${API_URL}/api/chat/${userId}`);
      if (!res.ok) throw new Error("Failed to load chat history");
      const data = await res.json();
      setMessages(data.messages || []);
      return data;
    },
    enabled: !!userId,
    onError: () => toast.error("Could not load chat history")
  });

  useEffect(() => {
    if (!userId) return;

    function onConnect() {
      setIsConnected(true);
      socket.emit("joinRoom", userId);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onNewMessage({ message }) {
      setMessages((prev) => [...prev, message]);
    }

    socket.connect();

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("newMessage", onNewMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("newMessage", onNewMessage);
      socket.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText) => {
      const res = await authFetch(`${API_URL}/api/chat/${userId}/message`, {
        method: "POST",
        body: JSON.stringify({
          sender: "user",
          text: messageText,
        }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      setText("");
    },
    onError: () => {
      toast.error("Message failed to send. Please try again.");
    }
  });

  const sendMessage = () => {
    if (!text.trim() || sendMessageMutation.isLoading) return;
    sendMessageMutation.mutate(text);
  };

  return (
    <div className="user-chat-page">
      <Navbar />

      <div className="user-chat-nav container">
        <button className="chat-back-btn" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={18} />
          Go Back
        </button>
      </div>

      <div className="user-chat-shell container">
        <div className="user-chat-card">

          <div className="user-chat-header">
            <div className="header-info">
              <div className="title-row">
                <h2>Concierge Chat</h2>
                <div className={`connection-status ${isConnected ? 'online' : 'offline'}`}>
                  {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
                  <span>{isConnected ? 'Connected' : 'Reconnecting...'}</span>
                </div>
              </div>
              <p className="user-chat-subtitle">
                Direct access to VastuZone's Lead Geometric Consultants.
              </p>
            </div>

            <div className="expert-meta">
              <div className="status-badge">
                <ShieldCheck size={14} className="text-green-600" />
                <span className="status-text">Verified Expert</span>
              </div>
              <span className="expert-reply-time">
                Response: 2-4 hours
              </span>
            </div>
          </div>

          <div className="appointment-cta">
            <div className="cta-icon-box">
              <Video size={20} />
            </div>
            <div className="cta-text">
              <p>Require a deeper spatial audit? <strong>Schedule a 1:1 Video Consultation.</strong></p>
            </div>
            <button
              className="book-btn"
              onClick={() => navigate("/book-appointment")}
            >
              Book Session
            </button>
          </div>

          <div className="user-chat-messages">
            {loadingInitial && (
              <div className="chat-empty">
                <div className="loader-shimmer"></div>
                Initializing secure session...
              </div>
            )}

            {!loadingInitial && messages.length === 0 && (
              <div className="chat-empty">
                <Calendar size={40} className="mb-4 opacity-20" />
                <p>Your consultation history will appear here.</p>
                <p className="text-sm opacity-50">Ask your first question to begin.</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message-wrapper ${msg.sender === "user" ? "user-wrapper" : "expert-wrapper"}`}
              >
                <div
                  className={
                    msg.sender === "user"
                      ? "user-bubble user"
                      : "user-bubble expert"
                  }
                >
                  {msg.text}
                </div>
              </div>
            ))}

            <div ref={bottomRef} />
          </div>

          <div className="user-chat-input">
            <input
              placeholder={isConnected ? "Type your message here..." : "Waiting for connection..."}
              value={text}
              disabled={!isConnected || sendMessageMutation.isLoading}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button 
              onClick={sendMessage} 
              disabled={!text.trim() || !isConnected || sendMessageMutation.isLoading}
              className={sendMessageMutation.isLoading ? 'loading' : ''}
            >
              {sendMessageMutation.isLoading ? <div className="spinner-small"></div> : <Send size={18} />}
            </button>
          </div>

        </div>
      </div>

      <style>{`
        .connection-status { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 20px; }
        .connection-status.online { background: #E8F5E9; color: #2E7D32; }
        .connection-status.offline { background: #FFEBEE; color: #C62828; }
        .title-row { display: flex; align-items: center; gap: 15px; margin-bottom: 5px; }
        .message-wrapper { display: flex; width: 100%; margin-bottom: 12px; }
        .user-wrapper { justify-content: flex-end; }
        .expert-wrapper { justify-content: flex-start; }
        .spinner-small { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loader-shimmer { width: 40px; height: 4px; background: #eee; margin-bottom: 10px; border-radius: 2px; position: relative; overflow: hidden; }
        .loader-shimmer::after { content: ""; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent); animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
      `}</style>
    </div>
  );
}

export default Consult;
