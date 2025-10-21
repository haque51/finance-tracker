import { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import { getErrorMessage } from '../utils/errorHandler';

export const useDashboard = (month) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, [month]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getDashboard(month);
      setDashboardData(data);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadDashboard();
  };

  return {
    dashboardData,
    loading,
    error,
    refresh,
  };
};
