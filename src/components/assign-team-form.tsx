
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
import { Checkbox } from "@/components/ui/checkbox";
import type { SanitizedUser } from "@/lib/auth";

/**
 * @fileoverview Assign Team Form Component
 * @description This form is used by Project Leads to assign one or more
 * available developers to their project. It presents a list of developers
 * as checkboxes.
 */

// Zod schema for validating the form data.
// It ensures that the `developers` field is an array of strings and that
// at least one developer is selected.
const FormSchema = z.object({
  developers: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one developer.",
  }),
});

type AssignTeamFormProps = {
  developers: SanitizedUser[]; // The list of available developers to choose from.
  onSubmit: (assignedUsernames: string[]) => void; // Callback on successful submission.
};

export function AssignTeamForm({ developers, onSubmit }: AssignTeamFormProps) {
  // Initialize react-hook-form with the Zod resolver.
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      developers: [],
    },
  });

  /**
   * The submit handler for the form.
   * It calls the `onSubmit` prop with the array of selected developer usernames.
   * @param {object} data - The validated form data.
   */
  function handleSubmit(data: z.infer<typeof FormSchema>) {
    onSubmit(data.developers);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="developers"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Available Developers</FormLabel>
              </div>
              <div className="space-y-2">
                {/* Map over the available developers to render a checkbox for each one. */}
                {developers.map((item) => (
                  <FormField
                    key={item.username}
                    control={form.control}
                    name="developers"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.username}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              // Check the box if the developer's username is in the form's value array.
                              checked={field.value?.includes(item.username)}
                              // When the checkbox state changes, add or remove the username from the array.
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item.username])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item.username
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {item.name} ({item.username})
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Assign to Project</Button>
      </form>
    </Form>
  );
}
