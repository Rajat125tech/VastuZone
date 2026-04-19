import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "../components/Navbar";
import { auth } from "../firebase";
import "../styles/dashboard.css";

const API_URL = process.env.REACT_APP_API_URL || "https://vastuzone-backend.onrender.com";

function Dashboard() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Member");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const emailPrefix = user.email ? user.email.split("@")[0] : "Member";
        setUserName(user.displayName || emailPrefix);
        fetchProperties(user.uid);
      } else {
        setLoading(false);
      }
    });

    const fetchProperties = async (uid) => {
      try {
        const res = await fetch(
          `${API_URL}/api/properties/user/${uid}`
        );
        if (!res.ok) throw new Error("Failed to fetch properties");
        const data = await res.json();
        setProperties(data);
      } catch (error) {
        console.error("❌ Error:", error);
      } finally {
        setLoading(false);
      }
    };

    return () => unsubscribe();
  }, []);

  return (
    <div className="dashboard-wrapper">
      <Navbar />

      <main className="dashboard-main">
        <div className="container">
          
          {/* --- ULTRA-PREMIUM HEADER --- */}
          <header className="dashboard-hero-header">
            <div className="hero-left">
              <span className="eyebrow-lux">Portfolio Command</span>
              <h1 className="dashboard-title-lux">Welcome, {userName}.</h1>
              <p className="dashboard-subtitle-lux">
                Your spatial harmony audits are being monitored in real-time.
              </p>
            </div>
            <div className="hero-right-stats">
              <div className="stat-pill">
                <span className="stat-dot pulse"></span>
                <span className="stat-label">Active Analysis</span>
                <span className="stat-value-lux">{properties.filter(p => p.reviewStatus !== "reviewed").length}</span>
              </div>
              <div className="stat-pill">
                <span className="stat-label">Finalized Dossiers</span>
                <span className="stat-value-lux">{properties.filter(p => p.reviewStatus === "reviewed").length}</span>
              </div>
            </div>
          </header>

          <div className="dashboard-grid-refined">
            
            {/* --- ACTION SIDEBAR --- */}
            <aside className="sidebar-refined">
              <div className="sidebar-card">
                <h4 className="sidebar-title">Management</h4>
                <nav className="sidebar-nav">
                  <button className="nav-item-lux active" onClick={() => navigate("/dashboard")}>
                    <span className="nav-icon">⎔</span> Portfolio Overview
                  </button>
                  <button className="nav-item-lux" onClick={() => navigate("/add-property")}>
                    <span className="nav-icon">⊕</span> Initiate New Audit
                  </button>
                  <button className="nav-item-lux" onClick={() => navigate("/reports")}>
                    <span className="nav-icon">▤</span> View All Reports
                  </button>
                  <button className="nav-item-lux" onClick={() => navigate("/chat")}>
                    <span className="nav-icon">◎</span> Expert Consultation
                  </button>
                </nav>
              </div>

              <div className="sidebar-support-box">
                <span className="brass-text">Priority Support</span>
                <p>Consult with Dr. Srivastava directly for urgent architectural queries.</p>
                <button className="btn-text-link" onClick={() => navigate("/chat")}>Open Consultation →</button>
              </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <section className="content-refined">
              <div className="section-meta-header">
                <h2 className="serif">Property Asset Portfolio</h2>
                <div className="filter-tools">
                  <span>Recent First</span>
                </div>
              </div>

              {loading ? (
                <div className="loading-shimmer-container">
                  <div className="shimmer-card"></div>
                  <div className="shimmer-card"></div>
                </div>
              ) : properties.length === 0 ? (
                <div className="empty-state-lux">
                  <div className="empty-content">
                    <span className="serif">Start Your Legacy</span>
                    <p>No properties currently under analysis. Elevate your first space today.</p>
                    <button className="btn-primary" onClick={() => navigate("/add-property")}>Begin Submission</button>
                  </div>
                </div>
              ) : (
                <div className="dossier-grid">
                  {properties.map((property) => (
                    <div className="dossier-card" key={property._id}>
                      <div className="dossier-header">
                        <span className="dossier-tag">{property.propertyType}</span>
                        <div className="dossier-status-wrap">
                          <span className={`dossier-status-dot ${property.reviewStatus === "reviewed" ? "complete" : "active"}`}></span>
                          <span className={`status-label-text ${property.reviewStatus === "reviewed" ? "reviewed" : "pending"}`}>
                            {property.reviewStatus === "reviewed" ? "Completed" : "Pending Review"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="dossier-body">
                        <h3 className="property-name-lux">{property.propertyName}</h3>
                        <div className="location-row">
                          <span className="loc-indicator"></span> {property.city}
                        </div>
                        
                        <div className="progress-visual">
                          <div className="progress-labels">
                            <span>Analysis Stage</span>
                            <span>{property.reviewStatus === "reviewed" ? "Completed" : "Phase 1: Initial Audit"}</span>
                          </div>
                          <div className="progress-bar-wrap">
                            <div 
                              className="progress-bar-fill" 
                              style={{ width: property.reviewStatus === "reviewed" ? "100%" : "45%" }}
                            ></div>
                          </div>
                        </div>

                        <div className="dossier-specs">
                          <div className="spec-item">
                            <label>Orientation</label>
                            <p>{property.facing}</p>
                          </div>
                          <div className="spec-item">
                            <label>Analysis Type</label>
                            <p>Full Property Audit</p>
                          </div>
                        </div>
                      </div>

                      <div className="dossier-footer">
                        <button className="btn-dossier" onClick={() => navigate("/reports")}>
                          {property.reviewStatus === "reviewed" ? "Access Report" : "Track Audit"}
                          <span className="btn-arrow">→</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <style>{`
        .dashboard-wrapper { background: var(--paper); min-height: 100vh; color: var(--ink); }
        .dashboard-main { padding: 80px 0; }
        
        /* Hero Header */
        .dashboard-hero-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 80px; }
        .eyebrow-lux { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.3em; color: var(--brass); font-weight: 700; margin-bottom: 15px; display: block; }
        .dashboard-title-lux { font-size: 4rem; line-height: 1; margin-bottom: 10px; }
        .dashboard-subtitle-lux { font-size: 1.1rem; color: var(--text-muted); }
        
        .hero-right-stats { display: flex; gap: 30px; }
        .stat-pill { background: var(--stone); padding: 20px 30px; border-radius: 4px; display: flex; flex-direction: column; gap: 5px; position: relative; min-width: 180px; }
        .stat-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); font-weight: 600; }
        .stat-value-lux { font-family: 'Instrument Serif', serif; font-size: 2.2rem; line-height: 1; }
        .stat-dot { position: absolute; top: 15px; right: 15px; width: 8px; height: 8px; background: var(--brass); border-radius: 50%; }
        .stat-dot.pulse { animation: pulse-brass 2s infinite; }
        
        @keyframes pulse-brass {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(176, 141, 87, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(176, 141, 87, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(176, 141, 87, 0); }
        }

        .dashboard-grid-refined { display: grid; grid-template-columns: 320px 1fr; gap: 80px; align-items: flex-start; }
        
        /* Sidebar Refined */
        .sidebar-card { background: var(--paper); border: var(--border-subtle); padding: 40px; border-radius: 2px; }
        .sidebar-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.2em; color: var(--text-muted); margin-bottom: 30px; border-bottom: 1px solid var(--stone); padding-bottom: 15px; }
        .nav-item-lux { display: flex; align-items: center; gap: 15px; width: 100%; padding: 15px 0; border: none; background: none; font-size: 0.95rem; font-weight: 500; color: var(--text-main); text-align: left; transition: var(--transition-smooth); cursor: pointer; border-bottom: 1px solid transparent; }
        .nav-item-lux:hover { color: var(--brass); padding-left: 5px; }
        .nav-item-lux.active { color: var(--brass); font-weight: 700; border-bottom-color: var(--brass); }
        .nav-icon { font-size: 1.2rem; opacity: 0.7; width: 25px; }

        .sidebar-support-box { margin-top: 40px; padding: 30px; background: var(--ink); color: var(--paper); border-radius: 2px; }
        .sidebar-support-box .brass-text { color: var(--brass); font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 10px; }
        .sidebar-support-box p { font-size: 0.85rem; opacity: 0.7; line-height: 1.6; margin-bottom: 20px; }
        .btn-text-link { background: none; border: none; color: var(--paper); font-weight: 600; font-size: 0.85rem; cursor: pointer; padding: 0; }

        /* Content Refined */
        .section-meta-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .section-meta-header h2 { font-size: 2.8rem; }
        .filter-tools { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted); border: 1px solid var(--stone); padding: 8px 16px; border-radius: 2px; }

        .dossier-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 40px; }
        .dossier-card { background: var(--paper); border: var(--border-subtle); padding: 45px; transition: var(--transition-smooth); display: flex; flex-direction: column; gap: 30px; position: relative; overflow: hidden; }
        .dossier-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: var(--stone); }
        .dossier-card:hover { transform: translateY(-10px); box-shadow: 0 30px 60px rgba(0,0,0,0.05); border-color: var(--brass); }
        .dossier-card:hover::before { background: var(--brass); }

        .dossier-header { display: flex; justify-content: space-between; align-items: center; }
        .dossier-tag { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--brass); }
        .dossier-status-dot { width: 10px; height: 10px; border-radius: 50%; }
        .dossier-status-dot.active { background: #D4AF37; box-shadow: 0 0 10px rgba(212, 175, 55, 0.4); }
        .dossier-status-dot.complete { background: #2E7D32; }

        .property-name-lux { font-family: 'Instrument Serif', serif; font-size: 2.4rem; line-height: 1.1; margin-bottom: 5px; }
        .property-loc-lux { font-size: 0.9rem; color: var(--text-muted); display: flex; align-items: center; gap: 8px; }
        .loc-indicator { width: 6px; height: 6px; background: var(--brass); border-radius: 50%; }

        .progress-visual { margin: 25px 0; }
        .progress-labels { display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; }
        .progress-bar-wrap { width: 100%; height: 2px; background: var(--stone); position: relative; }
        .progress-bar-fill { height: 100%; background: var(--brass); transition: width 1.5s cubic-bezier(0.23, 1, 0.32, 1); }

        .dossier-specs { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 20px 0; border-top: 1px solid var(--stone); }
        .spec-item label { font-size: 0.6rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; display: block; margin-bottom: 5px; }
        .spec-item p { font-weight: 600; font-size: 0.9rem; color: var(--ink); }

        .btn-dossier { width: 100%; padding: 18px; background: var(--ink); color: var(--paper); border: none; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: 0.3s; }
        .btn-dossier:hover { background: var(--brass); color: var(--ink); }

        .empty-state-lux { background: var(--stone); padding: 100px 40px; text-align: center; border: 1px dashed var(--brass); }
        .empty-content span { font-size: 2.5rem; display: block; margin-bottom: 20px; }
        .empty-content p { margin-bottom: 30px; opacity: 0.7; }

        @media (max-width: 1200px) {
          .dashboard-grid-refined { grid-template-columns: 1fr; gap: 60px; }
          .dashboard-hero-header { flex-direction: column; align-items: flex-start; gap: 40px; }
        }

        @media (max-width: 768px) {
          .dashboard-main { padding: 40px 0; }
          .dashboard-title-lux { font-size: 2.8rem; }
          .section-meta-header h2 { font-size: 2rem; }
          .hero-right-stats { width: 100%; flex-direction: column; gap: 15px; }
          .stat-pill { min-width: auto; }
          .dossier-grid { grid-template-columns: 1fr; gap: 20px; }
          .dossier-card { padding: 30px; }
          .property-name-lux { font-size: 1.8rem; }
        }

        @media (max-width: 480px) {
          .dashboard-title-lux { font-size: 2.2rem; }
          .section-meta-header { flex-direction: column; align-items: flex-start; gap: 15px; }
          .sidebar-card { padding: 25px; }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
