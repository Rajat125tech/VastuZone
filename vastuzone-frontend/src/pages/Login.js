import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import logo from "../assets/logo.png";

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

import { auth } from "../firebase";

function Login() {
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      const res = await fetch(
        `http://localhost:5001/api/users/me/${user.uid}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch user role");
      }

      const userData = await res.json();

      if (userData.role === "expert") {
        navigate("/expert/dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      console.error(error);
      alert(error.message || "Login failed");
    }
  };
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await fetch("http://localhost:5001/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
        }),
      });
      await fetch("http://localhost:5001/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firebaseUid: user.uid,
          email: user.email,
        }),
      });

      const res = await fetch(
        `http://localhost:5001/api/users/me/${user.uid}`
      );

      const userData = await res.json();

      if (userData.role === "expert") {
        navigate("/expert/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };


  return (
    <div>
      <Navbar />

      <div className="auth-container">
        <div className="auth-card">

          <div className="brand">
            <img src={logo} alt="VastuZone Logo" />
            <span>VastuZone</span>
          </div>

          <h2>Welcome Back</h2>
          <p className="subtitle">
            Enter your credentials to access your account
          </p>

          <form className="auth-form" onSubmit={handleLogin}>
            <label>Email</label>
            <input
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="password-row">
              <label>Password</label>
              <span className="forgot">Forgot your password?</span>
            </div>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" className="primarly-btn">
              Login
            </button>

            <button
              type="button"
              className="google-btn"
              onClick={handleGoogleLogin}
            >
              Login with Google
            </button>
          </form>

          <p className="auth-footer">
            Don’t have an account?{" "}
            <span onClick={() => navigate("/signup")}>Sign up</span>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;
