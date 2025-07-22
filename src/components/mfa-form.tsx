
"use client";

import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";
import { setupMfa, confirmMfa, disableMfa } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";

// Zod schema for the 6-digit verification code.
const formSchema = z.object({
  token: z.string().length(6, "Code must be 6 digits."),
});

/**
 * @fileoverview MFA Management Form
 * @description This component handles the UI and logic for a user to enable,
 * verify, and disable Time-based One-Time Password (TOTP) Multi-Factor Authentication.
 */
export function MfaForm() {
  const { user, setUser, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  
  // Component state management
  const [isLoading, setIsLoading] = useState(false);
  const [setupData, setSetupData] = useState<{ qrCodeDataUrl: string; secret: string } | null>(null);

  // Initialize the form for the verification step.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { token: "" },
  });

  /**
   * Starts the MFA setup process by calling the backend to get a QR code.
   */
  const handleEnableMfa = async () => {
    if (!user) return;
    setIsLoading(true);
    const response = await setupMfa(user.username);
    if (response.success && response.data) {
      setSetupData(response.data);
      toast({ title: "Scan the QR Code", description: "Scan the QR code with your authenticator app." });
    } else {
      toast({ variant: "destructive", title: "Setup Failed", description: response.message });
    }
    setIsLoading(false);
  };

  /**
   * Verifies the TOTP code from the user's app to finalize MFA setup.
   */
  const handleConfirmMfa = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    setIsLoading(true);
    const response = await confirmMfa(user.username, values.token);
    if (response.success && response.user) {
      setUser(response.user); // Update global user state
      setSetupData(null); // Clear setup data
      toast({ title: "MFA Enabled!", description: "MFA has been successfully enabled on your account." });
    } else {
      form.setError("token", { message: response.message });
      toast({ variant: "destructive", title: "Verification Failed", description: response.message });
    }
    setIsLoading(false);
  };

  /**
   * Disables MFA for the user's account.
   */
  const handleDisableMfa = async () => {
    if (!user) return;
    setIsLoading(true);
    const response = await disableMfa(user.username);
    if (response.success && response.user) {
      setUser(response.user);
      toast({ title: "MFA Disabled", description: "MFA has been removed from your account." });
    } else {
      toast({ variant: "destructive", title: "Failed to Disable MFA", description: response.message });
    }
    setIsLoading(false);
  };

  // Show a skeleton loader while auth status is being determined.
  if (isAuthLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  // If the user is in the process of setting up MFA, show the QR code and verification form.
  if (setupData) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Scan the image below with your authenticator app (e.g., Google Authenticator), then enter the 6-digit code to complete the setup.
        </p>
        <div className="flex justify-center p-4 bg-white rounded-md">
            <Image
                src={setupData.qrCodeDataUrl}
                alt="MFA QR Code"
                width={200}
                height={200}
                data-ai-hint="qr code"
            />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleConfirmMfa)} className="space-y-4">
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input placeholder="123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setSetupData(null)}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify & Enable MFA
                </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }

  // The main view: shows whether MFA is enabled and provides the option to enable/disable it.
  return (
    <div className="space-y-4">
      {user?.mfaEnabled ? (
        <>
          <p className="text-sm text-green-500 font-medium">MFA is currently enabled on your account.</p>
          <p className="text-sm text-muted-foreground">
            Disabling MFA will reduce your account's security.
          </p>
          <Button variant="destructive" onClick={handleDisableMfa} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Disable MFA
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            MFA is not enabled. Click the button below to start the setup process.
          </p>
          <Button onClick={handleEnableMfa} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enable MFA
          </Button>
        </>
      )}
    </div>
  );
}
