import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  createUserWithEmailAndPassword
} from "firebase/auth";
import { auth } from "../firebase";
import logo from "../assets/logo.png";
import Navbar from "../components/Navbar";

const API_URL = process.env.REACT_APP_API_URL || "https://vastuzone-backend.onrender.com";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(`${API_URL}/api/users/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: user.uid,
          email: user.email,
          name,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error("Failed to create user in database");
      }

      alert("Account created successfully! Please login.");
      navigate("/login");
    } catch (error) {
      console.error("Signup failed:", error);
      setLoading(false);

      if (error.code === "auth/email-already-in-use") {
        alert("Email already in use");
      } else if (error.code === "auth/weak-password") {
        alert("Password must be at least 6 characters");
      } else if (error.name === 'AbortError') {
        alert("Initializing Secure Connection... The system is waking up to prepare your environment. Please remain on this page.");
      } else {
        alert(error.message);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ 
        height: "100vh", 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center",
        background: "#f7f6dc",
        fontFamily: "Inter, sans-serif"
      }}>
        <div className="loading-spinner" style={{
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #bdb488",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          animation: "spin 1s linear infinite",
          marginBottom: "20px"
        }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <h2 style={{ color: "#2e2c25" }}>Creating your account...</h2>
        <p style={{ color: "#7a7468" }}>Setting up your VastuZone profile</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="auth-container">
        <div className="auth-card">
          <div className="brand">
            <img src={logo} alt="VastuZone Logo" />
            <span>VastuZone</span>
          </div>
          <h2>Create an Account</h2>
          <p className="subtitle">
            Join VastuZone to harmonize your living space
          </p>
          <form className="auth-form" onSubmit={handleSignup}>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Rajat"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="primarly-btn">
              Create Account
            </button>
          </form>
          <p className="auth-footer">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
