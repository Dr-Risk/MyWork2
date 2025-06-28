
'use client';

import type { UserProfile } from '@/lib/auth';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * @fileoverview Authentication Context Provider
 *
 * @description
 * This component establishes a React Context to manage and provide authentication
 * state throughout the application. It allows any component within its scope to
 * access the current user's profile, a function to update the user's state (login/logout),
 * and a loading status without "prop drilling" (passing props down through many levels).
 * It also handles persisting the user's session in the browser's localStorage.
 */

// Define the shape of the data that the authentication context will provide.
interface AuthContextType {
  user: UserProfile | null; // The current user's profile or null if not logged in.
  setUser: (user: UserProfile | null) => void; // Function to set the user (login/logout).
  isLoading: boolean; // A flag to indicate if the initial session load is in progress.
}

// Create the context with an initial undefined value. This helps catch errors
// if a component tries to use the context without being wrapped in the provider.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The provider component that will wrap the application or parts of it.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // `useState` to hold the current user's profile.
  const [user, setUserState] = useState<UserProfile | null>(null);
  // `useState` to track the loading state. It starts as true.
  const [isLoading, setIsLoading] = useState(true);

  // This `useEffect` hook runs once on the client-side when the component mounts.
  // Its purpose is to check for a persisted user session in localStorage.
  useEffect(() => {
    try {
      /**
       * [SECURITY] Session Management (OWASP A07 - Identification and Authentication Failures)
       *
       * This application uses localStorage to persist user sessions for demonstration purposes.
       * In a production environment, this is NOT RECOMMENDED.
       *
       * The Problem with localStorage:
       * localStorage is accessible via JavaScript on the same domain. This makes it vulnerable
       * to Cross-Site Scripting (XSS) attacks. If an attacker can inject a malicious script
       * onto your site, they can read the contents of localStorage and steal the user's
       * session token, allowing them to impersonate the user.
       *
       * The Recommended Solution: HttpOnly Cookies
       * The best practice is to store session tokens in secure, HttpOnly cookies.
       * - `HttpOnly`: This flag prevents the cookie from being accessed by client-side JavaScript,
       *   mitigating the risk of XSS attacks stealing the token.
       * - `Secure`: This flag ensures the cookie is only sent over HTTPS, preventing it from being
       *   intercepted in transit.
       * - `SameSite`: This attribute helps prevent Cross-Site Request Forgery (CSRF) attacks.
       */
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        // If a user is found in storage, parse it and set it as the current user.
        setUserState(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('currentUser'); // Clear any corrupted data.
    }
    // Set loading to false once the user has been loaded (or confirmed not to exist).
    setIsLoading(false);
  }, []); // The empty dependency array `[]` ensures this effect runs only once.

  // This function wraps the state setter to also handle persistence.
  const setUser = (user: UserProfile | null) => {
    setUserState(user);
    if (user) {
      // If a user is being set (login), store their profile in localStorage.
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      // If the user is being set to null (logout), remove their profile from localStorage.
      localStorage.removeItem('currentUser');
    }
  };

  // The `value` prop of the Provider makes the user state, setter function, and loading state
  // available to all descendant components that use the `useAuth` hook.
  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily consume the authentication context in other components.
export const useAuth = () => {
  const context = useContext(AuthContext);
  // If a component tries to use this hook outside of an AuthProvider,
  // it will throw an error, which helps catch bugs early.
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
