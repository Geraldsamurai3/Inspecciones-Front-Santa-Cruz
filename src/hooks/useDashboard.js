// src/hooks/useDashboard.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { dashboardService } from '@/services/dashboardService';

/**
 * mode: 'inspector' | 'admin'
 * initialParams: { startDate?: string, endDate?: string } para consulta de período
 */
export function useDashboard({ mode = 'inspector', autoFetch = true, initialParams = {} } = {}) {
  const [data, setData] = useState(null);          // payload del dashboard (inspector/admin)
  const [periodStats, setPeriodStats] = useState(null); // payload de /stats/period
  const [loading, setLoading] = useState(!!autoFetch);
  const [periodLoading, setPeriodLoading] = useState(false);
  const [error, setError] = useState(null);
  const [periodError, setPeriodError] = useState(null);

  const initialParamsRef = useRef(initialParams);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = mode === 'admin'
        ? await dashboardService.getAdminDashboard()
        : await dashboardService.getInspectorDashboard();
      setData(d ?? {});
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  const fetchStatsByPeriod = useCallback(async (params = initialParamsRef.current) => {
    setPeriodLoading(true);
    setPeriodError(null);
    try {
      const d = await dashboardService.getStatsByPeriod(params);
      setPeriodStats(d ?? {});
    } catch (e) {
      setPeriodError(e);
    } finally {
      setPeriodLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetchDashboard();
  }, [autoFetch, fetchDashboard]);

  return {
    // datos del dashboard
    data,
    loading,
    error,
    refetch: fetchDashboard,

    // estadísticas por período
    periodStats,
    periodLoading,
    periodError,
    fetchStatsByPeriod,
  };
}
