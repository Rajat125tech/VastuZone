import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import logo from "../assets/logo.png";
import "../styles/new.css";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      const res = await fetch("http://localhost:5001/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: user.uid,
          email: user.email,
          name,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create user in database");
      }

      navigate("/login");
    } catch (error) {
      console.error("Signup failed:", error);

      if (error.code === "auth/email-already-in-use") {
        alert("Email already in use");
      } else if (error.code === "auth/weak-password") {
        alert("Password must be at least 6 characters");
      } else {
        alert(error.message);
      }
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="signup-brand">
          <img src={logo} alt="VastuZone Logo" />
          <span>VastuZone</span>
        </div>
        <h2>Create an Account</h2>
        <p className="signup-subtitle">
          Enter your details to get started
        </p>
        <form className="signup-form" onSubmit={handleSignup}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Rajat Srivastava"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="signup-btn">
            Create Account
          </button>
        </form>
        <div className="signup-footer">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>
            Login
          </span>
        </div>
      </div>
    </div>
  );
}

export default Signup;
