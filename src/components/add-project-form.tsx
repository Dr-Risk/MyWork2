
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { SanitizedUser } from "@/lib/auth";
import type { Project } from "@/lib/projects";

const formSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters."),
  description: z.string().min(10, "Description is required."),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format." }),
  lead: z.string().min(1, "You must select a project lead."),
});

type AddProjectFormProps = {
  projectLeads: SanitizedUser[];
  onSubmit: (data: Omit<Project, 'id' | 'status' | 'assignedDevelopers'>) => void;
};

export function AddProjectForm({ projectLeads, onSubmit }: AddProjectFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      deadline: "",
      lead: "",
    },
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit({
        ...values,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Project Chimera" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A brief summary of the game project." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lead"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Lead</FormLabel>
               <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project lead" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deadline</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Create Project
        </Button>
      </form>
    </Form>
  );
}
