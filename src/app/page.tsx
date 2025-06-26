import { LoginForm } from "@/components/login-form";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center justify-center mb-8">
          <Logo />
          <h1 className="text-4xl font-headline font-bold text-center mt-4">
            MediTask
          </h1>
          <p className="text-muted-foreground text-center mt-2">
            Welcome back! Please log in to your account.
          </p>
        </div>
        <LoginForm />
        <p className="px-8 text-center text-sm text-muted-foreground mt-8">
          <a
            href="/dashboard"
            className="underline underline-offset-4 hover:text-primary"
          >
            Don&apos;t have an account? Skip to dashboard
          </a>
        </p>
      </div>
    </main>
  );
}
