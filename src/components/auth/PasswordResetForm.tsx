import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../../lib/supabase';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { useToast } from '../../hooks/useToast';
import { useSearchParams } from 'react-router-dom';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

export function PasswordResetForm() {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      // Get the current site URL, removing any path/query params
      const siteUrl = window.location.origin;
      
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${siteUrl}?mode=reset`
      });

      if (error) throw error;
      
      setSuccess(true);
      showToast({
        type: 'success',
        message: 'Check your email for password reset instructions'
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to send reset instructions'
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Check your email for password reset instructions.
        </AlertDescription>
        <div className="mt-4">
          <Button
            variant="ghost"
            onClick={() => setSearchParams({})}
          >
            Back to Sign In
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="Enter your email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Reset Instructions'
          )}
        </Button>
        
        <div className="text-sm text-center">
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className="text-white hover:underline"
          >
            Back to Sign In
          </button>
        </div>
      </form>
    </Form>
  );
}