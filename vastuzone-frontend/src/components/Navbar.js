import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import logo from "../assets/logo.png";
import "../styles/navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); 
  const [loading, setLoading] = useState(true);

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
          `http://localhost:5001/api/users/me/${currentUser.uid}`
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
    navigate("/");
  };

  if (loading) return null; 

  return (
    <div className="navbar">
      <div className="logo-container" onClick={() => navigate("/")}>
        <img src={logo} alt="VastuZone" className="logo-img" />
        <span className="logo-text">VastuZone</span>
      </div>

      <div className="nav-buttons">
        {!user ? (
          <>
            <button
              className="login-btn"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className="nav-signup-btn"
              onClick={() => navigate("/signup")}
            >
              Signup
            </button>
          </>
        ) : (
          <>
            {role === "user" && (
              <button
                className="login-btn"
                onClick={() => navigate("/my-appointments")}
              >
                My Appointments
              </button>
            )}

            <span style={{ marginRight: "16px", fontSize: "14px" }}>
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
