import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { getErrorMessage } from '../utils/errorHandler';

/**
 * Custom hook for dashboard data
 */
export const useDashboard = (month) => {
  const { loadDashboard } = useContext(AppContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [month]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await loadDashboard(month);
      setDashboardData(data);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadDashboardData();
  };

  return {
    dashboardData,
    loading,
    error,
    refresh,
  };
};
