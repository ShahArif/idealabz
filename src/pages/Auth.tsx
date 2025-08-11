import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { signInSchema, signUpSchema } from '@/lib/validations';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAdminMode = searchParams.get('admin') === 'true';
  const isIdeatorMode = window.location.pathname === '/ideator';
  const { toast } = useToast();

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: isAdminMode ? 'arif@ideas2it.com' : isIdeatorMode ? '' : '',
      password: '',
    },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    },
  });

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const onSignIn = async (data: SignInFormData) => {
    console.log('Auth: Starting sign in process for:', data.email);
    setIsSubmitting(true);
    try {
      const { error } = await signIn(data.email, data.password);
      console.log('Auth: Sign in result:', { error, success: !error });
      if (!error) {
        console.log('Auth: Redirecting to home page');
        navigate('/');
      } else {
        console.log('Auth: Sign in failed, staying on auth page');
      }
    } catch (error) {
      console.error('Auth: Sign in exception:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignUp = async (data: SignUpFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await signUp(data.email, data.password, data.firstName, data.lastName);
      if (!error) {
        signUpForm.reset();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const testDatabaseConnection = async () => {
    console.log('Testing database connection...');
    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('Database connection error:', error);
        toast({
          title: "Database Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Database connection successful, profiles count:', data?.length);
        toast({
          title: "Database Connected",
          description: `Successfully connected. Found ${data?.length || 0} profiles.`,
        });
      }
    } catch (error) {
      console.error('Database test exception:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isAdminMode ? 'Admin Access' : isIdeatorMode ? 'Ideator Login' : 'IdeaLabs Platform'}
          </CardTitle>
          <CardDescription>
            {isAdminMode 
              ? 'Admin login to access the platform dashboard'
              : isIdeatorMode
                ? 'Login as an ideator to track your submitted ideas'
                : 'Join the Ideas2IT innovation platform to submit and track your ideas'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Add test button for debugging */}
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={testDatabaseConnection}
              className="w-full"
            >
              Test Database Connection
            </Button>
          </div>
          
          {(isAdminMode || isIdeatorMode) ? (
            <div className="space-y-4">
              <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Email</Label>
                  <Input
                    id="login-username"
                    type="email"
                    placeholder="your.email@ideas2it.com"
                    {...signInForm.register('email')}
                  />
                  {signInForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {signInForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    {...signInForm.register('password')}
                  />
                  {signInForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {signInForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    isAdminMode ? 'Admin Sign In' : 'Ideator Sign In'
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your.email@ideas2it.com"
                    {...signInForm.register('email')}
                  />
                  {signInForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {signInForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    {...signInForm.register('password')}
                  />
                  {signInForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {signInForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-firstname">First Name</Label>
                    <Input
                      id="signup-firstname"
                      placeholder="John"
                      {...signUpForm.register('firstName')}
                    />
                    {signUpForm.formState.errors.firstName && (
                      <p className="text-sm text-destructive">
                        {signUpForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-lastname">Last Name</Label>
                    <Input
                      id="signup-lastname"
                      placeholder="Doe"
                      {...signUpForm.register('lastName')}
                    />
                    {signUpForm.formState.errors.lastName && (
                      <p className="text-sm text-destructive">
                        {signUpForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your.email@ideas2it.com"
                    {...signUpForm.register('email')}
                  />
                  {signUpForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {signUpForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    {...signUpForm.register('password')}
                  />
                  {signUpForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {signUpForm.formState.errors.password.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Password must contain at least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;