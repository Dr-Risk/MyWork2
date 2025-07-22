
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { checkCredentials } from "@/lib/auth";
import { useAuth } from "@/context/auth-context";

/**
 * @fileoverview Login Form Component
 * 
 * @description
 * This component handles the user login process. It provides a form for users
 * to enter their username and password, validates the input using Zod, and
 * communicates with the mock authentication backend (`/lib/auth.ts`) to verify
 * credentials. It also handles various authentication responses like success,
 * failure, and expired passwords.
 */

/**
 * [SECURITY] This Zod schema defines the validation rules for the login form fields.
 * This client-side validation provides immediate feedback to the user and is the
 * first line of defense. The primary, authoritative validation happens on the server
 * in `src/lib/auth.ts`.
 *
 * Input Validation (OWASP A03 - Injection):
 * - The regex `/^[a-zA-Z0-9_.-]+$/` enforces a strict "allow-list" of characters
 *   for the username, preventing common injection characters like `'`, `=`, or `--`.
 *
 * NIST SP 800-63B on Passwords:
 * - The password validation requires a minimum length of 8 characters but does NOT
 *   enforce complexity (e.g., symbols, numbers). Modern guidelines suggest that
 *   length is a better indicator of strength than character complexity. The most
 *   critical security control is strong, salted hashing on the server.
 */
const formSchema = z.object({
  username: z.string()
    .min(1, { message: "Please enter your username." })
    .regex(/^[a-zA-Z0-9_.-]+$/, "Username can only contain letters, numbers, and `_ . -`"),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth(); // Get the setUser function from the auth context.

  // Initialize the form with react-hook-form and the Zod resolver for validation.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  /**
   * Handles the form submission after successful validation.
   * @param {object} values - The validated form values.
   */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    // Simulate network delay to mimic a real API call.
    await new Promise((resolve) => setTimeout(resolve, 500));

    /**
     * [SECURITY] In a real application, this entire submission must be sent
     * over HTTPS to encrypt the credentials in transit, protecting against
     * man-in-the-middle attacks (OWASP A02 - Cryptographic Failures).
     */
    const response = await checkCredentials(values.username, values.password);
    setIsLoading(false);

    // Handle the different authentication responses from the mock backend.
    switch (response.status) {
      case 'success':
        setUser(response.user); // Update the global auth context with the user's profile.
        toast({
          title: "Login Successful",
          description: "Redirecting to your dashboard...",
        });
        router.push("/dashboard"); // Redirect to the dashboard on success.
        break;
      
      case 'expired':
        toast({
          variant: "destructive",
          title: "Password Expired",
          description: response.message,
        });
        // Redirect to the password change page if the password has expired.
        router.push("/change-password");
        break;

      case 'locked':
      case 'invalid':
        /**
         * [SECURITY] User Enumeration Prevention (OWASP A07).
         * Show a generic failure message for both locked and invalid credentials
         * to prevent an attacker from determining whether a username is valid.
         */
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: response.message,
        });
        break;
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} type="text" />
                  </FormControl>
                  {/*
                    * [SECURITY] Cross-Site Scripting (XSS) Prevention
                    * The error messages displayed by <FormMessage /> are derived from static
                    * strings in the `formSchema`. They do not contain user-generated content,
                    * making them safe from XSS. React would still escape them as a defense-in-depth measure.
                    */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      {...field}
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
