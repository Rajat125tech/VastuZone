import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "../components/Navbar";
import { auth } from "../firebase";
import "../styles/myAppointments.css";
import loadRazorpay from "../utils/loadRazorpay";

const API_URL = "https://vastuzone-backend.onrender.com";

function MyAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchAppointments(user.uid);
      } else {
        setLoading(false);
      }
    });

    const fetchAppointments = async (uid) => {
      try {
        const res = await fetch(
          `${API_URL}/api/appointments/user/${uid}`
        );
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Failed to load appointments", err);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    return () => unsubscribe();
  }, []);

  const handlePayment = async (appointmentId, amount) => {
    if (paying) return;

    setPaying(true);

    const loaded = await loadRazorpay();
    if (!loaded) {
      alert("Razorpay SDK failed to load");
      setPaying(false);
      return;
    }

    try {
      const orderRes = await fetch(
        `${API_URL}/api/appointments/pay/${appointmentId}`,
        { method: "POST" }
      );

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        alert(orderData.message || "Payment initiation failed");
        setPaying(false);
        return;
      }
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "VastuZone",
        description: "Vastu Consultation",

        handler: async function (response) {
          const verifyRes = await fetch(
            `${API_URL}/api/appointments/verify-payment`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                appointmentId,
              }),
            }
          );

          if (verifyRes.ok) {
            alert("✅ Payment successful");
            window.location.reload();
          } else {
            alert("❌ Payment verification failed");
          }
        },

        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Something went wrong during payment");
      setPaying(false);
    }
  };

  return (
    <div className="my-appointments-page">
      <Navbar />

      <div className="ma-nav-header">
        <button className="ma-back-btn" onClick={() => navigate("/dashboard")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Go Back
        </button>
      </div>

      <header className="ma-hero">
        <span className="ma-eyebrow">Consultation Portal</span>
        <h1 className="ma-title">My Appointments</h1>
        <p className="ma-subtitle">Review your scheduled consultations and secure access to your expert sessions.</p>
      </header>

      {loading ? (
        <div className="no-appointments">
          <p>Retrieving your consultation data...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="no-appointments">
          <p>You have no scheduled consultations at this time.</p>
          <button className="ma-back-btn" style={{margin: '0 auto'}} onClick={() => navigate("/book-appointment")}>Book a Session</button>
        </div>
      ) : (
        <div className="appointments-grid">
          {appointments.map((appt) => (
            <div key={appt._id} className="appointment-card">
              <div className="appt-header">
                <span className="appt-id">REF #{appt._id.slice(-6).toUpperCase()}</span>
                <span className={`status-tag ${appt.status}`}>
                  {appt.status.replace("_", " ")}
                </span>
              </div>

              <h3>{appt.userName || "Expert Consultation"}</h3>

              <div className="appointment-info">
                <div className="info-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>{appt.appointmentDate}</span>
                </div>
                <div className="info-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <span>{appt.timeSlot}</span>
                </div>
              </div>

              <div className="appt-actions">
                {appt.status === "paid" ? (
                  appt.meetLink ? (
                    <button
                      className="join-btn"
                      onClick={() => window.open(appt.meetLink, "_blank")}
                    >
                      Join Secure Meet
                    </button>
                  ) : (
                    <div className="payment-note">
                      Secured • Awaiting meeting link from expert.
                    </div>
                  )
                ) : (
                  <button
                    className="pay-btn"
                    disabled={paying}
                    onClick={() => handlePayment(appt._id, appt.amount)}
                  >
                    {paying ? "Processing..." : `Complete Payment (₹${appt.amount})`}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyAppointments;
