import { useState } from "react";
import { auth } from "../firebase";
import "../styles/addProperty.css";

const directions = [
  "North",
  "South",
  "East",
  "West",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];

function AddProperty() {
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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert("User not logged in");
      return;
    }

    try {
      const payload = new FormData();
      payload.append("userId", user.uid);

      Object.entries(formData).forEach(([key, value]) => {
        if (value) payload.append(key, value);
      });

      const res = await fetch("http://localhost:5001/api/properties", {
        method: "POST",
        body: payload,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      alert("✅ Property submitted successfully");
    } catch (err) {
      console.error("❌ Submission error:", err);
      alert("❌ Error submitting property");
    }
  };

  return (
    <div className="ap-page">
      <div className="ap-card">
        <h1>Add Property</h1>
        <p>Upload details for Vastu analysis</p>

        <form className="ap-form" onSubmit={handleSubmit}>
          {/* BASIC */}
          <section className="ap-section">
            <h3>Basic Details</h3>

            <input name="propertyName" placeholder="Property Name" onChange={handleChange} required />
            <input name="city" placeholder="City" onChange={handleChange} required />
            <input name="area" type="number" placeholder="Area (sq ft)" onChange={handleChange} required />

            <select name="propertyType" onChange={handleChange} required>
              <option value="">Property Type</option>
              <option>Flat</option>
              <option>Independent House</option>
              <option>Villa</option>
            </select>

            <select name="purpose" onChange={handleChange} required>
              <option value="">Purpose</option>
              <option>Residential</option>
              <option>Commercial</option>
            </select>

            <select name="propertyShape" onChange={handleChange} required>
              <option value="">Property Shape</option>
              <option>Square</option>
              <option>Rectangle</option>
              <option>Irregular</option>
            </select>
          </section>

          {/* ORIENTATION */}
          <section className="ap-section">
            <h3>Orientation</h3>

            <select name="facing" onChange={handleChange} required>
              <option value="">Facing Direction</option>
              {directions.map(d => <option key={d}>{d}</option>)}
            </select>

            <select name="entrance" onChange={handleChange} required>
              <option value="">Main Entrance</option>
              {directions.map(d => <option key={d}>{d}</option>)}
            </select>
          </section>

          {/* ROOMS */}
          <section className="ap-section">
            <h3>Room Directions</h3>

            <select name="livingRoomDirection" onChange={handleChange}>
              <option value="">Living Room</option>
              {directions.map(d => <option key={d}>{d}</option>)}
            </select>

            <select name="kitchenDirection" onChange={handleChange}>
              <option value="">Kitchen</option>
              {directions.map(d => <option key={d}>{d}</option>)}
            </select>

            <select name="bathroomDirection" onChange={handleChange}>
              <option value="">Bathroom</option>
              {directions.map(d => <option key={d}>{d}</option>)}
            </select>

            <select name="masterBedroomDirection" onChange={handleChange}>
              <option value="">Master Bedroom</option>
              {directions.map(d => <option key={d}>{d}</option>)}
            </select>

            <select name="kidsBedroomDirection" onChange={handleChange}>
              <option value="">Kids Bedroom</option>
              {directions.map(d => <option key={d}>{d}</option>)}
            </select>

            <select name="poojaRoomDirection" onChange={handleChange}>
              <option value="">Pooja Room</option>
              {directions.map(d => <option key={d}>{d}</option>)}
            </select>
          </section>

          {/* FILE */}
          <section className="ap-section">
            <input type="file" name="file" onChange={handleChange} />
            <textarea name="notes" placeholder="Notes for expert" onChange={handleChange} />
          </section>

          <button type="submit">Submit Property</button>
        </form>
      </div>
    </div>
  );
}

export default AddProperty;
