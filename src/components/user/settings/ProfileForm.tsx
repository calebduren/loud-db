import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProfileForm } from "../../../hooks/settings/useProfileForm";
import { ProfilePictureUpload } from "./ProfilePictureUpload";
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
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
});

export function ProfileForm() {
  const navigate = useNavigate();
  const { username, handleSubmit, saving, error, success } = useProfileForm();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: username,
    },
  });

  // Update form when username changes
  React.useEffect(() => {
    if (username) {
      form.setValue("username", username);
    }
  }, [username, form]);

  React.useEffect(() => {
    if (success) {
      // Redirect to new profile URL after successful update
      const newUsername = form.getValues("username");
      navigate(`/${newUsername}`);
    }
  }, [success, navigate, form]);

  return (
    <div className="card">
      <h2 className="card__title">Profile Settings</h2>

      <div className="space-y-2">
        <ProfilePictureUpload />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your username" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && (
              <div className="text-green-500 text-sm">
                Profile updated successfully!
              </div>
            )}

            <Button type="submit" disabled={saving || !form.formState.isDirty}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
