
'use client';

import type { UserProfile } from '@/lib/auth';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * @fileoverview Authentication Context Provider
 *
 * @description
 * This component provides an authentication context to the entire application,
 * allowing any component to access the current user's state and the login/logout
 * functions without prop drilling. It also handles persisting the user's
 * session in localStorage.
 */

// Define the shape of the authentication context.
interface AuthContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isLoading: boolean;
}

// Create the context with an initial undefined value.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The provider component that wraps the application.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This effect runs once on the client to load the user session from storage.
  useEffect(() => {
    try {
      /**
       * [SECURITY] This application uses localStorage to persist user sessions for
       * demonstration purposes.
       *
       * OWASP Recommendation (A07 - Identification and Authentication Failures):
       * In a production environment, it is strongly recommended to store session tokens
       * in secure, HttpOnly cookies. localStorage is vulnerable to Cross-Site Scripting (XSS)
       * attacks, where a malicious script could access and steal the user's session data.
       * HttpOnly cookies are not accessible to JavaScript, mitigating this risk.
       */
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setUserState(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('currentUser'); // Clear corrupted data
    }
    // Set loading to false once the user has been loaded or not found.
    setIsLoading(false);
  }, []);

  // The function to update the user state and persist it to localStorage.
  const setUser = (user: UserProfile | null) => {
    setUserState(user);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  };

  // Provide the user, setUser function, and loading state to children components.
  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily consume the authentication context.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
