
import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, User } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: { name?: string; avatar?: string }) => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        // Get current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          setUser(null);
          setLoading(false);
          return;
        }

        try {
          // Try to get user profile from users table
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!error) {
            setUser(data as User);
          } else {
            // If users table doesn't exist or other error, fall back to auth data
            setUser({
              id: session.user.id,
              email: session.user.email ?? '',
              name: session.user.user_metadata?.name as string | null,
              avatar: session.user.user_metadata?.avatar as string | null
            });
          }
        } catch (error) {
          // Fallback to auth data if there's any error
          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            name: session.user.user_metadata?.name as string | null,
            avatar: session.user.user_metadata?.avatar as string | null
          });
        }
        
        // Check if user is admin (simple implementation - would need proper roles in production)
        // In a real app, you'd have an admins table or a role column
        setIsAdmin(session.user.email === 'admin@learnhub.com');
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Set up subscription for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          try {
            // Try to get user profile from users table
            const { data, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (!error) {
              setUser(data as User);
            } else {
              // If users table doesn't exist or other error, fall back to auth data
              setUser({
                id: session.user.id,
                email: session.user.email ?? '',
                name: session.user.user_metadata?.name as string | null,
                avatar: session.user.user_metadata?.avatar as string | null
              });
            }
          } catch (error) {
            // Fallback to auth data if there's any error
            setUser({
              id: session.user.id,
              email: session.user.email ?? '',
              name: session.user.user_metadata?.name as string | null,
              avatar: session.user.user_metadata?.avatar as string | null
            });
          }
          setIsAdmin(session.user.email === 'admin@learnhub.com');
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            avatar: null
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        try {
          // Try to create user profile, but don't fail if the table doesn't exist
          await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email,
              name,
              avatar: null,
            });
        } catch (profileError) {
          // Just log the error but continue - we'll handle the user data from auth.users
          console.warn("Couldn't create user profile, but auth succeeded:", profileError);
        }

        toast({
          title: "Success!",
          description: "Account created successfully. Please sign in.",
        });
        
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast({
        title: "Sign up failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        try {
          // Try to get user profile from users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (!userError) {
            setUser(userData as User);
          } else {
            // If users table doesn't exist or other error, fall back to auth data
            setUser({
              id: data.user.id,
              email: data.user.email ?? '',
              name: data.user.user_metadata?.name as string | null,
              avatar: data.user.user_metadata?.avatar as string | null
            });
          }
        } catch (err) {
          // Fallback to auth data if there's any error
          setUser({
            id: data.user.id,
            email: data.user.email ?? '',
            name: data.user.user_metadata?.name as string | null,
            avatar: data.user.user_metadata?.avatar as string | null
          });
        }
        
        setIsAdmin(data.user.email === 'admin@learnhub.com');
        
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in",
        });
        
        // Let the LoginPage component handle the navigation via useEffect
        // This prevents navigation conflicts
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(false);
      toast({
        title: "Signed out",
        description: "You've been successfully signed out",
      });
      navigate('/');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (data: { name?: string; avatar?: string }) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id);
        
      if (error) throw error;
      
      setUser(prev => prev ? { ...prev, ...data } : null);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
