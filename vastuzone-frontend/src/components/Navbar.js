import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import logo from "../assets/logo.png";
import "../styles/navbar.css";

const API_URL = "https://vastuzone-backend.onrender.com";

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${API_URL}/api/users/me/${currentUser.uid}`
        );
        const data = await res.json();
        setRole(data.role); // "user" or "expert"
      } catch (err) {
        console.error("Failed to fetch user role", err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setIsMenuOpen(false);
    navigate("/");
  };

  if (loading) return null; 

  return (
    <div className="navbar">
      <div className="logo-container" onClick={() => navigate("/")}>
        <img src={logo} alt="VastuZone" className="logo-img" />
        <span className="logo-text">VastuZone</span>
      </div>

      <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? "✕" : "☰"}
      </button>

      <div className={`nav-buttons ${isMenuOpen ? "open" : ""}`}>
        {!user ? (
          <>
            <button
              className="login-btn"
              onClick={() => {
                setIsMenuOpen(false);
                navigate("/login");
              }}
            >
              Login
            </button>
            <button
              className="nav-signup-btn"
              onClick={() => {
                setIsMenuOpen(false);
                navigate("/signup");
              }}
            >
              Signup
            </button>
          </>
        ) : (
          <>
            {role === "user" && (
              <button
                className="login-btn"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate("/my-appointments");
                }}
              >
                My Appointments
              </button>
            )}

            {role === "expert" && (
              <button
                className="login-btn"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate("/expert/dashboard");
                }}
              >
                Expert Dashboard
              </button>
            )}

            <span className="nav-user-email">
              {user.email}
            </span>

            <button
              className="nav-signup-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;
