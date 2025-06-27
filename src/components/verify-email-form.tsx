
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
import { Loader2, Send } from "lucide-react";

/**
 * @fileoverview Verify Email Form Component
 * 
 * @description
 * This component provides a form for users to enter a 6-digit verification code
 * to complete their account registration. For this demo, it validates against a
 * hardcoded value.
 */

// Zod schema to validate that the input is a 6-digit string.
const formSchema = z.object({
  code: z.string().length(6, { message: "Verification code must be 6 digits." }),
});

export function VerifyEmailForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  // Initialize react-hook-form with the validation schema.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  // Simulates resending a verification code.
  async function handleSendCode() {
    setIsSendingCode(true);
    // Simulate an API call.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSendingCode(false);
    toast({
      title: "Code 'Resent'",
      description: "In a real app, a new code would be sent. For this demo, please continue to use 123456.",
    });
  }

  // Handles the form submission and code verification.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsVerifying(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsVerifying(false);

    // Mock verification: checks if the entered code is the hardcoded "123456".
    if (values.code === "123456") {
      toast({
        title: "Account Created!",
        description: "Your email has been verified. Please log in.",
      });
      router.push("/"); // Redirect to login page on success.
    } else {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "Invalid code. Please try again.",
      });
      form.setError("code", { message: "Invalid code." }); // Display an error on the form field.
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Enter Code</CardTitle>
        <CardDescription>
          Check your inbox for a 6-digit code.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input placeholder="123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col sm:flex-row gap-2">
                <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={handleSendCode}
                    disabled={isSendingCode}
                >
                    {isSendingCode ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="mr-2 h-4 w-4" />
                    )}
                    Resend Code
                </Button>
                <Button type="submit" className="w-full" disabled={isVerifying}>
                {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Create Account
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
