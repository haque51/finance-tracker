/**
 * Demo Mode Component
 * Allows using the app without backend authentication
 * Useful for testing and development
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function DemoModePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-2xl w-full">
        {/* Info Banner */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Backend Server Not Available
          </h1>
          <p className="text-gray-700 dark:text-gray-300 text-lg">
            The API server is currently down or unreachable
          </p>
        </div>

        {/* Options Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Choose an Option
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You can use demo mode or set up your own backend server
            </p>
          </div>

          {/* Option 1: Demo Mode */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🎮</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Option 1: Use Demo Mode (No Backend Required)
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Try the app with sample data - no backend server needed. Perfect for testing the UI and features.
                </p>
                <Link
                  to="/demo"
                  className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
                >
                  Launch Demo Mode →
                </Link>
              </div>
            </div>
          </div>

          {/* Option 2: Local Backend */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🖥️</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Option 2: Run Backend Locally
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Set up and run the backend API server on your local machine.
                </p>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 mb-4 font-mono text-sm">
                  <div className="text-gray-600 dark:text-gray-400 mb-2"># Clone backend repo</div>
                  <div className="text-gray-900 dark:text-white mb-3">git clone &lt;backend-repo-url&gt;</div>

                  <div className="text-gray-600 dark:text-gray-400 mb-2"># Install and run</div>
                  <div className="text-gray-900 dark:text-white mb-1">npm install</div>
                  <div className="text-gray-900 dark:text-white mb-3">npm start</div>

                  <div className="text-gray-600 dark:text-gray-400 mb-2"># Update frontend .env</div>
                  <div className="text-gray-900 dark:text-white">REACT_APP_API_URL=http://localhost:5000</div>
                </div>
                <a
                  href="https://github.com/haque51/lumina-finance-backend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
                >
                  View Backend Repository →
                </a>
              </div>
            </div>
          </div>

          {/* Option 3: Troubleshooting */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-4">
              <div className="text-4xl">📖</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Option 3: Troubleshooting Guide
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  View the complete troubleshooting guide with all solutions and configuration options.
                </p>
                <a
                  href="/docs/API_TROUBLESHOOTING.md"
                  target="_blank"
                  className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
                >
                  Read Troubleshooting Guide →
                </a>
              </div>
            </div>
          </div>

          {/* Current Configuration */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Current API Configuration:
            </h4>
            <code className="text-xs text-gray-600 dark:text-gray-400">
              {process.env.REACT_APP_API_URL || 'https://lumina-finance-api-dev.onrender.com'}
            </code>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Change this in .env file: REACT_APP_API_URL
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
