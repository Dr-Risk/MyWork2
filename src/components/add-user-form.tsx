
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

/**
 * @fileoverview Add User Form Component
 * @description This form is used by Admins to create new user accounts, such as
 * Project Leads or Developers. It includes validation and handles the API call
 * to the mock backend for user creation.
 */

// Zod schema for validating the new user data.
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  // Role must be one of the two specified values.
  role: z.enum(["project-lead", "developer"]),
});

type AddUserFormProps = {
  /**
   * A callback function to be executed when a user is successfully created.
   * This is used to trigger a data refresh in the parent component and reset the form.
   * It is essential for ensuring the UI reflects the new state immediately.
   */
  onSuccess: () => void;
};

export function AddUserForm({ onSuccess }: AddUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize react-hook-form with the Zod resolver and default values.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "DefaultPassword123", // A default password for new users.
      role: "developer",
    },
  });

  const passwordValue = form.watch("password");

  /**
   * The submit handler for the form.
   * It calls the `createUser` server action and handles the response.
   * @param {object} values - The validated form values.
   */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await createUser(values);
      if (response.success) {
        toast({
          title: "User Created",
          description: `User '${values.username}' was created successfully.`,
        });
        // Trigger the success callback provided by the parent component.
        // This is the key to synchronizing the state between this form and the dashboard.
        onSuccess();
      } else {
        // If the server returns an error (e.g., username exists), show it.
        toast({
          variant: "destructive",
          title: "Creation Failed",
          description: response.message,
        });
      }
    } catch (error) {
      console.error("Create user error:", error);
      toast({
        variant: "destructive",
        title: "An unexpected error occurred",
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="johndoe" {...field} />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john.doe@example.com" {...field} type="email" />
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
               <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", passwordValue.length >= 8 ? "bg-green-500" : "bg-red-500")}></span>
                    <span className="text-xs text-muted-foreground">8+ characters</span>
                </div>
              </div>
              <FormControl>
                <Input {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="project-lead">Project Lead</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create User
        </Button>
      </form>
    </Form>
  );
}
