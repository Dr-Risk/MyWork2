
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { SanitizedUser } from "@/lib/auth";

/**
 * @fileoverview Change Project Lead Form Component
 * @description This component provides a form for Admins to change the lead of an existing project.
 */

// Zod schema for validating the form data.
const formSchema = z.object({
  lead: z.string().min(1, "You must select a new project lead."),
});

type ChangeLeadFormProps = {
  // An array of users who can be assigned as leads.
  projectLeads: SanitizedUser[];
  // The username of the current project lead.
  currentLead: string;
  // Callback function to execute when the form is successfully submitted.
  onSubmit: (newLeadUsername: string) => void;
};

export function ChangeLeadForm({ projectLeads, currentLead, onSubmit }: ChangeLeadFormProps) {
  // Initialize react-hook-form with the Zod resolver.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lead: currentLead,
    },
  });

  /**
   * The submit handler for the form.
   * It calls the `onSubmit` prop passed from the parent component with the validated form data.
   * @param {object} values - The validated form values.
   */
  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values.lead);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="lead"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Project Lead</FormLabel>
               <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a new project lead" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Populate the dropdown with the list of available project leads */}
                  {projectLeads.map(lead => (
                    <SelectItem key={lead.username} value={lead.username}>
                      {lead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Update Lead
        </Button>
      </form>
    </Form>
  );
}
