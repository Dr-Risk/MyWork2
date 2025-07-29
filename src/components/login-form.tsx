
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
import { checkCredentials, type UserProfile } from "@/lib/auth";
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

const formSchema = z.object({
  username: z.string()
    .min(1, { message: "Please enter your username." })
    .regex(/^[a-zA-Z0-9_.-]+$/, "Username can only contain letters, numbers, and `_ . -`"),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

interface LoginFormProps {
  onMfaRequired: (user: Pick<UserProfile, 'username' | 'mfaEnabled'>) => void;
}

export function LoginForm({ onMfaRequired }: LoginFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();

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
    const response = await checkCredentials(values.username, values.password);
    setIsLoading(false);

    switch (response.status) {
      case 'success':
        setUser(response.user);
        toast({
          title: "Login Successful",
          description: "Redirecting to your dashboard...",
        });
        router.push("/dashboard");
        break;
      
      case 'mfa_required':
        // If MFA is required, call the callback to show the MFA form.
        onMfaRequired(response.user);
        break;

      case 'expired':
      case 'must_change_password': // Handle forced password change
        toast({
          variant: "destructive",
          title: "Password Change Required",
          description: response.message,
        });
        router.push("/change-password");
        break;

      case 'locked':
      case 'invalid':
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
