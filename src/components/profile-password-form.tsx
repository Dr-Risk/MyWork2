
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { updateUserPassword } from "@/lib/auth";
import { cn } from "@/lib/utils";

/**
 * @fileoverview Profile Password Form Component
 * 
 * @description
 * This component provides a secure form for an authenticated user to change
 * their own password. It requires them to enter their current password for
 * verification before allowing a new password to be set. It includes validation
 * to ensure the new passwords match and meet length requirements.
 */

// Zod schema for validating the password change form.
const UpdateUserPasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Please enter your current password." }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string()
  // A cross-field validation to ensure the new passwords match.
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match.",
  path: ["confirmPassword"], // Attach the error to the `confirmPassword` field.
});

export function ProfilePasswordForm() {
  const { user } = useAuth(); // Access the current user's data from the context.
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Initialize react-hook-form with the validation schema.
  const form = useForm<z.infer<typeof UpdateUserPasswordSchema>>({
    resolver: zodResolver(UpdateUserPasswordSchema),
    mode: "onTouched",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPasswordValue = form.watch("newPassword");

  /**
   * Handles the form submission after successful validation.
   * @param {object} values - The validated form values.
   */
  async function onSubmit(values: z.infer<typeof UpdateUserPasswordSchema>) {
    if (!user) return; // Guard clause in case user data isn't available.

    setIsLoading(true);
    // Call the mock server action to update the password.
    const response = await updateUserPassword(user.username, values.currentPassword, values.newPassword);
    setIsLoading(false);

    if (response.success) {
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
      form.reset(); // Clear the form fields on success.
    } else {
      // If the update fails (e.g., incorrect current password), show an error toast.
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: response.message,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input placeholder="••••••••" {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Change Password
        </Button>
      </form>
    </Form>
  );
}
