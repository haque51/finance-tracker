import React from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Loading Overlay Component
 * Full-screen loading overlay
 */
export default function LoadingOverlay({ text = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}
