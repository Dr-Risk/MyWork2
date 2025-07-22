
import { SignupForm } from "@/components/signup-form";
import { Logo } from "@/components/logo";
import Link from "next/link";

/**
 * @fileoverview Signup Page
 * 
 * @description
 * This page allows new users to create an account. It presents the signup form
 * and provides a link for existing users to navigate back to the login page.
 */
export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-sm">
        {/* Header section with Logo and page title */}
        <div className="flex flex-col items-center justify-center mb-8">
          <Logo />
          <h1 className="text-4xl font-headline font-bold text-center mt-4">
            Create Account
          </h1>
          <p className="text-muted-foreground text-center mt-2">
            Enter your details to get started with PixelForge Nexus.
          </p>
        </div>
        
        {/* The main signup form component */}
        <SignupForm />

        {/* Link for users who already have an account */}
        <p className="px-8 text-center text-sm text-muted-foreground mt-8">
          <Link
            href="/"
            className="underline underline-offset-4 hover:text-primary"
          >
            Already have an account? Log In
          </Link>
        </p>
      </div>
    </main>
  );
}
