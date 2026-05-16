import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "../components/Navbar";
import { auth } from "../firebase";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

function calculateVastuReport(property) {
  let score = 0;
  const warnings = [];
  const tips = [];
  
  // Granular scores for Chart
  const breakdown = {
    structure: 0,
    entrance: 0,
    kitchen: 0,
    bedrooms: 0,
    pooja: 0,
    living: 0
  };

  if (["Square", "Rectangle"].includes(property.propertyShape)) {
    score += 10;
    breakdown.structure = 10;
  } else {
    score += 4;
    breakdown.structure = 4;
    tips.push("Irregular property shapes may disturb energy flow.");
  }

  if (["North", "East", "North-East"].includes(property.facing)) {
    score += 20;
    // Entrance/Facing combined logic for simplicity in breakdown
  } else {
    score += 8;
    warnings.push("Property facing is not ideal (North/East/NE preferred).");
  }

  if (["North", "East"].includes(property.entrance)) {
    score += 20;
    breakdown.entrance = 20;
  } else if (property.entrance === "South") {
    score -= 10;
    breakdown.entrance = 0;
    warnings.push("Main entrance facing South may affect prosperity.");
  } else {
    breakdown.entrance = 8;
  }

  if (["North", "East", "North-East"].includes(property.livingRoomDirection)) {
    score += 10;
    breakdown.living = 10;
  } else {
    score += 5;
    breakdown.living = 5;
    warnings.push("Living room should ideally be in North/East/NE.");
  }

  if (property.kitchenDirection === "South-East") {
    score += 10;
    breakdown.kitchen = 10;
  } else {
    score += 4;
    breakdown.kitchen = 4;
    warnings.push("Kitchen is best placed in the South-East direction.");
  }

  if (["North", "North-West"].includes(property.bathroomDirection)) {
    score += 8;
  } else {
    score += 3;
    warnings.push("Bathrooms should ideally be in North or North-West.");
  }

  if (property.masterBedroomDirection === "South-West") {
    score += 10;
    breakdown.bedrooms += 10;
  } else {
    score += 5;
    breakdown.bedrooms += 5;
    warnings.push("Master bedroom is best located in South-West.");
  }

  if (["West", "North-West"].includes(property.kidsBedroomDirection)) {
    score += 6;
    breakdown.bedrooms += 6;
  } else {
    score += 3;
    breakdown.bedrooms += 3;
    warnings.push("Kids bedroom should ideally be in West or North-West.");
  }

  if (property.poojaRoomDirection === "North-East") {
    score += 10;
    breakdown.pooja = 10;
  } else if (["North", "East"].includes(property.poojaRoomDirection)) {
    score += 7;
    breakdown.pooja = 7;
  } else {
    score += 3;
    breakdown.pooja = 3;
    warnings.push("Pooja room should ideally be in the North-East.");
  }

  score = Math.max(0, Math.min(100, score));

  let band = "Needs Vastu Remedies";
  let bandColor = "#e74c3c";

  if (score >= 80) {
    band = "Excellent";
    bandColor = "#2ecc71";
  } else if (score >= 60) {
    band = "Good (Minor Corrections Needed)";
    bandColor = "#f1c40f";
  }

  return {
    score,
    band,
    bandColor,
    warnings,
    tips,
    breakdown
  };
}


const API_URL = process.env.REACT_APP_API_URL || "https://vastuzone-backend.onrender.com";

