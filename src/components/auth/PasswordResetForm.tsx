import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useToast } from "../../hooks/useToast";
import { sendPasswordResetEmail } from "../../lib/email/service";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof formSchema>;

export function PasswordResetForm() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });

      if (error) throw error;

      // Send password reset email using Resend
      const resetLink = `${window.location.origin}/auth?type=recovery`; // This will be replaced by Supabase's actual reset link
      await sendPasswordResetEmail(data.email, resetLink);

      showToast({
        message:
          "Check your email - we sent you a link to reset your password.",
        type: "success",
      });

      navigate("/auth?mode=confirmation");
    } catch (error) {
      console.error("Error:", error);
      showToast({
        message: "Failed to send reset link. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
    </Form>
  );
}
