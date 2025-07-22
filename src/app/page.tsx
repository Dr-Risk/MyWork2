
'use client';

import { LoginForm } from "@/components/login-form";
import { MfaLoginCard } from "@/components/mfa-login-card";
import { Logo } from "@/components/logo";
import { useState } from "react";
import type { UserProfile } from "@/lib/auth";

/**
 * @fileoverview Login Page
 * 
 * @description
 * This is the main entry point for unauthenticated users. It displays the
 * company logo, a welcome message, and the login form. It now also handles
 * the second step of the login flow for users who have MFA enabled.
 */
export default function LoginPage() {
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUser, setMfaUser] = useState<Pick<UserProfile, 'username' | 'mfaEnabled'>>();

  /**
   * This function is passed to the LoginForm.
   * If the credential check from the server indicates that MFA is required,
   * this function updates the state to show the MFA input card instead.
   */
  const handleMfaRequired = (user: Pick<UserProfile, 'username' | 'mfaEnabled'>) => {
    setMfaUser(user);
    setMfaRequired(true);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-sm">
        {/* Header section with Logo and page title */}
        <div className="flex flex-col items-center justify-center mb-8">
          <Logo />
          <h1 className="text-4xl font-headline font-bold text-center mt-4">
            PixelForge Nexus
          </h1>
          <p className="text-muted-foreground text-center mt-2">
            {mfaRequired ? 'Enter your verification code.' : 'Welcome back! Please log in to your account.'}
          </p>
        </div>

        {/* Conditionally render either the Login Form or the MFA input card. */}
        {mfaRequired && mfaUser ? (
          <MfaLoginCard user={mfaUser} />
        ) : (
          <LoginForm onMfaRequired={handleMfaRequired} />
        )}

      </div>
    </main>
  );
}
