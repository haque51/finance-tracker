/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import tokenManager from '../services/tokenManager';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useApp();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute check:', {
    path: location.pathname,
    isLoading,
    isAuthenticated,
    hasToken: tokenManager.isAuthenticated()
  });

  if (isLoading) {
    console.log('⏳ Still loading auth state...');
    // Show loading spinner while checking auth
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Check both context state AND localStorage directly
  // This handles race conditions where state hasn't updated yet but token exists
  const hasToken = tokenManager.isAuthenticated();

  if (!isAuthenticated && !hasToken) {
    console.log('🚫 Not authenticated - redirecting to login');
    // Redirect to login, but save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('✅ Authenticated - rendering protected content');
  return children;
}
