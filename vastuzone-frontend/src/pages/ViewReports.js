import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { auth } from "../firebase";

function calculateVastuReport(property) {
  let score = 0;
  const warnings = [];
  const tips = [];
  if (["Square", "Rectangle"].includes(property.propertyShape)) {
    score += 10;
  } else {
    score += 4;
    tips.push("Irregular property shapes may disturb energy flow.");
  }
  if (["North", "East", "North-East"].includes(property.facing)) {
    score += 20;
  } else {
    score += 8;
    warnings.push("Property facing is not ideal (North/East/NE preferred).");
  }
  if (["North", "East"].includes(property.entrance)) {
    score += 20;
  } else if (property.entrance === "South") {
    score -= 10;
    warnings.push("Main entrance facing South may affect prosperity.");
  }
  if (["North", "East", "North-East"].includes(property.livingRoomDirection)) {
    score += 10;
  } else {
    score += 5;
    warnings.push("Living room should ideally be in North/East/NE.");
  }
  if (property.kitchenDirection === "South-East") {
    score += 10;
  } else {
    score += 4;
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
  } else {
    score += 5;
    warnings.push("Master bedroom is best located in South-West.");
  }
  if (["West", "North-West"].includes(property.kidsBedroomDirection)) {
    score += 6;
  } else {
    score += 3;
    warnings.push("Kids bedroom should ideally be in West or North-West.");
  }
  if (property.poojaRoomDirection === "North-East") {
    score += 10;
  } else if (["North", "East"].includes(property.poojaRoomDirection)) {
    score += 7;
  } else {
    score += 3;
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
  };
}


function ViewReports() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePdf, setActivePdf] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          console.warn("User not logged in");
          setProperties([]);
          return;
        }

        const res = await fetch(
          `http://localhost:5001/api/properties/user/${user.uid}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch user reports");
        }

        const data = await res.json();
        setProperties(data);
      } catch (err) {
        console.error("❌ Failed to load reports", err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);


  return (
    <div>
      <Navbar />

      <div className="reports-container">
        <h1 className="reports-title">Vastu Reports</h1>
        <p className="reports-subtitle">
          Detailed vastu score, recommendations & floor plan
        </p>

        {loading && <p>Loading reports...</p>}

        {!loading && properties.length === 0 && (
          <p>No reports available yet.</p>
        )}

        <div className="reports-list">
          {properties.map((property) => {
            const report = calculateVastuReport(property);

            return (
              <div className="report-card" key={property._id}>
                <div className="report-header">
                  <h3>{property.propertyName}</h3>
                  <span
                    className="report-band"
                    style={{ backgroundColor: report.bandColor }}
                  >
                    {report.band}
                  </span>
                </div>
                <p><strong>Type:</strong> {property.propertyType}</p>
                <p><strong>City:</strong> {property.city}</p>
                <p><strong>Facing:</strong> {property.facing}</p>
                <div className="score-box">
                  <h2>{report.score}/100</h2>
                  <span>Vastu Score</span>
                </div>
                {report.warnings.length > 0 ? (
                  <div className="warnings-box">
                    <h4>Warnings</h4>
                    <ul>
                      {report.warnings.map((warn, idx) => (
                        <li key={idx}>{warn}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="no-warnings">✅ No major Vastu issues found.</p>
                )}
                {report.tips && report.tips.length > 0 && (
                  <div className="tips-box">
                    <h4>Suggestions</h4>
                    <ul>
                      {report.tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="report-cta">
                  {property.fileUrl && (
                    <button
                      className="view-pdf-btn"
                      onClick={() => setActivePdf(property.fileUrl)}
                    >
                      📄 View Floor Plan
                    </button>
                  )}

                  <button
                    className="consult-btn"
                    onClick={() => navigate("/chat")}
                  >
                    Talk to Astrologer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {activePdf && (
        <div className="pdf-modal-backdrop" onClick={() => setActivePdf(null)}>
          <div
            className="pdf-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pdf-modal-header">
              <h3>Floor Plan</h3>
              <button onClick={() => setActivePdf(null)}>✕</button>
            </div>

            <iframe
              src={activePdf}
              title="Floor Plan PDF"
              width="100%"
              height="100%"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewReports;
