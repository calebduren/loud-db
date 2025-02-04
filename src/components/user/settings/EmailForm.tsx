import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEmailForm } from "../../../hooks/settings/useEmailForm";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export function EmailForm() {
  const { email, handleSubmit, saving, error, success } = useEmailForm();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email,
    },
  });

  // Update form when email changes
  React.useEffect(() => {
    if (email) {
      form.setValue("email", email);
    }
  }, [email, form]);
  return (
    <div className="card">
      <h2 className="card__title">Email Settings</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Enter your email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && (
            <div className="text-green-500 text-sm">
              Email updated successfully!
            </div>
          )}

          <Button type="submit" disabled={saving || !form.formState.isDirty}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
