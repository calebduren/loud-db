import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usePasswordForm } from "../../../hooks/settings/usePasswordForm";
import { passwordChangeSchema } from "../../../lib/validation/passwordSchema";
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

export function PasswordForm() {
  const { handleSubmit, saving, error, success } = usePasswordForm();

  const form = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        Change Password
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && (
            <div className="text-green-500 text-sm">
              Password updated successfully!
            </div>
          )}

          <Button type="submit" disabled={saving}>
            {saving ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
