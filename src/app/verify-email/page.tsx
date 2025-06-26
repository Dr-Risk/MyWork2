
import { VerifyEmailForm } from "@/components/verify-email-form";
import { Logo } from "@/components/logo";

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center justify-center mb-8">
          <Logo />
          <h1 className="text-4xl font-headline font-bold text-center mt-4">
            Verify Your Email
          </h1>
          <p className="text-muted-foreground text-center mt-2">
            Enter the code sent to your email to complete registration.
          </p>
        </div>
        <VerifyEmailForm />
      </div>
    </main>
  );
}
