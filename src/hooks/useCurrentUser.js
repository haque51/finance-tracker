/**
 * Custom hook to get current user from AppContext
 * Prevents redundant User.me() API calls
 */
import { useApp } from '../context/AppContext';

export function useCurrentUser() {
  const { user, isAuthenticated } = useApp();

  return {
    user,
    isAuthenticated
  };
}
