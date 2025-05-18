import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useSession } from '@/contexts/SessionContext';

const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { signIn, user, session, loading } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect to dashboard after login but with improved handling
  useEffect(() => {
    // Don't redirect if still loading auth state
    if (loading) return;
    
    if (user || session) {
      console.log("User authenticated, redirecting to dashboard...");
      
      // Get redirect path and clean up storage
      const redirectToPath = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
      sessionStorage.removeItem('redirectAfterLogin');
      
      // Use a single navigation approach with replace to avoid history issues
      // This will prevent the user from going back to the login page after login
      navigate(redirectToPath, { replace: true });
    }
  }, [user, session, loading, navigate]);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const [loginError, setLoginError] = useState<string | null>(null);

  async function onSubmit(data: LoginFormValues) {
    setIsSubmitting(true);
    setLoginError(null);
    
    try {
      // Attempt to sign in
      await signIn(data.email, data.password);
      console.log("Login successful");
      
      // The useEffect hook will handle redirection once user/session state updates
      // No need to navigate here to avoid race conditions
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError(error.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <div className="container max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-800 dark:text-brand-100">Welcome Back</h1>
        <p className="text-muted-foreground mt-2">
          Sign in to continue your learning journey
        </p>
      </div>
      
      <div className="bg-white dark:bg-brand-900/40 p-6 rounded-lg shadow-sm border border-border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} />
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
                    <Input type="password" placeholder="Enter your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
                Forgot password?
              </Link>
            </div>
            
            {/* Display login error if any */}
            {loginError && (
              <div className="p-3 my-2 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900/50 dark:text-red-200">
                {loginError}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Form>
        
        <div className="mt-6 text-center text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium">
            Create account
          </Link>
        </div>
      </div>
      
      {/* Demo accounts */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-2">Demo Accounts</p>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={() => {
            form.setValue('email', 'user@learnhub.com');
            form.setValue('password', 'password123');
          }}>
            User Demo
          </Button>
          <Button variant="outline" onClick={() => {
            form.setValue('email', 'admin@learnhub.com');
            form.setValue('password', 'password123');
          }}>
            Admin Demo
          </Button>
        </div>
      </div>
    </div>
  );
}
