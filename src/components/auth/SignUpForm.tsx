import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../../lib/supabase";
import { checkUsernameAvailable } from "../../lib/auth/validation";
import { signUpSchema } from "../../lib/validation/passwordSchema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { AuthContext } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

const formSchema = signUpSchema.extend({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  email: z.string().email("Please enter a valid email address"),
  inviteCode: z.string().min(1, "Invite code is required"),
});

export function SignUpForm() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("AuthContext must be used within AuthProvider");
  const { loading: authLoading, signUpEmail } = context;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      inviteCode: "",
    },
  });

  // Update form when email changes
  React.useEffect(() => {
    if (signUpEmail?.email) {
      form.setValue("email", signUpEmail.email);
    }
  }, [signUpEmail?.email, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setError(null);

    try {
      // Validate invite code
      const { data: isValid, error: validateError } = await supabase.rpc(
        "validate_invite_code",
        { code: values.inviteCode }
      );

      if (validateError) throw validateError;
      if (!isValid) {
        setError("Invalid or expired invite code");
        return;
      }

      // Check if username is available
      const isAvailable = await checkUsernameAvailable(values.username);
      if (!isAvailable) {
        form.setError("username", { message: "Username is already taken" });
        return;
      }

      const { error: signUpError, data } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            username: values.username,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Mark invite code as used
      if (data.user) {
        await supabase.rpc("use_invite_code", {
          code: values.inviteCode,
          user_id: data.user.id,
        });
      }

      navigate("/onboarding");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Choose a username" {...field} />
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
                <Input placeholder="Enter your email" {...field} />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inviteCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invite Code</FormLabel>
              <FormControl>
                <Input placeholder="Enter your invite code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <p className="text-sm text-white/60">
          By creating an account, you agree to our{" "}
          <Link
            to="/terms"
            className="text-white hover:underline font-semibold"
          >
            Terms & Conditions
          </Link>{" "}
          and{" "}
          <Link
            to="/privacy"
            className="text-white hover:underline font-semibold"
          >
            Privacy Policy
          </Link>
        </p>

        <Button
          type="submit"
          className="w-full"
          disabled={loading || authLoading}
        >
          {loading || authLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </Form>
  );
}
