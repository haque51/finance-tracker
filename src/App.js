/**
 * Main App Component
 * Handles routing and authentication
 * Updated to use new UI from old app with current backend
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from './components/ui/toaster';
import OfflineBanner from './components/OfflineBanner';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from 'next-themes';

// Import new pages from old app
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Budget from './pages/Budget';
import Goals from './pages/Goals';
import Recurring from './pages/Recurring';
import Reconciliation from './pages/Reconciliation';
import Forecast from './pages/Forecast';
import DebtPayoff from './pages/DebtPayoff';
import Insights from './pages/Insights';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Keep current auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DemoModePage from './pages/DemoModePage';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <BrowserRouter>
          <AppProvider>
            <OfflineBanner />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/demo" element={<DemoModePage />} />
              <Route path="/server-error" element={<DemoModePage />} />

              {/* Protected Routes with Layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout currentPageName="Dashboard">
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout currentPageName="Dashboard">
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/accounts"
                element={
                  <ProtectedRoute>
                    <Layout currentPageName="Accounts">
                      <Accounts />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <Layout currentPageName="Transactions">
                      <Transactions />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute>
                    <Layout currentPageName="Categories">
                      <Categories />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/budget"
                element={
                  <ProtectedRoute>
                    <Layout currentPageName="Budget">
                      <Budget />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/goals"
                element={
                  <ProtectedRoute>
                    <Layout currentPageName="Goals">
                      <Goals />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recurring"
                element={
                  <ProtectedRoute>
                    <Layout currentPageName="Recurring">
                      <Recurring />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reconciliation"
                element={
                  <ProtectedRoute>
                    <Layout currentPageName="Reconciliation">
                      <Reconciliation />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forecast"
                element={
                  <ProtectedRoute>
                    <Layout currentPageName="Forecast">
                      <Forecast />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/debtpayoff"
                element={
                  <ProtectedRoute>
                    <Layout currentPageName="DebtPayoff">
                      <DebtPayoff />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/insights"
                element={
                  <ProtectedRoute>
                    <Layout currentPageName="Insights">
                      <Insights />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Layout currentPageName="Reports">
                      <Reports />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Layout currentPageName="Settings">
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* 404 - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            <Toaster />
          </AppProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
