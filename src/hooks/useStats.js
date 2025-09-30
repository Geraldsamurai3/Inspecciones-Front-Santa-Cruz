// src/hooks/useStats.js
import { useState, useEffect, useCallback } from 'react';
import statsService from '../services/statsService';

export const useStats = (endpoint = null, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { autoFetch = true, refreshInterval = null } = options;

  // Función genérica para hacer fetch
  const fetchData = useCallback(async (customEndpoint = null) => {
    if (!customEndpoint && !endpoint) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const targetEndpoint = customEndpoint || endpoint;
      let result;
      
      switch (targetEndpoint) {
        case 'summary':
          result = await statsService.getSummary();
          break;
        case 'status-counts':
          result = await statsService.getStatusCounts();
          break;
        case 'inspections':
          result = await statsService.getInspections();
          break;
        case 'special-inspections':
          result = await statsService.getSpecialInspections();
          break;
        case 'inspectors':
          result = await statsService.getInspectors();
          break;
        case 'departments':
          result = await statsService.getDepartments();
          break;
        case 'detailed':
          result = await statsService.getDetailed();
          break;
        case 'dashboard':
          result = await statsService.getDashboard();
          break;
        case 'complete-overview':
          result = await statsService.getCompleteOverview();
          break;
        case 'dependencies':
          result = await statsService.getDependencies(options.params || {});
          break;
        default:
          throw new Error(`Endpoint no reconocido: ${targetEndpoint}`);
      }
      
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('Error en useStats:', err);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  // Fetch inicial si autoFetch está habilitado
  useEffect(() => {
    if (autoFetch && endpoint) {
      fetchData();
    }
  }, [autoFetch, endpoint, fetchData]);

  // Intervalo de refresh automático
  useEffect(() => {
    if (refreshInterval && endpoint) {
      const interval = setInterval(() => {
        fetchData();
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [refreshInterval, endpoint, fetchData]);

  // Función para refrescar manualmente
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Función para cambiar endpoint dinámicamente
  const changeEndpoint = useCallback((newEndpoint) => {
    fetchData(newEndpoint);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    changeEndpoint,
    fetchData
  };
};

// Hooks específicos para cada endpoint (más fáciles de usar)
export const useSummaryStats = (options = {}) => useStats('summary', options);
export const useStatusCounts = (options = {}) => useStats('status-counts', options);
export const useInspectionStats = (options = {}) => useStats('inspections', options);
export const useSpecialInspectionStats = (options = {}) => useStats('special-inspections', options);
export const useInspectorStats = (options = {}) => useStats('inspectors', options);
export const useDepartmentStats = (options = {}) => useStats('departments', options);
export const useDetailedStats = (options = {}) => useStats('detailed', options);
export const useDashboardStats = (options = {}) => useStats('dashboard', options);
export const useCompleteOverviewStats = (options = {}) => useStats('complete-overview', options);
export const useDependencyStats = (options = {}) => useStats('dependencies', options);

// Hook para múltiples endpoints
export const useMultipleStats = (endpoints = [], options = {}) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { autoFetch = true } = options;

  const fetchAllData = useCallback(async () => {
    if (endpoints.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const promises = endpoints.map(async (endpoint) => {
        const { data } = useStats(endpoint, { autoFetch: false });
        return { [endpoint]: data };
      });
      
      const results = await Promise.all(promises);
      const combinedData = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      
      setData(combinedData);
    } catch (err) {
      setError(err.message);
      console.error('Error en useMultipleStats:', err);
    } finally {
      setLoading(false);
    }
  }, [endpoints]);

  useEffect(() => {
    if (autoFetch) {
      fetchAllData();
    }
  }, [autoFetch, fetchAllData]);

  return {
    data,
    loading,
    error,
    refresh: fetchAllData
  };
};