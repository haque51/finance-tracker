import React from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

/**
 * Offline Banner Component
 * Shows when user is offline
 */
export default function OfflineBanner() {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium z-50">
      ⚠️ You are currently offline. Some features may not work.
    </div>
  );
}
