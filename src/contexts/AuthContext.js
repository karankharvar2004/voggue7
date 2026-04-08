import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const ADMIN_EMAIL = "karankharvar2004@gmail.com";

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function register({ email, password, name, phone }) {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const profile = { 
      uid: res.user.uid, 
      name, 
      email, 
      phone, 
      role: email === ADMIN_EMAIL ? "admin" : "user", 
      createdAt: new Date().toISOString() 
    };
    await setDoc(doc(db, "users", res.user.uid), profile);
    return res;
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function changePassword(newPassword) {
    if (!auth.currentUser) return Promise.reject("No user logged in");
    return updatePassword(auth.currentUser, newPassword);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const docSnap = await getDoc(doc(db, "users", user.uid));
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            // Fallback for users created directly in Firebase Console
            setUserProfile({ 
              uid: user.uid,
              email: user.email, 
              role: user.email === ADMIN_EMAIL ? "admin" : "user" 
            });
          }
        } catch (e) {
          console.error("Error fetching user profile:", e);
          setUserProfile({ email: user.email, role: user.email === ADMIN_EMAIL ? "admin" : "user" });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const isAdmin = userProfile?.role === "admin" || currentUser?.email === ADMIN_EMAIL;

  const value = {
    currentUser,
    userProfile,
    isAdmin,
    register,
    login,
    logout,
    resetPassword,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
