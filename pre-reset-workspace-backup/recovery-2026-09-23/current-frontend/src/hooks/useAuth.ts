import {useAuthContext} from '../context/AuthContext';

/**
 * Hook to access current authentication state and actions.
 */
export function useAuth() {
  return useAuthContext();
}
