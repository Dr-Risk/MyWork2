
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

const formSchema = z.object({
  code: z.string().length(6, { message: "Verification code must be 6 digits." }),
});

export function VerifyEmailForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  async function handleSendCode() {
    setIsSendingCode(true);
    // Simulate API call to send code
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSendingCode(false);
    toast({
      title: "Code Sent",
      description: "A new verification code has been sent to your email.",
    });
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsVerifying(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsVerifying(false);

    // Mock verification
    if (values.code === "123456") {
      toast({
        title: "Account Created!",
        description: "Your email has been verified. Please log in.",
      });
      router.push("/");
    } else {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "Invalid code. Please try again.",
      });
      form.setError("code", { message: "Invalid code." });
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
