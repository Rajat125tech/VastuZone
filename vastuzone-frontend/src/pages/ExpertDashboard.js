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
  
  // Phase 3 HITL Expert Review State
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [activeReview, setActiveReview] = useState(null);
  const [expertNotes, setExpertNotes] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editableRecs, setEditableRecs] = useState([]);
  const [reanalysisMode, setReanalysisMode] = useState(false);
  const [reanalysisTarget, setReanalysisTarget] = useState("rag");
  const [reanalysisReason, setReanalysisReason] = useState("");

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

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const status = viewMode === "active" ? "pending" : "reviewed";
      const res = await authFetch(`${API_URL}/api/expert/reviews?status=${status}`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("⚠️ Expert review queue unavailable", err);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (isExpert === null) return;
    fetchChats();
    fetchAppointments();
    fetchReviews();
  }, [isExpert, viewMode]);

  // Phase 3 HITL Handlers
  const handleOpenReviewModal = (review) => {
    setActiveReview(review);
    setExpertNotes(review.notes || "");
    setEditableRecs(JSON.parse(JSON.stringify(review.groundedRecommendations || [])));
    setEditMode(false);
    setReanalysisMode(false);
  };

  const handleApproveReport = async () => {
    if (!activeReview) return;
    try {
      await authFetch(`${API_URL}/api/expert/reviews/${activeReview._id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: expertNotes }),
      });
      alert("✅ Vastu Report Approved and Published.");
      setActiveReview(null);
      fetchReviews();
    } catch (err) {
      console.error("Failed to approve report", err);
      alert("❌ Approval failed. Please try again.");
    }
  };

  const handleSaveEditReport = async () => {
    if (!activeReview) return;
    try {
      await authFetch(`${API_URL}/api/expert/reviews/${activeReview._id}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: expertNotes, editedRecommendations: editableRecs }),
      });
      alert("✅ Modified Report Published Successfully.");
      setActiveReview(null);
      fetchReviews();
    } catch (err) {
      console.error("Failed to save report edit", err);
      alert("❌ Edit publication failed. Please try again.");
    }
  };

  const handleRequestReanalysis = async () => {
    if (!activeReview) return;
    if (!reanalysisReason.trim()) {
      alert("Please provide a reason for reanalysis.");
      return;
    }
    try {
      await authFetch(`${API_URL}/api/expert/reviews/${activeReview._id}/reanalyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: expertNotes,
          reanalysisTarget,
          reason: reanalysisReason,
        }),
      });
      alert("🔄 Reanalysis requested. LangGraph workflow re-entered target node.");
      setActiveReview(null);
      fetchReviews();
    } catch (err) {
      console.error("Failed to request reanalysis", err);
      alert("❌ Reanalysis request failed.");
    }
  };

  const handleRecChange = (index, field, value) => {
    const updated = [...editableRecs];
    updated[index][field] = value;
    setEditableRecs(updated);
  };

  const handleResolveChat = async (e, userId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to archive this inquiry?")) return;

    setChats(prev => prev.filter(c => c.userId !== userId));

    try {
      await authFetch(`${API_URL}/api/chat/${userId}/resolve`, { method: "POST" });
    } catch (err) {
      console.error("Failed to resolve chat");
      fetchChats();
    }
  };

  const handleCompleteAppointment = async (apptId) => {
    if (!window.confirm("Mark this consultation as completed?")) return;

    setAppointments(prev => prev.filter(a => a._id !== apptId));

    try {
      await authFetch(`${API_URL}/api/appointments/expert/${apptId}/complete`, { method: "POST" });
    } catch (err) {
      console.error("Failed to complete appointment");
      fetchAppointments();
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
          <span className="eyebrow-lux">Human-in-the-Loop Vastu Administration</span>
          <h1 className="expert-title-lux">Expert Consultation & Audit Dashboard</h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
            <p className="expert-subtitle-lux">
              Review AI-generated spatial audits, verify grounded RAG recommendations, and oversee scheduled consultations.
            </p>
            <div className="view-toggle-lux">
              <button 
                className={viewMode === 'active' ? 'active' : ''} 
                onClick={() => setViewMode('active')}
              >
                Active Queue
              </button>
              <button 
                className={viewMode === 'history' ? 'active' : ''} 
                onClick={() => setViewMode('history')}
              >
                Audit History
              </button>
            </div>
          </div>
        </header>

        {/* --- PHASE 3: PENDING AUDIT REVIEWS SECTION --- */}
        <section className="expert-section">
          <div className="section-meta-header">
            <h2>{viewMode === 'active' ? 'Pending Vastu Audit Reviews (HITL)' : 'Past Reviewed Audits'}</h2>
            <span className="count-badge">{reviews.length} audits</span>
          </div>

          {loadingReviews ? (
            <p className="eyebrow-lux">Synchronizing pending audit queue...</p>
          ) : reviews.length === 0 ? (
            <div className="empty-state-lux">
              <p>No {viewMode === 'active' ? 'pending audits waiting for review' : 'past audit records'} found.</p>
            </div>
          ) : (
            <div className="chats-grid">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="expert-card-lux"
                  style={{ borderLeft: viewMode === 'active' ? '4px solid #b08d57' : '4px solid #2e7d32' }}
                  onClick={() => handleOpenReviewModal(rev)}
                >
                  <div className="card-header-lux">
                    <h3 className="user-name-lux">{rev.propertyName || "Property Audit"}</h3>
                    <span className="status-tag-lux" style={{ background: '#f5efe6', color: '#b08d57', fontWeight: '600' }}>
                      Score: {rev.vastuScore || 0}/100 ({rev.scoreBand || "Calculated"})
                    </span>
                  </div>

                  <div className="card-body-lux">
                    <p className="last-msg-lux" style={{ fontSize: '0.88rem', color: '#555' }}>
                      {rev.propertyType || "Apartment"} • {rev.city || "Bangalore"} • Facing: {rev.facing || "North"}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '6px' }}>
                      AI Remedies: {(rev.groundedRecommendations || []).length} • Knowledge Citations: {(rev.knowledgeSources || []).length}
                    </p>
                  </div>

                  <div className="card-footer-lux">
                    <span className="time-stamp-lux">
                      Status: {rev.reviewStatus === "pending" ? "⏳ Pending Review" : "✅ " + rev.reviewStatus}
                    </span>
                    <span className="action-link-lux" style={{ fontWeight: '600' }}>
                      Review Audit →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

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
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- DETAILED REVIEW MODAL --- */}
        {activeReview && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px'
          }}>
            <div style={{
              background: '#fff', borderRadius: '12px', width: '900px', maxWidth: '100%',
              maxHeight: '90vh', overflowY: 'auto', padding: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <div>
                  <span className="eyebrow-lux">Expert Review & Audit Override</span>
                  <h2 style={{ margin: '5px 0 0 0', fontFamily: 'Cinzel, serif', color: '#111' }}>{activeReview.propertyName || "Property Audit"}</h2>
                </div>
                <button
                  onClick={() => setActiveReview(null)}
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#777' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '20px 0' }}>
                <div style={{ background: '#faf9f6', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#b08d57' }}>AI Spatial Extractions & Score</h4>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Vastu Score:</strong> {activeReview.vastuScore}/100 ({activeReview.scoreBand})</p>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Kitchen:</strong> {activeReview.kitchenDirection || activeReview.extractedDirections?.kitchenDirection || "N/A"}</p>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Master Bed:</strong> {activeReview.masterBedroomDirection || activeReview.extractedDirections?.masterBedroomDirection || "N/A"}</p>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Living Room:</strong> {activeReview.livingRoomDirection || activeReview.extractedDirections?.livingRoomDirection || "N/A"}</p>
                </div>

                <div style={{ background: '#faf9f6', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#b08d57' }}>Retrieved Knowledge Citations</h4>
                  {(activeReview.knowledgeSources || []).slice(0, 3).map((src, idx) => (
                    <div key={idx} style={{ fontSize: '0.8rem', color: '#444', margin: '4px 0' }}>
                      📖 <strong>{src.title}</strong> — {src.reference}
                    </div>
                  ))}
                </div>
              </div>

              {/* Remedies Editor */}
              <div style={{ margin: '20px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontFamily: 'Cinzel, serif', fontSize: '1.1rem' }}>Grounded Vastu Remedies</h3>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    style={{ background: editMode ? '#b08d57' : '#eee', color: editMode ? '#fff' : '#333', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    {editMode ? "Cancel Editing" : "✏️ Edit Remedies"}
                  </button>
                </div>

                {(editMode ? editableRecs : (activeReview.groundedRecommendations || [])).map((rec, idx) => (
                  <div key={idx} style={{ background: '#fff', border: '1px solid #e0d5c1', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
                    {editMode ? (
                      <div>
                        <input
                          type="text"
                          value={rec.issue || ""}
                          onChange={(e) => handleRecChange(idx, "issue", e.target.value)}
                          style={{ width: '100%', fontWeight: 'bold', marginBottom: '6px', padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                        <textarea
                          value={rec.recommendation || ""}
                          onChange={(e) => handleRecChange(idx, "recommendation", e.target.value)}
                          rows={2}
                          style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                      </div>
                    ) : (
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', color: '#111', fontSize: '0.95rem' }}>{idx + 1}. {rec.issue}</h4>
                        <p style={{ margin: '0', fontSize: '0.88rem', color: '#444' }}>{rec.recommendation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Expert Notes & Reanalysis Inputs */}
              <div style={{ margin: '20px 0' }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '6px' }}>Expert Review Notes / Comments</label>
                <textarea
                  value={expertNotes}
                  onChange={(e) => setExpertNotes(e.target.value)}
                  placeholder="Enter auditor verification notes..."
                  rows={2}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '0.9rem' }}
                />
              </div>

              {reanalysisMode && (
                <div style={{ background: '#fff8e7', border: '1px solid #ffe0b2', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#e65100' }}>Request Graph Reanalysis</h4>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Reanalysis Target Node:</label>
                  <select
                    value={reanalysisTarget}
                    onChange={(e) => setReanalysisTarget(e.target.value)}
                    style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '10px', width: '100%' }}
                  >
                    <option value="rag">RAG Knowledge Synthesis (Re-query Vastu Rules)</option>
                    <option value="vision">Vision Extraction (Re-extract Room Directions)</option>
                  </select>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Reason for Reanalysis:</label>
                  <textarea
                    value={reanalysisReason}
                    onChange={(e) => setReanalysisReason(e.target.value)}
                    placeholder="Describe specific discrepancies..."
                    rows={2}
                    style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <button
                    onClick={handleRequestReanalysis}
                    style={{ background: '#e65100', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}
                  >
                    Confirm Reanalysis Request
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <button
                  onClick={() => setReanalysisMode(!reanalysisMode)}
                  style={{ background: '#fff', color: '#e65100', border: '1px solid #e65100', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  🔄 Request Reanalysis
                </button>
                
                {editMode ? (
                  <button
                    onClick={handleSaveEditReport}
                    style={{ background: '#b08d57', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    💾 Save Edits & Publish
                  </button>
                ) : (
                  <button
                    onClick={handleApproveReport}
                    style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ✅ Approve & Publish
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ExpertDashboard;
