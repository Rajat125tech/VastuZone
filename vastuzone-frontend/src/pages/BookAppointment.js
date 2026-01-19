import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../styles/bookAppointment.css";
import expertPhoto from "../assets/papa.png";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function BookAppointment() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
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
        "http://localhost:5001/api/appointments/create",
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

      alert(
        "✅ Appointment created successfully"
      );
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
    <>
      <Navbar />

      <div className="book-page">
        <div className="book-card">

          {/* LEFT */}
          <div className="book-left">
            <img src={expertPhoto} alt="Vastu Expert" />

            <h2>Dr. Rajni Kant Srivastava</h2>
            <p className="designation">Certified Vastu Consultant</p>

            <p className="bio">
              With decades of experience in Vastu Shastra, personalized guidance
              is provided to ensure harmony, prosperity, and positive energy.
            </p>

            <div className="session-info">
              <p><strong>Session:</strong> Video Consultation</p>
              <p><strong>Duration:</strong> Up to 60 minutes</p>
              <p className="price">₹299</p>
            </div>
          </div>

          <div className="book-right">
            <h3>Book Your Appointment</h3>

            <label>Select Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <label>Select Time Slot</label>
            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
            >
              <option value="">Select</option>
              <option>10:00 – 11:00 AM</option>
              <option>12:00 – 1:00 PM</option>
              <option>4:00 – 5:00 PM</option>
              <option>7:00 – 8:00 PM</option>
            </select>

            <button onClick={handleConfirm} disabled={loading}>
              {loading ? "Saving..." : "Confirm Appointment"}
            </button>

            <p className="note">
              Google Meet link will be shared after payment confirmation.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}

export default BookAppointment;
