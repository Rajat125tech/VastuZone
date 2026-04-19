import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import logo from "../assets/logo.png";

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail
} from "firebase/auth";

import { auth } from "../firebase";

const API_URL = process.env.REACT_APP_API_URL || "https://vastuzone-backend.onrender.com";

function Login() {
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email address first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset link sent to your email!");
    } catch (error) {
      console.error("Reset Error:", error);
      alert(error.message);
    }
  };

  const syncUserAndNavigate = useCallback(async (user) => {
    if (isSyncing) return;
    setIsSyncing(true);
    setLoading(true);

    console.log("🔄 Syncing user with backend:", user.uid, user.email);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const emailPrefix = user.email ? user.email.split("@")[0] : "User";
      const finalName = user.displayName || emailPrefix;
      
      const res = await fetch(`${API_URL}/api/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firebaseUid: user.uid,
          email: user.email,
          name: finalName,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to sync user");
      }

      const userData = await res.json();
      console.log("✅ Successfully synced. Role:", userData.role);

      if (userData.role === "expert") {
        navigate("/expert/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("❌ Sync Error:", error);
      if (error.name === 'AbortError') {
        alert("Backend is taking too long to respond. Please try again as the server might be waking up.");
      } else {
        alert("Error syncing account: " + error.message);
      }
    } finally {
      setIsSyncing(false);
      setLoading(false);
    }
  }, [isSyncing, navigate]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("👤 Auth state: User logged in", user.email);
        syncUserAndNavigate(user);
      } else {
        console.log("👤 Auth state: No user");
      }
    });

    return () => unsubscribe();
  }, [syncUserAndNavigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      const res = await fetch(
        `${API_URL}/api/users/me/${user.uid}`
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
      setLoading(false);
      console.error("Login Error:", error.code, error.message);
      
      // Smart detection for Google-only accounts
      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          if (methods.includes("google.com") && !methods.includes("password")) {
            alert("This account is linked with Google. Please use the 'Login with Google' button below, or use 'Forgot Password' to set a password for this email.");
            return;
          }
        } catch (err) {
          // Fallback if methods check fails
          console.log("Sign-in methods check bypassed", err);
        }
      }

      alert(error.message || "Login failed");
    }
  };

  const handleGoogleLogin = async () => {
    console.log("🚀 Opening Google Popup...");
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("❌ Popup Error:", error);
      if (error.code !== 'auth/popup-closed-by-user') {
        alert("Google Login Error: " + error.message);
      }
    }
  };

  if (loading || isSyncing) {
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
        <h2 style={{ color: "#2e2c25" }}>Securely logging you in...</h2>
        <p style={{ color: "#7a7468" }}>Syncing your VastuZone profile</p>
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
              <span className="forgot" onClick={handleForgotPassword}>
                Forgot your password?
              </span>
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
