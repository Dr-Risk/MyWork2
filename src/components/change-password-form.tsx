
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

/**
 * @fileoverview Change Password Form Component
 * 
 * @description
 * This component provides a form for a user to set a new password. It's used
 * on the dedicated `/change-password` page, typically when a user's password
 * has expired. It includes validation to ensure the two password fields match.
 */

// Zod schema defines the structure and validation rules for the form.
// It includes a `refine` check to ensure the new password and confirmation password match.
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

  // Initialize react-hook-form with the Zod schema.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // This function is called when the form is submitted and validated successfully.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    // In a real application, you would make an API call here to a secure endpoint
    // to update the user's password. The server would then hash the new password
    // before storing it in the database.
    console.log("New password (would be hashed on server):", values.newPassword);
    
    // Simulate a network delay.
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
