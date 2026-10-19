import React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  setMockUser: (user: any | null) => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, setMockUser: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [mockUser, setMockUserState] = useState<any | null>(() => {
    const saved = localStorage.getItem('mock_user');
    return saved ? JSON.parse(saved) : null;
  });

  const setMockUser = async (mockData: any | null) => {
    if (mockData) {
      localStorage.setItem('mock_user', JSON.stringify(mockData));
      setMockUserState(mockData);
      
      try {
        const cred = await signInAnonymously(auth);
        // Create user doc for real rules to pass
        await setDoc(doc(db, 'users', cred.user.uid), {
          ...mockData,
          uid: cred.user.uid,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        
        setUser({ ...mockData, uid: cred.user.uid });
      } catch (err: any) {
        if (err.code === 'auth/admin-restricted-operation') {
          console.warn("Anonymous Auth is disabled in Firebase Console. Database features will be unavailable for mock users.");
        } else {
          console.error("Mock login auth error:", err);
        }
        setUser(mockData);
      }
    } else {
      localStorage.removeItem('mock_user');
      setMockUserState(null);
      await auth.signOut().catch(() => {});
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (mockUser) {
          setUser({ ...mockUser, uid: firebaseUser.uid });
        } else {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ ...firebaseUser, ...userDoc.data() });
          } else {
            setUser(firebaseUser);
          }
        }
      } else {
        if (mockUser && !user) {
          setUser(mockUser);
        } else if (!mockUser) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [mockUser, user]);

  return (
    <AuthContext.Provider value={{ user, loading, setMockUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