function ViewReports() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [activePdf, setActivePdf] = useState(null);
  const navigate = useNavigate();

  const handleDownload = async (propertyId, propertyName) => {
    try {
      setDownloadingId(propertyId);
      const res = await fetch(`${API_URL}/api/properties/${propertyId}/download-report`);
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `VastuReport_${propertyName.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Download error:", err);
      alert("Failed to download report. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchProperties(user.uid);
      } else {
        setLoading(false);
      }
    });

    const fetchProperties = async (uid) => {
      try {
        const res = await fetch(`${API_URL}/api/properties/user/${uid}`);
        if (!res.ok) throw new Error("Failed to fetch reports");
        const data = await res.json();
        setProperties(data);
      } catch (err) {
        console.error("❌ Error:", err);
      } finally {
        setLoading(false);
      }
    };

    return () => unsubscribe();
  }, []);

  return (
    <div className="reports-page-wrapper">
      <Navbar />

      <div className="reports-nav-header">
        <button className="reports-back-btn" onClick={() => navigate("/dashboard")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Dashboard
        </button>
      </div>

      <main className="reports-main container section-padding">
        <header className="reports-hero-header">
          <span className="eyebrow-lux">Technical Dossiers</span>
          <h1 className="reports-title-lux">Analytical Reports</h1>
          <p className="reports-description-lux">
            Comprehensive spatial audits and energy-field evaluations for your property portfolio.
          </p>
        </header>

        {loading ? (
          <div className="reports-grid-lux">
            {[1, 2].map((i) => (
              <div className="dossier-report-card skeleton" key={i}>
                <div className="skeleton-line header"></div>
                <div className="skeleton-line title"></div>
                <div className="skeleton-line text"></div>
                <div className="skeleton-line chart"></div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="reports-empty-lux">
            <span className="serif">No Dossiers Available</span>
            <p>Your property audits will appear here once the initial analysis is generated.</p>
            <button className="btn-primary" onClick={() => navigate("/add-property")}>Submit Floor Plan</button>
          </div>
        ) : (
          <div className="reports-grid-lux">
            {properties.map((property) => {
              const report = calculateVastuReport(property);
              return (
                <div className="dossier-report-card" key={property._id}>
                  <div className="dossier-left-content">
                    <div className="dossier-header-main">
                      <div className="dossier-meta">
                        <span className="dossier-id">#{property._id.slice(-6).toUpperCase()}</span>
                        <span className={`dossier-badge ${property.reviewStatus === "reviewed" ? "gold" : "ink"}`}>
                          {property.reviewStatus === "reviewed" ? "Expert Finalized" : "AI Baseline"}
                        </span>
                      </div>
                      <h2 className="dossier-title-text serif">{property.propertyName}</h2>
                      <p className="dossier-subtitle-text">{property.propertyType} • {property.city}</p>
                    </div>

                    <div className="dossier-horizontal-stats">
                      <div className="chart-container-lux">
                        <Radar 
                          data={{
                            labels: ['Structure', 'Entrance', 'Kitchen', 'Bedrooms', 'Pooja', 'Living'],
                            datasets: [
                              {
                                label: 'Vastu Alignment',
                                data: [
                                  report.breakdown.structure,
                                  report.breakdown.entrance,
                                  report.breakdown.kitchen,
                                  report.breakdown.bedrooms,
                                  report.breakdown.pooja,
                                  report.breakdown.living
                                ],
                                backgroundColor: 'rgba(176, 141, 87, 0.2)',
                                borderColor: 'rgba(176, 141, 87, 1)',
                                borderWidth: 2,
                                pointBackgroundColor: 'rgba(176, 141, 87, 1)',
                                pointBorderColor: '#fff',
                                pointHoverBackgroundColor: '#fff',
                                pointHoverBorderColor: 'rgba(176, 141, 87, 1)',
                              },
                            ],
                          }}
                          options={{
                            scales: {
                              r: {
                                angleLines: {
                                  display: true,
                                  color: 'rgba(0, 0, 0, 0.05)'
                                },
                                grid: {
                                  color: 'rgba(0, 0, 0, 0.05)'
                                },
                                suggestedMin: 0,
                                suggestedMax: 20,
                                ticks: {
                                  display: false
                                },
                                pointLabels: {
                                  font: {
                                    size: 10,
                                    family: "'Instrument Serif', serif",
                                  },
                                  color: '#1a1c19'
                                }
                              }
                            },
                            plugins: {
                              legend: {
                                display: false
                              }
                            }
                          }}
                        />
                        <div className="total-score-overlay">
                          <span className="score-num">{report.score}</span>
                          <span className="score-label">OVERALL</span>
                        </div>
                      </div>
                      <div className="dossier-findings">
                        {report.warnings.length > 0 ? (
                          <div className="finding-group">
                            <label>Analysis Findings</label>
                            <ul>
                              {report.warnings.slice(0, 4).map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                          </div>
                        ) : (
                          <div className="finding-group">
                            <label>Spatial Orientation</label>
                            <p>Property faces <strong>{property.facing}</strong>. Primary entrance is positioned in the <strong>{property.entrance}</strong> zone. No critical structural imbalances detected.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="dossier-right-meta">
                    <div className="band-status-lux">
                      <span className="band-dot" style={{ background: report.bandColor }}></span>
                      <p>{report.band}</p>
                    </div>
                    <div className="dossier-actions">
                      <button 
                        className="btn-lux-primary" 
                        onClick={() => handleDownload(property._id, property.propertyName)}
                        disabled={downloadingId === property._id}
                      >
                        {downloadingId === property._id ? "Generating..." : "Download Detailed Dossier"}
                      </button>
                      {property.fileUrl && (
                        <button className="btn-lux-secondary" onClick={() => setActivePdf(property.fileUrl)}>
                          View Floor Map
                        </button>
                      )}
                      <button className="btn-lux-secondary" onClick={() => navigate("/chat")}>
                        Consult Expert
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* --- PDF MODAL --- */}
      {activePdf && (
        <div className="modal-overlay-lux" onClick={() => setActivePdf(null)}>
          <div className="modal-content-lux" onClick={e => e.stopPropagation()}>
            <div className="modal-header-lux">
              <h3 className="serif">Architectural Floor Plan</h3>
              <button className="close-btn-lux" onClick={() => setActivePdf(null)}>✕</button>
            </div>
            <div className="modal-body-lux">
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(activePdf)}&embedded=true`}
                title="Floor Plan"
                width="100%"
                height="100%"
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .reports-page-wrapper { background: var(--paper); min-height: 100vh; }
        
        .reports-nav-header { max-width: 1400px; margin: 0 auto; padding: 30px 40px 0 40px; }
        .reports-back-btn { display: flex; align-items: center; gap: 10px; background: transparent; border: 1px solid rgba(0,0,0,0.1); padding: 12px 24px; border-radius: 4px; color: var(--ink); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: var(--transition-smooth); }
        .reports-back-btn:hover { background: var(--ink); color: var(--paper); transform: translateX(-5px); }

        .reports-hero-header { margin-bottom: 80px; }
        .eyebrow-lux { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.3em; color: var(--brass); font-weight: 700; margin-bottom: 20px; display: block; }
        .reports-title-lux { font-size: 4.5rem; line-height: 1; margin-bottom: 20px; }
        .reports-description-lux { font-size: 1.2rem; color: var(--text-muted); max-width: 600px; }

        .reports-grid-lux { display: flex; flex-direction: column; gap: 40px; }
        .dossier-report-card { background: var(--paper); border: var(--border-subtle); padding: 50px; display: grid; grid-template-columns: 1fr 300px; gap: 60px; transition: var(--transition-smooth); position: relative; }
        .dossier-report-card:hover { border-color: var(--brass); box-shadow: 0 30px 60px rgba(0,0,0,0.05); }
        
        .dossier-left-content { display: flex; flex-direction: column; gap: 40px; }
        .dossier-right-meta { border-left: 1px solid var(--stone); padding-left: 60px; display: flex; flex-direction: column; justify-content: space-between; }

        .dossier-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .dossier-id { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.1em; }
        .dossier-badge { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 6px 12px; border-radius: 2px; }
        .dossier-badge.gold { background: var(--brass); color: var(--paper); }
        .dossier-badge.ink { background: var(--stone); color: var(--ink); }

        .dossier-title-text { font-size: 3.2rem; line-height: 1; margin-bottom: 8px; }
        .dossier-subtitle-text { font-size: 0.95rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }

        .dossier-horizontal-stats { display: grid; grid-template-columns: 280px 1fr; gap: 60px; align-items: center; padding: 40px 0; border-top: 1px solid var(--stone); border-bottom: 1px solid var(--stone); }
        
        .chart-container-lux { width: 280px; height: 280px; position: relative; display: flex; align-items: center; justify-content: center; }
        .total-score-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; pointer-events: none; }
        .score-num { display: block; font-family: 'Instrument Serif', serif; font-size: 2.2rem; line-height: 1; color: var(--ink); }
        .score-label { display: block; font-size: 0.5rem; letter-spacing: 0.2em; color: var(--brass); font-weight: 700; margin-top: 5px; }

        .finding-group label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 700; color: var(--brass); display: block; margin-bottom: 15px; }
        .finding-group ul { list-style: none; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: x 40px; }
        .finding-group li { font-size: 0.95rem; color: var(--text-main); padding-bottom: 12px; border-bottom: 1px solid rgba(0,0,0,0.03); margin-bottom: 12px; position: relative; padding-left: 20px; }
        .finding-group li::before { content: '•'; position: absolute; left: 0; color: var(--brass); }
        .finding-group p { font-size: 1rem; line-height: 1.6; color: var(--text-muted); }

        .dossier-actions { display: flex; flex-direction: column; gap: 15px; }
        .btn-lux-primary { background: var(--ink); color: var(--paper); border: none; padding: 20px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: 0.3s; width: 100%; }
        .btn-lux-primary:hover { background: var(--brass); color: var(--ink); }
        .btn-lux-secondary { background: transparent; color: var(--ink); border: 1px solid rgba(0,0,0,0.1); padding: 20px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: 0.3s; width: 100%; }
        .btn-lux-secondary:hover { background: var(--stone); }

        /* Modal LUX */
        .modal-overlay-lux { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(26, 28, 25, 0.95); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 40px; }
        .modal-content-lux { background: var(--paper); width: 100%; max-width: 1200px; height: 90vh; display: flex; flex-direction: column; position: relative; }
        .modal-header-lux { padding: 30px 40px; border-bottom: var(--border-subtle); display: flex; justify-content: space-between; align-items: center; }
        .modal-body-lux { flex: 1; padding: 20px; background: var(--stone); }
        .close-btn-lux { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--ink); }

        /* Skeleton Loading */
        .skeleton { background: var(--paper); border: 1px solid var(--stone); pointer-events: none; }
        .skeleton-line { background: linear-gradient(90deg, var(--stone) 25%, #f5f5f5 50%, var(--stone) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 2px; }
        .skeleton-line.header { width: 100px; height: 15px; margin-bottom: 20px; }
        .skeleton-line.title { width: 60%; height: 40px; margin-bottom: 15px; }
        .skeleton-line.text { width: 40%; height: 20px; margin-bottom: 40px; }
        .skeleton-line.chart { width: 280px; height: 280px; border-radius: 50%; }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 1000px) {
          .reports-grid-lux { grid-template-columns: 1fr; }
          .reports-title-lux { font-size: 3.5rem; }
          .dossier-actions { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .reports-hero-header { margin-bottom: 40px; }
          .reports-title-lux { font-size: 2.8rem; }
          .dossier-report-card { grid-template-columns: 1fr; padding: 30px; gap: 40px; }
          .dossier-right-meta { border-left: none; border-top: 1px solid var(--stone); padding-left: 0; padding-top: 40px; gap: 30px; }
          .dossier-horizontal-stats { grid-template-columns: 1fr; gap: 40px; text-align: center; }
          .score-circle-lux { margin: 0 auto; }
          .finding-group ul { grid-template-columns: 1fr; }
          .dossier-title-text { font-size: 2.2rem; }
          .modal-overlay-lux { padding: 20px; }
        }

        @media (max-width: 480px) {
          .reports-title-lux { font-size: 2.2rem; }
          .dossier-title-text { font-size: 1.8rem; }
          .reports-nav-header { padding: 20px 20px 0 20px; }
          .reports-back-btn { padding: 10px 15px; font-size: 0.7rem; }
        }
      `}</style>
    </div>
  );
}

export default ViewReports;
