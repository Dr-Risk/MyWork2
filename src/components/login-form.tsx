
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
 * to enter their username and password, validates the input, and communicates
 * with the mock authentication backend (`/lib/auth.ts`) to verify credentials.
 */

// This schema defines the validation rules for the login form fields
// using Zod. It ensures that the data has a valid format before submission.
const formSchema = z.object({
  username: z.string()
    .min(1, { message: "Please enter your username." })
    // Basic regex to prevent obviously malicious input, though server-side validation is key.
    .regex(/^[a-zA-Z0-9_.-]+$/, "Username contains invalid characters."),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth(); // Get the setUser function from the auth context.

  // Initialize the form with react-hook-form and Zod resolver.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // This function is called when the form is submitted.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    // Simulate network delay to mimic a real API call.
    await new Promise((resolve) => setTimeout(resolve, 500));

    /**
     * [SECURITY] In a real application, this entire submission must be sent
     * over HTTPS to encrypt the credentials in transit, protecting against
     * man-in-the-middle attacks.
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
        // Show a generic failure message for locked or invalid credentials
        // to prevent user enumeration attacks.
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
