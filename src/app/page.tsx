
import { LoginForm } from "@/components/login-form";
import { Logo } from "@/components/logo";
import Link from "next/link";

/**
 * @fileoverview Login Page
 * 
 * @description
 * This is the main entry point for unauthenticated users. It displays the
 * company logo, a welcome message, the login form, and a link to the signup page.
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-sm">
        {/* Header section with Logo and page title */}
        <div className="flex flex-col items-center justify-center mb-8">
          <Logo />
          <h1 className="text-4xl font-headline font-bold text-center mt-4">
            MediTask
          </h1>
          <p className="text-muted-foreground text-center mt-2">
            Welcome back! Please log in to your account.
          </p>
        </div>

        {/* The main login form component */}
        <LoginForm />

        {/* Link for users who don't have an account yet */}
        <p className="px-8 text-center text-sm text-muted-foreground mt-8">
          <Link
            href="/signup"
            className="underline underline-offset-4 hover:text-primary"
          >
            Don&apos;t have an account? Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}
