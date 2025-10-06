// src/services/statsService.js
const API_BASE_URL = import.meta.env.VITE_API_URL;

class StatsService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper para hacer requests con manejo de errores
  async request(endpoint, options = {}) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  // 1. GET /stats/summary - Resumen general de inspecciones
  async getSummary() {
    return this.request('/stats/summary');
  }

  // 2. GET /stats/status-counts - Conteos por estado de inspecciones
  async getStatusCounts() {
    return this.request('/stats/status-counts');
  }

  // 3. GET /stats/inspections - Estadísticas de inspecciones regulares
  async getInspections() {
    return this.request('/stats/inspections');
  }

  // 4. GET /stats/special-inspections - Estadísticas de inspecciones especiales
  async getSpecialInspections() {
    return this.request('/stats/special-inspections');
  }

  // 5. GET /stats/inspectors - Rendimiento de inspectores
  async getInspectors() {
    return this.request('/stats/inspectors');
  }

  // 6. GET /stats/departments - Comparación entre dependencias
  async getDepartments() {
    return this.request('/stats/departments');
  }

  // 7. GET /stats/detailed - Análisis detallado
  async getDetailed() {
    return this.request('/stats/detailed');
  }

  // 8. GET /stats/dashboard - Dashboard principal
  async getDashboard() {
    return this.request('/stats/dashboard');
  }

  // 9. GET /stats/complete-overview - Vista ejecutiva completa
  async getCompleteOverview() {
    return this.request('/stats/complete-overview');
  }

  // 10. GET /stats/dependencies - Estadísticas por dependencia
  async getDependencies(params = {}) {
    const { period = '7days', startDate, endDate } = params;
    let queryString = `?period=${period}`;
    
    if (period === 'custom' && startDate && endDate) {
      queryString += `&startDate=${startDate}&endDate=${endDate}`;
    }
    
    const url = `/stats/dependencies${queryString}`;
    console.log('📡 Stats Service - Solicitando:', url);
    console.log('📋 Parámetros:', { period, startDate, endDate });
    
    const response = await this.request(url);
    console.log('✅ Stats Service - Respuesta recibida:', response);
    
    return response;
  }

  // Métodos con filtros de fecha
  async getSummaryByDateRange(startDate, endDate) {
    return this.request(`/stats/summary?startDate=${startDate}&endDate=${endDate}`);
  }

  async getInspectionsByDateRange(startDate, endDate) {
    return this.request(`/stats/inspections?startDate=${startDate}&endDate=${endDate}`);
  }

  async getInspectorsByDateRange(startDate, endDate) {
    return this.request(`/stats/inspectors?startDate=${startDate}&endDate=${endDate}`);
  }

  // Métodos adicionales para filtros específicos
  async getStatsByDepartment(departmentId) {
    return this.request(`/stats/dependencies/${departmentId}`);
  }

  async getStatsByInspector(inspectorId) {
    return this.request(`/stats/inspectors/${inspectorId}`);
  }

  async getStatsByType(inspectionType) {
    return this.request(`/stats/types/${inspectionType}`);
  }

  // Método de prueba para verificar conectividad con el backend
  async testConnection() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return {
        success: response.ok,
        status: response.status,
        message: response.ok ? 'Conexión exitosa' : 'Error de conexión'
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        message: `Error de red: ${error.message}`
      };
    }
  }
}

export default new StatsService();