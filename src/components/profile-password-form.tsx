
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

/**
 * @fileoverview Profile Password Form Component
 * 
 * @description
 * This component provides a secure form for an authenticated user to change
 * their own password. It requires them to enter their current password for
 * verification before allowing a change.
 */

// Zod schema for validating the password change form.
// It ensures the new passwords match and meet the minimum length requirement.
const UpdateUserPasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Please enter your current password." }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match.",
  path: ["confirmPassword"],
});

export function ProfilePasswordForm() {
  const { user } = useAuth(); // Access the current user's data from the context.
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Initialize react-hook-form with the validation schema.
  const form = useForm<z.infer<typeof UpdateUserPasswordSchema>>({
    resolver: zodResolver(UpdateUserPasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // This function is called when the form is submitted and validated successfully.
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
              <FormLabel>New Password</FormLabel>
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
