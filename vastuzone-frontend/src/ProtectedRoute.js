import { Navigate } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });

    return () => unsub();
  }, []);

  if (!authReady) {
    return <div style={{ padding: 40 }}>Checking authentication…</div>;
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default ProtectedRoute;
