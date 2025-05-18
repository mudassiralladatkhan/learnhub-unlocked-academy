import { useNavigate, useParams, useLocation } from 'react-router-dom';

/**
 * A custom hook that wraps React Router's navigation hooks
 * Provides a unified API for navigation and route information
 */
export function useRouter() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  
  return {
    // Current route data
    pathname: location.pathname,
    query: Object.fromEntries(new URLSearchParams(location.search)),
    params,
    
    // Navigation methods
    navigate,
    push: navigate,
    
    // Helper for navigating back
    goBack: () => {
      window.history.back();
    },
    
    // Helper for replacing current URL
    replace: (path: string) => {
      navigate(path, { replace: true });
    }
  };
}
