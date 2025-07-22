
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
import { cn } from "@/lib/utils";

/**
 * @fileoverview Change Password Form Component
 * 
 * @description
 * This component provides a form for a user to set a new password. It's used
 * on the dedicated `/change-password` page, which is shown when a user's
 * password has expired. It includes validation to ensure the new password
 * meets length requirements and that the two password fields match.
 */

/**
 * Zod schema defines the structure and validation rules for the form.
 * - `newPassword`: Must be at least 8 characters.
 * - `confirmPassword`: Must be at least 8 characters.
 * - `refine`: A cross-field validation check to ensure the `newPassword` and
 *   `confirmPassword` fields are identical. If they don't match, an error
 *   is attached to the `confirmPassword` field.
 */
const formSchema = z.object({
  newPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"], // The error will be displayed on the confirmPassword field.
});

export function ChangePasswordForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize react-hook-form with the Zod schema for validation.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPasswordValue = form.watch("newPassword");

  /**
   * Handles the form submission after successful client-side validation.
   * @param {object} values - The validated form values.
   */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    /**
     * [SECURITY] In a real application, you would make an API call here to a secure
     * server endpoint to update the user's password. The server would then perform
     * its own validation, hash the new password using a strong algorithm like Argon2
     * or bcrypt, and store the new hash in the database.
     */
    console.log("New password (would be hashed on server):", values.newPassword);
    
    // Simulate a network delay to mimic an API call.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);

    toast({
        title: "Password Changed Successfully",
        description: "Please log in with your new password.",
    });
    
    // Redirect the user to the login page to sign in with their new credentials.
    router.push("/");
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">New Password</CardTitle>
        <CardDescription>
          Enter and confirm your new password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>New Password</FormLabel>
                    <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", newPasswordValue.length >= 8 ? "bg-green-500" : "bg-red-500")}></span>
                        <span className="text-xs text-muted-foreground">8+ characters</span>
                    </div>
                  </div>
                  <FormControl>
                    <Input placeholder="••••••••" {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input placeholder="••••••••" {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Set New Password
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
