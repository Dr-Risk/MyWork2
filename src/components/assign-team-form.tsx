
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

const FormSchema = z.object({
  developers: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one developer.",
  }),
});

type AssignTeamFormProps = {
  developers: SanitizedUser[];
  onSubmit: (assignedUsernames: string[]) => void;
};

export function AssignTeamForm({ developers, onSubmit }: AssignTeamFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      developers: [],
    },
  });

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
                              checked={field.value?.includes(item.username)}
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
