import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { auth } from "../firebase";
import "../styles/myAppointments.css";
import loadRazorpay from "../utils/loadRazorpay";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const fetchAppointments = async () => {
      try {
        const res = await fetch(
          `http://localhost:5001/api/appointments/user/${user.uid}`
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

    fetchAppointments();
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
        `http://localhost:5001/api/appointments/pay/${appointmentId}`,
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
            "http://localhost:5001/api/appointments/verify-payment",
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
    <>
      <Navbar />

      <div className="my-appointments-page">
        <h1>My Appointments</h1>
        <p className="subtitle">Your scheduled and past consultations</p>

        {loading && <p>Loading appointments...</p>}

        {!loading && appointments.length === 0 && (
          <p className="no-appointments">No appointments booked yet.</p>
        )}

        <div className="appointments-grid">
          {appointments.map((appt) => (
            <div key={appt._id} className="appointment-card">
              <h3>{appt.userName || "You"}</h3>

              <div className="appointment-info">
                📅 {appt.appointmentDate} <br />
                ⏰ {appt.timeSlot}
              </div>

              <span
                className={`status ${
                  appt.status === "paid"
                    ? "paid"
                    : appt.status === "completed"
                    ? "completed"
                    : "pending"
                }`}
              >
                {appt.status.replace("_", " ")}
              </span>

              {appt.status === "paid" ? (
                appt.meetLink ? (
                  <button
                    className="join-btn"
                    onClick={() => window.open(appt.meetLink, "_blank")}
                  >
                    Join Google Meet
                  </button>
                ) : (
                  <p className="payment-note">
                    ⏳ Payment confirmed — waiting for expert to add meeting link.
                  </p>
                )
              ) : (
                <button
                  className="pay-btn"
                  disabled={paying}
                  onClick={() => handlePayment(appt._id, appt.amount)}
                >
                  {paying ? "Processing..." : `Pay ₹${appt.amount}`}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default MyAppointments;
