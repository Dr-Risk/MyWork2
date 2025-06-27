
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
 * information, such as their name and email address. It fetches the current
 * user's data from the `AuthContext` to pre-populate the form.
 */

// Zod schema for validating the profile update data.
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

  // This function is called when the form is submitted and validated successfully.
  async function onSubmit(values: z.infer<typeof UpdateUserProfileSchema>) {
    if (!user) return; // Guard clause in case user data is not available.

    setIsLoading(true);
    // Call the mock server action to update the user's profile.
    const response = await updateUserProfile(user.username, values);
    setIsLoading(false);

    if (response.success && response.user) {
      setUser(response.user); // Update the global auth context with the new user info.
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
      router.refresh(); // Refresh the page to ensure all components have the latest user data.
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
