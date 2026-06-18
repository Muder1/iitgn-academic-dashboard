import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, provider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // The Login Function
  const login = async (admissionYear, discipline) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 1. Client-Side Domain Check
      if (!user.email.endsWith('@iitgn.ac.in')) {
        await signOut(auth);
        throw new Error('Access restricted to @iitgn.ac.in email addresses.');
      }

      // 2. Get the secure token
      const token = await user.getIdToken();

      // 3. Sync with our PostgreSQL Backend
      await axios.post('http://localhost:5000/api/auth/sync', 
        { admissionYear, discipline },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return user;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => signOut(auth);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Only set user if they pass the domain check
      if (user && user.email.endsWith('@iitgn.ac.in')) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};