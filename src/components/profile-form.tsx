
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
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { updateUserProfile } from "@/lib/auth";

/**
 * @fileoverview Profile Form Component
 * 
 * @description
 * This component provides a form for users to update their public profile
 * information, specifically their full name and email address. It fetches the
 * current user's data from the `useAuth` hook to pre-populate the form fields.
 */

/**
 * [SECURITY] Zod schema for validating the profile update data.
 * Even though this is a profile update form for an authenticated user, server-side
 * validation (which is mocked in `lib/auth.ts`) is still essential to prevent
 * malicious or malformed data from being saved to the database.
 */
const UpdateUserProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export function ProfileForm() {
  const { user, setUser } = useAuth(); // Access user data and the setter from the context.
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Initialize react-hook-form with the schema and pre-populate with the current user's data.
  const form = useForm<z.infer<typeof UpdateUserProfileSchema>>({
    resolver: zodResolver(UpdateUserProfileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  /**
   * Handles the form submission after successful validation.
   * @param {object} values - The validated form values.
   */
  async function onSubmit(values: z.infer<typeof UpdateUserProfileSchema>) {
    if (!user) return; // Guard clause in case user data is not available.

    setIsLoading(true);
    /**
     * [SECURITY] The `updateUserProfile` function in `lib/auth.ts` simulates a
     * secure, server-side endpoint. In a real application, this endpoint would
     * first verify that the logged-in user has permission to update this profile
     * (i.e., they are updating their own profile, or they are an admin with
     * the necessary privileges).
     */
    const response = await updateUserProfile(user.username, values);
    setIsLoading(false);

    if (response.success && response.user) {
      // Update the global auth context with the new user info.
      setUser(response.user); 
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
      // Refresh the page to ensure all components have the latest user data.
      router.refresh(); 
    } else {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: response.message,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Full Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Profile
        </Button>
      </form>
    </Form>
  );
}
