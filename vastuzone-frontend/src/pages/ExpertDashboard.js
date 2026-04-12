import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import authFetch from "../utils/authFetch";
import "../styles/expertDashboard.css";

function ExpertDashboard() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/chat");
        const data = await res.json();
        setChats(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Failed to load chats", err);
        setChats([]);
      } finally {
        setLoadingChats(false);
      }
    };

    fetchChats();
  }, []);
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await authFetch(
          "http://localhost:5001/api/appointments/expert"
        );
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn("⚠️ Appointments unavailable", err);
        setAppointments([]);
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <>
      <Navbar />

      <div className="expert-dashboard">
        <h1>Expert Dashboard</h1>
        <p className="subtitle">Active user consultations</p>
        {loadingChats && <p>Loading chats...</p>}

        {!loadingChats && chats.length === 0 && (
          <p>No consultations yet.</p>
        )}

        <div className="appointments-grid">
          {chats.map((chat) => {
            const lastMessage =
              chat.messages?.length > 0
                ? chat.messages[chat.messages.length - 1].text
                : "No messages yet";

            return (
              <div
                key={chat._id}
                className="dashboard-card"
                onClick={() =>
                  navigate(`/expert/chat/${chat.userId}`)
                }
              >
                <strong>{chat.userName || "Unknown User"}</strong>
                <p className="last-message">{lastMessage}</p>
                <span className="updated">
                  Updated: {new Date(chat.updatedAt).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
        <h2 className="section-title">Upcoming Appointments</h2>
        <p className="subtitle">Live consultations scheduled</p>

        {loadingAppointments && <p>Loading appointments...</p>}

        {!loadingAppointments && appointments.length === 0 && (
          <p>No upcoming appointments.</p>
        )}

        <div className="card-grid">
          {appointments.map((appt) => (
            <div key={appt._id} className="dashboard-card appointment">
              <strong>{appt.userName || "Unknown User"}</strong>

              <p>
                📅 {appt.appointmentDate}
                <br />
                ⏰ {appt.timeSlot}
              </p>
              <input
                type="text"
                placeholder="Paste Google Meet link"
                defaultValue={appt.meetLink}
                onBlur={async (e) => {
                  const link = e.target.value.trim();
                  if (!link) return;

                  try {
                    await authFetch(
                      `http://localhost:5001/api/appointments/expert/${appt._id}/meet-link`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ meetLink: link }),
                      }
                    );
                  } catch (err) {
                    alert("Failed to save meet link");
                  }
                }}
                className="meet-input"
              />
            </div>
          ))}

        </div>
      </div>
    </>
  );
}

export default ExpertDashboard;
