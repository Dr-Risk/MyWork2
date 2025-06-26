
import { SignupForm } from "@/components/signup-form";
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center justify-center mb-8">
          <Logo />
          <h1 className="text-4xl font-headline font-bold text-center mt-4">
            Create Account
          </h1>
          <p className="text-muted-foreground text-center mt-2">
            Enter your details to get started with MediTask.
          </p>
        </div>
        <SignupForm />
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
