
import { VerifyEmailForm } from "@/components/verify-email-form";
import { Logo } from "@/components/logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

/**
 * @fileoverview Email Verification Page
 * 
 * @description
 * This page is part of the user registration flow. After a user signs up,
 * they are directed here to enter a verification code, which would typically
 * be sent to their email. For this demo, a static code is used.
 */
export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-sm">
        {/* Header section with Logo and page title */}
        <div className="flex flex-col items-center justify-center mb-8">
          <Logo />
          <h1 className="text-4xl font-headline font-bold text-center mt-4">
            Verify Your Email
          </h1>
          <p className="text-muted-foreground text-center mt-2">
            Enter the code sent to your email to complete registration.
          </p>
        </div>
        
        {/* An informational alert providing the demo verification code */}
        <Alert className="mb-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Developer Note</AlertTitle>
          <AlertDescription>
            This is a demo. Use the code <code className="font-bold text-foreground">123456</code> to proceed.
          </AlertDescription>
        </Alert>
        
        {/* The form for entering the verification code */}
        <VerifyEmailForm />
      </div>
    </main>
  );
}
