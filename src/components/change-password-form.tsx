
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
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
import { updateUserPasswordWithTempToken } from "@/lib/auth"; // We will create this new function

/**
 * @fileoverview Change Password Form Component
 * 
 * @description
 * This component provides a form for a user to set a new password. It's used
 * on the dedicated `/change-password` page, which is shown when a user's
 * password has expired or must be changed on first login.
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
  path: ["confirmPassword"],
});

export function ChangePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPasswordValue = form.watch("newPassword");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    // For this flow, we assume the backend has provided a temporary, single-use
    // token that proves the user is allowed to change their password without
    // providing the old one. In a real app, this token would be sent to the user's
    // email or passed securely. For this prototype, we'll use the username from the
    // login response as a stand-in for this token.
    const tempAuthToken = searchParams.get('user'); // This would be a real token in production

    if (!tempAuthToken) {
        toast({
            variant: "destructive",
            title: "Invalid Request",
            description: "No temporary authentication token found. Please log in again.",
        });
        router.push("/");
        setIsLoading(false);
        return;
    }

    const response = await updateUserPasswordWithTempToken(tempAuthToken, values.newPassword);
    
    setIsLoading(false);

    if (response.success) {
      toast({
          title: "Password Changed Successfully",
          description: "Please log in with your new password.",
      });
      router.push("/");
    } else {
      toast({
          variant: "destructive",
          title: "Update Failed",
          description: response.message,
      });
    }
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
