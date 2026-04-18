import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import Navbar from "../components/Navbar";
import "../styles/addProperty.css";

const directions = [
  "North", "South", "East", "West",
  "North-East", "North-West", "South-East", "South-West",
];

const propertyTypes = ["Flat", "Independent House", "Villa", "Plot", "Office", "Shop", "Factory"];
const purposes = ["Residential", "Commercial", "Industrial"];
const shapes = ["Square", "Rectangle", "Irregular", "L-Shape", "U-Shape"];

const API_URL = "https://vastuzone-backend.onrender.com";

function AddProperty() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    propertyName: "",
    propertyType: "",
    purpose: "",
    city: "",
    area: "",
    propertyShape: "",
    facing: "",
    entrance: "",
    livingRoomDirection: "",
    kitchenDirection: "",
    bathroomDirection: "",
    masterBedroomDirection: "",
    kidsBedroomDirection: "",
    poojaRoomDirection: "",
    notes: "",
    file: null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const user = auth.currentUser;
    if (!user) {
      alert("Please login to submit property details.");
      setLoading(false);
      return;
    }

    try {
      const payload = new FormData();
      payload.append("userId", user.uid);
      Object.entries(formData).forEach(([key, value]) => {
        if (value) payload.append(key, value);
      });

      const res = await fetch(`${API_URL}/api/properties`, {
        method: "POST",
        body: payload,
      });

      if (!res.ok) throw new Error(await res.text());

      alert("✅ Property details submitted successfully.");
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Submission error:", err);
      alert("❌ Failed to submit property.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ap-container">
      <Navbar />

      <div className="ap-nav-header">
        <button className="ap-back-btn" onClick={() => navigate("/dashboard")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Go Back
        </button>
      </div>

      <header className="ap-hero">
        <div className="ap-hero-content">
          <span className="ap-eyebrow">Property Analysis</span>
          <h1 className="ap-title">Register Your Space.</h1>
          <p className="ap-subtitle">
            Provide the architectural details of your property for a comprehensive scientific Vastu audit.
          </p>
        </div>
      </header>

      <main className="ap-form-wrapper">
        <form className="ap-form" onSubmit={handleSubmit}>
          
          {/* 1. IDENTITY & TYPE */}
          <section className="ap-form-section">
            <div className="ap-section-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              <h3>Core Identification</h3>
            </div>
            <div className="ap-grid">
              <div className="ap-field">
                <label>Property Name</label>
                <input name="propertyName" placeholder="e.g. Skyline Residency" onChange={handleChange} required />
              </div>
              <div className="ap-field">
                <label>City / Location</label>
                <input name="city" placeholder="e.g. Lucknow" onChange={handleChange} required />
              </div>
              <div className="ap-field">
                <label>Property Type</label>
                <select name="propertyType" onChange={handleChange} required>
                  <option value="">Select Type</option>
                  {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="ap-field">
                <label>Primary Purpose</label>
                <select name="purpose" onChange={handleChange} required>
                  <option value="">Select Purpose</option>
                  {purposes.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* 2. SPECIFICATIONS */}
          <section className="ap-form-section">
            <div className="ap-section-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <h3>Spatial Specifications</h3>
            </div>
            <div className="ap-grid">
              <div className="ap-field">
                <label>Total Area (sq ft)</label>
                <input name="area" type="number" placeholder="e.g. 1250" onChange={handleChange} required />
              </div>
              <div className="ap-field">
                <label>Plot / Property Shape</label>
                <select name="propertyShape" onChange={handleChange} required>
                  <option value="">Select Shape</option>
                  {shapes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="ap-field">
                <label>Facing Direction</label>
                <select name="facing" onChange={handleChange} required>
                  <option value="">Main Orientation</option>
                  {directions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="ap-field">
                <label>Main Entrance</label>
                <select name="entrance" onChange={handleChange} required>
                  <option value="">Entrance Door Facing</option>
                  {directions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* 3. INTERNAL MAPPING */}
          <section className="ap-form-section">
            <div className="ap-section-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
              <h3>Internal Mapping</h3>
            </div>
            <div className="ap-grid">
              {["Living Room", "Kitchen", "Master Bedroom", "Bathroom", "Kids Bedroom", "Pooja Room"].map((room) => (
                <div className="ap-field" key={room}>
                  <label>{room}</label>
                  <select name={`${room.toLowerCase().replace(" ", "")}Direction`} onChange={handleChange}>
                    <option value="">Select Direction</option>
                    {directions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </section>

          {/* 4. DOCUMENTATION */}
          <section className="ap-form-section">
            <div className="ap-section-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <h3>Documentation & Notes</h3>
            </div>
            <div className="ap-field">
              <label>Property Layout / Map</label>
              <label className="ap-upload-zone">
                <div className="ap-upload-icon">↑</div>
                <span className="ap-upload-text">
                  {formData.file ? formData.file.name : "Upload Floor Plan or Map"}
                </span>
                <span className="ap-upload-subtext">Supports PDF, JPG, PNG (Max 5MB)</span>
                <input type="file" name="file" className="ap-file-input" onChange={handleChange} />
              </label>
            </div>
            <div className="ap-field" style={{marginTop: '20px'}}>
              <label>Additional Observations</label>
              <textarea name="notes" placeholder="Describe any specific concerns..." onChange={handleChange} />
            </div>
          </section>

          <div className="ap-actions">
            <button type="submit" className="ap-submit-btn" disabled={loading}>
              {loading ? "Processing..." : "Submit for Audit"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AddProperty;
