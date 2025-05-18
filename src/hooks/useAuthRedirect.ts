import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';

type UseAuthRedirectOptions = {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
  redirectAuthenticated?: boolean;
  redirectAuthenticatedTo?: string;
};

/**
 * Custom hook for handling authentication-based redirects
 */
export const useAuthRedirect = ({
  requireAuth = false,
  requireAdmin = false,
  redirectTo = '/login',
  redirectAuthenticated = false,
  redirectAuthenticatedTo = '/dashboard'
}: UseAuthRedirectOptions = {}) => {
  const { user, loading, isAdmin } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Wait until auth state is determined
    if (loading) return;
    
    // Case 1: Redirect if authentication is required but user is not logged in
    if (requireAuth && !user) {
      // Store the current location for post-login redirect
      sessionStorage.setItem('redirectAfterLogin', location.pathname);
      navigate(redirectTo);
      return;
    }
    
    // Case 2: Redirect if admin access is required but user is not an admin
    if (requireAdmin && (!user || !isAdmin)) {
      navigate(redirectTo);
      return;
    }
    
    // Case 3: Redirect if authenticated user visits pages like login/register
    if (redirectAuthenticated && user) {
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || redirectAuthenticatedTo;
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath);
      return;
    }
  }, [user, isAdmin, loading, requireAuth, requireAdmin, redirectAuthenticated, 
       redirectTo, redirectAuthenticatedTo, navigate, location.pathname]);
  
  return { user, isAdmin, loading };
};
