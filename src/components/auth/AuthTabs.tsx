import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { PasswordResetForm } from './PasswordResetForm';
import { useSearchParams } from 'react-router-dom';

interface AuthTabsProps {
  defaultTab?: 'signin' | 'signup' | 'reset';
}

export function AuthTabs({ defaultTab = 'signin' }: AuthTabsProps) {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const type = searchParams.get('type');

  // Show password reset form if in reset mode or recovery
  if (mode === 'reset' || type === 'recovery') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Reset Password</h2>
        <PasswordResetForm />
      </div>
    );
  }

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="signin">
        <SignInForm />
      </TabsContent>
      <TabsContent value="signup">
        <SignUpForm />
      </TabsContent>
    </Tabs>
  );
}