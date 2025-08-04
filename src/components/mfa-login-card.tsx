
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { loginWithMfa, type UserProfile } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

/**
 * @fileoverview MFA Login Card Component
 * @description This component provides the form for the second step of the login
 * process for users who have MFA enabled. It prompts for the 6-digit code
 * from their authenticator app.
 */

// Zod schema to validate the 6-digit TOTP code.
const formSchema = z.object({
  token: z.string().length(6, { message: "Code must be 6 digits." }),
});

interface MfaLoginCardProps {
  user: Pick<UserProfile, 'username' | 'mfaEnabled'>;
}

export function MfaLoginCard({ user }: MfaLoginCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { token: "" },
  });

  const tokenValue = form.watch("token");

  useEffect(() => {
    // When the token reaches 6 characters, automatically submit the form.
    if (tokenValue.length === 6 && formRef.current) {
      // We use a direct submit call on the form element to avoid re-render loops.
      formRef.current.requestSubmit();
    }
  }, [tokenValue]);

  /**
   * Handles the form submission to verify the MFA code.
   * @param {object} values The validated form values.
   */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Prevent multiple submissions while one is in progress.
    if (isLoading) return;
    
    setIsLoading(true);
    const response = await loginWithMfa(user.username, values.token);
    setIsLoading(false);

    if (response.status === 'success') {
      setUser(response.user);
      toast({
        title: "Login Successful",
        description: "You have been securely logged in.",
      });
      router.push("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: response.message,
      });
      form.setError("token", { message: response.message });
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Enter Verification Code</CardTitle>
        <CardDescription>
          Open your authenticator app to view your code.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>6-Digit Code</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="123456" 
                      {...field} 
                      type="text" 
                      autoComplete="one-time-code"
                      maxLength={6}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
