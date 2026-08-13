import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(null); // users/{uid} doc: { name, email, role }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setFirebaseUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    if (!firebaseUser) {
      setProfile(null);
      return;
    }
    const ref = doc(db, "users", firebaseUser.uid);
    const unsub = onSnapshot(ref, (snap) => {
      setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
    return unsub;
  }, [firebaseUser]);

  const loading = firebaseUser === undefined || (firebaseUser && profile === null);

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
