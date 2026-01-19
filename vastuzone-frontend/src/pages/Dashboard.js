import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { auth } from "../firebase";
import "../styles/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          console.error("❌ No authenticated user");
          return;
        }

        const res = await fetch(
          `http://localhost:5001/api/properties/user/${user.uid}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch properties");
        }

        const data = await res.json();
        setProperties(data);
      } catch (error) {
        console.error("❌ Failed to fetch properties", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <>
      <Navbar />

      <main className="dashboard-container">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Welcome 👋</h1>
          <p className="dashboard-subtitle">Your Vastu dashboard</p>
        </header>
        <section className="dashboard-actions">
          <div
            className="action-card plan"
            onClick={() => navigate("/add-property")}
          >
            <div className="action-icon">🏠</div>
            <div className="action-content">
              <h3>Submit New Plan</h3>
              <p>Upload your floor plan for vastu analysis</p>
            </div>
          </div>

          <div
            className="action-card reports"
            onClick={() => navigate("/reports")}
          >
            <div className="action-icon">📊</div>
            <div className="action-content">
              <h3>View Reports</h3>
              <p>Check vastu scores along with recommendations for all your properties</p>
            </div>
          </div>

          <div
            className="action-card expert"
            onClick={() => navigate("/chat")}
          >
            <div className="action-icon">🧘‍♂️</div>
            <div className="action-content">
              <h3>Consult Expert</h3>
              <p>Chat and schedule an appointment with our professional Vastu Shastri</p>
            </div>
          </div>
        </section>
        <section className="dashboard-section">
          <h2 className="section-title">Your Submitted Properties</h2>

          {loading && (
            <p className="dashboard-loading">Loading properties…</p>
          )}

          {!loading && properties.length === 0 && (
            <p className="empty-text">
              You haven’t submitted any plans yet.
            </p>
          )}

          {!loading && properties.length > 0 && (
            <div className="property-list">
              {properties.map((property) => (
                <div className="property-card" key={property._id}>
                  <h3 className="property-title">
                    {property.propertyName}
                  </h3>

                  <p><strong>Type:</strong> {property.propertyType}</p>
                  <p><strong>City:</strong> {property.city}</p>
                  <p><strong>Facing:</strong> {property.facing}</p>

                  <div className="property-status">
                    <span className="label">Expert Review:</span>
                    <span
                      className={`status ${
                        property.reviewStatus === "reviewed"
                          ? "reviewed"
                          : "pending"
                      }`}
                    >
                      {property.reviewStatus === "reviewed"
                        ? "Reviewed by Expert"
                        : "Pending Expert Review"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default Dashboard;
