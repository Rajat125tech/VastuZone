import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import authFetch from "../utils/authFetch";
import { auth } from "../firebase";
import "../styles/expertDashboard.css";

const API_URL = process.env.REACT_APP_API_URL || "https://vastuzone-backend.onrender.com";

function ExpertDashboard() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [isExpert, setIsExpert] = useState(null);
  const [viewMode, setViewMode] = useState("active"); // "active" or "history"

  useEffect(() => {
    const checkRole = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const res = await fetch(`${API_URL}/api/users/me/${user.uid}`);
        const data = await res.json();
        if (data.role !== "expert") {
          navigate("/dashboard");
        } else {
          setIsExpert(true);
        }
      } catch (err) {
        console.error("Role check failed", err);
        navigate("/dashboard");
      }
    };

    checkRole();
  }, [navigate]);

  const fetchChats = async () => {
    setLoadingChats(true);
    try {
      const status = viewMode === "active" ? "active" : "resolved";
      const res = await authFetch(`${API_URL}/api/chat?status=${status}`);
      const data = await res.json();
      setChats(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Failed to load chats", err);
      setChats([]);
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const res = await authFetch(`${API_URL}/api/appointments/expert`);
      const data = await res.json();
      
      const filtered = Array.isArray(data) ? data.filter(a => {
        if (viewMode === "active") return a.status !== "completed";
        return a.status === "completed";
      }) : [];
      
      setAppointments(filtered);
    } catch (err) {
      console.warn("⚠️ Appointments unavailable", err);
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    if (isExpert === null) return;
    fetchChats();
    fetchAppointments();
  }, [isExpert, viewMode]);

  const handleResolveChat = async (e, userId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to archive this inquiry?")) return;

    // Optimistic Update
    setChats(prev => prev.filter(c => c.userId !== userId));

    try {
      await authFetch(`${API_URL}/api/chat/${userId}/resolve`, { method: "POST" });
      // fetchChats(); // No need to re-fetch if we update locally
    } catch (err) {
      console.error("Failed to resolve chat");
      fetchChats(); // Revert on error
    }
  };

  const handleCompleteAppointment = async (apptId) => {
    if (!window.confirm("Mark this consultation as completed?")) return;

    // Optimistic Update
    setAppointments(prev => prev.filter(a => a._id !== apptId));

    try {
      await authFetch(`${API_URL}/api/appointments/expert/${apptId}/complete`, { method: "POST" });
      // fetchAppointments(); // No need to re-fetch if we update locally
    } catch (err) {
      console.error("Failed to complete appointment");
      fetchAppointments(); // Revert on error
    }
  };

  if (isExpert === null) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
        <p className="eyebrow-lux">Verifying credentials...</p>
      </div>
    );
  }

  return (
    <div className="expert-dashboard-wrapper">
      <Navbar />

      <main className="container">
        {/* --- HERO HEADER --- */}
        <header className="expert-hero-header">
          <span className="eyebrow-lux">Expert Administration</span>
          <h1 className="expert-title-lux">Expert Dashboard</h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
            <p className="expert-subtitle-lux">
              Manage client inquiries, oversee spatial audit requests, and coordinate scheduled video consultations.
            </p>
            <div className="view-toggle-lux">
              <button 
                className={viewMode === 'active' ? 'active' : ''} 
                onClick={() => setViewMode('active')}
              >
                Active
              </button>
              <button 
                className={viewMode === 'history' ? 'active' : ''} 
                onClick={() => setViewMode('history')}
              >
                History
              </button>
            </div>
          </div>
        </header>

        {/* --- USER INQUIRIES --- */}
        <section className="expert-section">
          <div className="section-meta-header">
            <h2>{viewMode === 'active' ? 'Recent User Inquiries' : 'Resolved Inquiries'}</h2>
            <span className="count-badge">{chats.length} threads</span>
          </div>

          {loadingChats ? (
            <p className="eyebrow-lux">Synchronizing thread history...</p>
          ) : chats.length === 0 ? (
            <div className="empty-state-lux">
              <p>No {viewMode} inquiries found.</p>
            </div>
          ) : (
            <div className="chats-grid">
              {chats.map((chat) => {
                const lastMessage =
                  chat.messages?.length > 0
                    ? chat.messages[chat.messages.length - 1].text
                    : "Thread initiated";

                return (
                  <div
                    key={chat._id}
                    className="expert-card-lux"
                    onClick={() => navigate(`/expert/chat/${chat.userId}`)}
                  >
                    <div className="card-header-lux">
                      <h3 className="user-name-lux">{chat.userName || "Client"}</h3>
                      {viewMode === 'active' && (
                        <button 
                          className="resolve-btn-lux"
                          onClick={(e) => handleResolveChat(e, chat.userId)}
                        >
                          Archive
                        </button>
                      )}
                    </div>
                    <div className="card-body-lux">
                      <p className="last-msg-lux">{lastMessage}</p>
                    </div>
                    <div className="card-footer-lux">
                      <span className="time-stamp-lux">
                        {new Date(chat.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="action-link-lux">View Inquiry →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* --- SCHEDULED CONSULTATIONS --- */}
        <section className="expert-section">
          <div className="section-meta-header">
            <h2>{viewMode === 'active' ? 'Scheduled Consultations' : 'Past Consultations'}</h2>
            <span className="count-badge">{appointments.length} sessions</span>
          </div>

          {loadingAppointments ? (
            <p className="eyebrow-lux">Loading appointment data...</p>
          ) : appointments.length === 0 ? (
            <div className="empty-state-lux">
              <p>No {viewMode} consultations found.</p>
            </div>
          ) : (
            <div className="appointments-grid">
              {appointments.map((appt) => (
                <div key={appt._id} className="expert-card-lux appointment-card-lux">
                  <div className="card-header-lux">
                    <h3 className="user-name-lux">{appt.userName || "Client"}</h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="status-tag-lux">
                        {appt.status}
                      </span>
                      {viewMode === 'active' && appt.status === 'paid' && (
                        <button 
                          className="complete-btn-lux"
                          onClick={() => handleCompleteAppointment(appt._id)}
                        >
                          Done
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="card-body-lux">
                    <div className="appt-details-lux">
                      <div className="detail-item-lux">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        {appt.appointmentDate}
                      </div>
                      <div className="detail-item-lux">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        {appt.timeSlot}
                      </div>
                    </div>

                    <div className="meet-input-wrapper">
                      <label>Meeting Link</label>
                      <input
                        type="text"
                        placeholder="Assign video link"
                        defaultValue={appt.meetLink}
                        className="meet-link-input"
                        disabled={viewMode === 'history'}
                        onBlur={async (e) => {
                          const link = e.target.value.trim();
                          if (!link || viewMode === 'history') return;

                          try {
                            await authFetch(
                              `${API_URL}/api/appointments/expert/${appt._id}/meet-link`,
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ meetLink: link }),
                              }
                            );
                          } catch (err) {
                            console.error("Link update failed");
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ExpertDashboard;
