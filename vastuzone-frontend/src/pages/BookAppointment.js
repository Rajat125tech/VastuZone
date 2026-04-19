import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../styles/bookAppointment.css";
import expertPhoto from "../assets/papa.png";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "https://vastuzone-backend.onrender.com";

function BookAppointment() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthReady(true);

      if (u) {
        try {
          await fetch(
            `${API_URL}/api/users/sync`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                firebaseUid: u.uid,
                name: u.displayName || "User",
                email: u.email,
              }),
            }
          );
        } catch (err) {
          console.error("User sync failed:", err);
        }
      }
    });

    return () => unsub();
  }, []);

  const handleConfirm = async () => {
    if (!authReady || !user) {
      alert("User not authenticated yet. Please wait.");
      return;
    }

    if (!date || !slot) {
      alert("Please select date and time slot");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/appointments/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.uid,
            date,
            slot,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create appointment");
        return;
      }

      alert("✅ Appointment created successfully");
      navigate("/my-appointments");

      setDate("");
      setSlot("");
    } catch (err) {
      console.error("Create appointment error:", err);
      alert("Server error while creating appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-page">
      <Navbar />

      <div className="book-nav-header">
        <button className="book-back-btn" onClick={() => navigate("/dashboard")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Go Back
        </button>
      </div>

      <div className="book-card">
        {/* LEFT SIDE: EXPERT PROFILE */}
        <div className="book-left">
          <div className="expert-portrait-container">
            <img src={expertPhoto} alt="Dr. Rajni Kant Srivastava" />
          </div>

          <h2>Dr. Rajni Kant Srivastava</h2>
          <p className="designation">Certified Vastu Consultant</p>

          <p className="bio">
            Expert guidance in scientific spatial audits. We bridge ancient geometric laws with contemporary architectural logic.
          </p>

          <div className="session-info">
            <p><strong>Session:</strong> Private Video Consultation</p>
            <p><strong>Duration:</strong> 60 Minutes Duration</p>
          </div>

          <div className="price-tag">
            <span className="price-label">Reservation Fee</span>
            <span className="price-value">₹299</span>
          </div>
        </div>

        {/* RIGHT SIDE: BOOKING FORM */}
        <div className="book-right">
          <h3>Reserve Session</h3>
          <p className="book-right-subtitle">Select your preferred date and time for the 1:1 consultation.</p>

          <div className="reservation-form">
            <div className="field-group">
              <label>Select Date</label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>Time Slot</label>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
              >
                <option value="">Select a slot</option>
                <option>10:00 – 11:00 AM</option>
                <option>12:00 – 1:00 PM</option>
                <option>4:00 – 5:00 PM</option>
                <option>7:00 – 8:00 PM</option>
              </select>
            </div>

            <button className="confirm-btn" onClick={handleConfirm} disabled={loading}>
              {loading ? "Processing..." : "Confirm Reservation"}
            </button>

            <p className="note">
              Payment confirmation and secure Google Meet credentials will be issued upon successful registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookAppointment;
