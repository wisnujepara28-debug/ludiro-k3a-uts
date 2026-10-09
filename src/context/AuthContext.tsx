import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isAdminModeActive: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  toggleAdminMode: (passcode?: string) => boolean;
  setAdminModeActive: (active: boolean) => void;
  adminEmail: string;
}

const ADMIN_EMAIL = 'wisnujepara28@gmail.com';
const ADMIN_PASSCODE = 'admin123';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminModeActive, setIsAdminModeActive] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      // Auto-activate admin mode if logged in with the official admin email
      if (currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setIsAdminModeActive(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign In error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsAdminModeActive(false);
    } catch (error) {
      console.error('Sign Out error:', error);
      throw error;
    }
  };

  const toggleAdminMode = (passcode?: string): boolean => {
    if (isAdminModeActive) {
      setIsAdminModeActive(false);
      return false;
    }

    // Direct access if logged in as admin email
    if (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setIsAdminModeActive(true);
      return true;
    }

    // Verify passcode for fast testing
    if (passcode === ADMIN_PASSCODE || passcode === 'admin') {
      setIsAdminModeActive(true);
      return true;
    }

    return false;
  };

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || isAdminModeActive;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isAdminModeActive,
        loading,
        loginWithGoogle,
        logout,
        toggleAdminMode,
        setAdminModeActive: setIsAdminModeActive,
        adminEmail: ADMIN_EMAIL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
