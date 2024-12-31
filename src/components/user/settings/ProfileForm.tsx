import React from 'react';
import { User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProfileForm } from '../../../hooks/settings/useProfileForm';
import { ProfilePictureUpload } from './ProfilePictureUpload';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { Input } from '../../ui/input';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
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
      form.setValue('username', username);
    }
  }, [username, form]);

  React.useEffect(() => {
    if (success) {
      // Redirect to new profile URL after successful update
      const newUsername = form.getValues('username');
      navigate(`/user/${newUsername}`);
    }
  }, [success, navigate, form]);

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <User className="w-5 h-5" />
        Profile Settings
      </h2>

      <div className="space-y-8">
        <ProfilePictureUpload />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
            {success && <div className="text-green-500 text-sm">Profile updated successfully!</div>}

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary w-full"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </Form>
      </div>
    </div>
  );
}