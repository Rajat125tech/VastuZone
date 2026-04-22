import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Video, 
  CheckCircle2, 
  CreditCard,
  AlertCircle
} from "lucide-react";
import Navbar from "../components/Navbar";
import Skeleton from "../components/UI/Skeleton";
import EmptyState from "../components/UI/EmptyState";
import { auth } from "../firebase";
import authFetch from "../utils/authFetch";
import "../styles/myAppointments.css";
import loadRazorpay from "../utils/loadRazorpay";

const API_URL = process.env.REACT_APP_API_URL || "https://vastuzone-backend.onrender.com";

function MyAppointments() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', user?.uid],
    queryFn: async () => {
      const res = await authFetch(`${API_URL}/api/appointments/user/${user.uid}`);
      if (!res.ok) throw new Error("Failed to fetch appointments");
      return res.json();
    },
    enabled: !!user,
    onError: (err) => {
      toast.error("Failed to load appointments");
      console.error(err);
    }
  });

  const handlePayment = async (appointmentId, amount) => {
    if (paying) return;
    setPaying(true);

    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error("Razorpay SDK failed to load. Please check your connection.");
      setPaying(false);
      return;
    }

    try {
      const orderRes = await authFetch(
        `${API_URL}/api/appointments/pay/${appointmentId}`,
        { method: "POST" }
      );

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        toast.error(orderData.message || "Payment initiation failed");
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
          const verifyPromise = authFetch(
            `${API_URL}/api/appointments/verify-payment`,
            {
              method: "POST",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                appointmentId,
              }),
            }
          );

          toast.promise(verifyPromise, {
            loading: 'Verifying payment...',
            success: () => {
              queryClient.invalidateQueries(['appointments', user?.uid]);
              return 'Payment successful! Access granted.';
            },
            error: 'Payment verification failed. Please contact support.',
          });
          setPaying(false);
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
      toast.error("Something went wrong during payment");
      setPaying(false);
    }
  };

  return (
    <div className="my-appointments-page">
      <Navbar />

      <div className="ma-nav-header">
        <button className="ma-back-btn" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={18} />
          Go Back
        </button>
      </div>

      <header className="ma-hero">
        <span className="ma-eyebrow">Consultation Portal</span>
        <h1 className="ma-title">My Appointments</h1>
        <p className="ma-subtitle">Review your scheduled consultations and secure access to your expert sessions.</p>
      </header>

      <div className="container">
        {isLoading ? (
          <div className="appointments-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="appointment-card">
                <Skeleton className="h-4 w-24 mb-6" />
                <Skeleton className="h-8 w-3/4 mb-4" />
                <div className="flex gap-4 mb-6">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-12 w-full mt-auto" />
              </div>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Appointments Scheduled"
            description="You don't have any upcoming consultations. Book a session with our experts to harmonize your space."
            actionLabel="Schedule a Session"
            onAction={() => navigate("/book-appointment")}
          />
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
                    <Calendar size={18} className="info-icon" />
                    <span>{appt.appointmentDate}</span>
                  </div>
                  <div className="info-item">
                    <Clock size={18} className="info-icon" />
                    <span>{appt.timeSlot}</span>
                  </div>
                </div>

                <div className="appt-actions">
                  {appt.status === "completed" ? (
                    <div className="completed-note">
                      <CheckCircle2 size={18} />
                      Consultation Finished
                    </div>
                  ) : appt.status === "paid" ? (
                    appt.meetLink ? (
                      <button
                        className="join-btn"
                        onClick={() => window.open(appt.meetLink, "_blank")}
                      >
                        <Video size={18} />
                        Join Secure Meet
                      </button>
                    ) : (
                      <div className="payment-note">
                        <CheckCircle2 size={18} className="text-green-600" />
                        Secured • Awaiting meeting link.
                      </div>
                    )
                  ) : (
                    <button
                      className="pay-btn"
                      disabled={paying}
                      onClick={() => handlePayment(appt._id, appt.amount)}
                    >
                      {paying ? "Processing..." : (
                        <>
                          <CreditCard size={18} />
                          Complete Payment (₹{appt.amount})
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyAppointments;
