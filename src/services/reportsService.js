// src/services/reportsService.js
import axiosInstance from '../config/axiosConfig';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const reportsService = {
  /**
   * Buscar inspección por número de trámite
   * @param {string} procedureNumber - Número de trámite
   * @returns {Promise<Object|Array>} - Inspección encontrada o array de inspecciones si hay múltiples
   */
  async searchByProcedureNumber(procedureNumber) {
    try {
      console.log('Buscando inspección con número:', procedureNumber);
      const response = await axiosInstance.get(`${API_URL}/reports/inspections`, {
        params: { procedureNumber }
      });
      console.log('Respuesta del backend (search):', response.data);
      
      // El backend ahora devuelve: { success: true, count: X, data: [...] }
      if (response.data.success && response.data.data) {
        const inspections = response.data.data;
        console.log(`Se encontraron ${response.data.count} inspecciones`);
        
        // Si solo hay una inspección, devolverla directamente
        if (response.data.count === 1) {
          console.log('Una sola inspección encontrada:', inspections[0]);
          return inspections[0];
        }
        
        // Si hay múltiples, devolver el array completo con metadata
        console.log('Múltiples inspecciones encontradas:', inspections);
        return {
          multiple: true,
          count: response.data.count,
          inspections: inspections
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error en búsqueda:', error);
      throw error;
    }
  },

  /**
   * Obtener vista previa de inspecciones con filtros
   * @param {Object} filters - Filtros para el reporte
   * @returns {Promise<Object>} - Preview con total y muestra
   */
  async getPreview(filters) {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);
      if (filters.inspectorId) params.append('inspectorId', filters.inspectorId);

      const response = await axiosInstance.get(`${API_URL}/reports/inspections/preview?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error en preview:', error);
      throw error;
    }
  },

  /**
   * Descargar CSV de inspección individual
   * @param {string} procedureNumber - Número de trámite
   */
  async downloadIndividualCSV(procedureNumber) {
    try {
      console.log('Descargando CSV para trámite:', procedureNumber);
      
      // Validar que el procedureNumber no esté vacío
      if (!procedureNumber || procedureNumber.trim() === '') {
        throw new Error('Número de trámite no válido');
      }
      
      const response = await axiosInstance.get(`${API_URL}/reports/inspections/${procedureNumber.trim()}/csv`, {
        responseType: 'blob'
      });

      // Crear y descargar archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = `inspeccion_${procedureNumber}_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando CSV individual:', error);
      console.error('Request URL:', `${API_URL}/reports/inspections/${procedureNumber}/csv`);
      console.error('Response status:', error.response?.status);
      
      // Si el error tiene una respuesta blob, intentar leerla
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          console.error('Error response text:', text);
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || 'Error al descargar el CSV');
        } catch (parseError) {
          // Si no se puede parsear, lanzar el error original
          throw error;
        }
      }
      
      throw error;
    }
  },

  /**
   * Descargar PDF de inspección individual
   * @param {string} procedureNumber - Número de trámite
   */
  async downloadIndividualPDF(procedureNumber) {
    try {
      console.log('Descargando PDF para trámite:', procedureNumber);
      
      // Validar que el procedureNumber no esté vacío
      if (!procedureNumber || procedureNumber.trim() === '') {
        throw new Error('Número de trámite no válido');
      }
      
      const response = await axiosInstance.get(`${API_URL}/reports/inspections/${procedureNumber.trim()}/pdf`, {
        responseType: 'blob'
      });

      // Verificar si la respuesta es realmente un PDF
      if (response.data.type === 'application/json') {
        // Si el backend devolvió JSON en lugar de PDF, leerlo para mostrar el error
        const text = await response.data.text();
        console.error('Backend devolvió JSON en lugar de PDF:', text);
        throw new Error(JSON.parse(text).message || 'Error al generar el PDF');
      }

      // Crear y descargar archivo
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      const fileName = `inspeccion_${procedureNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando PDF individual:', error);
      console.error('Request URL:', `${API_URL}/reports/inspections/${procedureNumber}/pdf`);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      // Si el error tiene una respuesta blob, intentar leerla
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          console.error('Error response text:', text);
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || 'Error al descargar el PDF');
        } catch (parseError) {
          // Si no se puede parsear, lanzar el error original
          throw error;
        }
      }
      
      throw error;
    }
  },

  /**
   * Descargar reporte CSV
   * @param {Object} filters - Filtros para el reporte
   */
  async downloadCSV(filters) {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);
      if (filters.inspectorId) params.append('inspectorId', filters.inspectorId);

      const response = await axiosInstance.get(`${API_URL}/reports/inspections/csv?${params}`, {
        responseType: 'blob'
      });

      // Crear y descargar archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = `inspecciones_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando CSV:', error);
      throw error;
    }
  },

  /**
   * Descargar reporte PDF
   * @param {Object} filters - Filtros para el reporte
   */
  async downloadPDF(filters) {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);
      if (filters.inspectorId) params.append('inspectorId', filters.inspectorId);

      const response = await axiosInstance.get(`${API_URL}/reports/inspections/pdf?${params}`, {
        responseType: 'blob'
      });

      // Crear y descargar archivo
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      const fileName = `reporte_inspecciones_${new Date().toISOString().split('T')[0]}.pdf`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando PDF:', error);
      throw error;
    }
  },

  /**
   * Descargar PDF detallado de una inspección específica
   * @param {number} inspectionId - ID de la inspección
   */
  async downloadDetailedPDF(inspectionId) {
    try {
      const response = await axiosInstance.get(`${API_URL}/reports/inspections/${inspectionId}/pdf`, {
        responseType: 'blob'
      });

      // Crear y descargar archivo
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      const fileName = `inspeccion_${inspectionId}_detalle.pdf`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando PDF detallado:', error);
      throw error;
    }
  },

  /**
   * Descargar CSV de inspección específica por ID
   * @param {number} inspectionId - ID de la inspección
   */
  async downloadCSVById(inspectionId) {
    try {
      console.log('Descargando CSV para inspección ID:', inspectionId);
      
      const response = await axiosInstance.get(`${API_URL}/reports/inspections/by-id/${inspectionId}/csv`, {
        responseType: 'blob'
      });

      // Crear y descargar archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = `inspeccion_${inspectionId}_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando CSV por ID:', error);
      throw error;
    }
  },

  /**
   * Descargar PDF de inspección específica por ID
   * @param {number} inspectionId - ID de la inspección
   */
  async downloadPDFById(inspectionId) {
    try {
      console.log('Descargando PDF para inspección ID:', inspectionId);
      
      const response = await axiosInstance.get(`${API_URL}/reports/inspections/by-id/${inspectionId}/pdf`, {
        responseType: 'blob'
      });

      // Verificar si la respuesta es realmente un PDF
      if (response.data.type === 'application/json') {
        const text = await response.data.text();
        console.error('Backend devolvió JSON en lugar de PDF:', text);
        throw new Error(JSON.parse(text).message || 'Error al generar el PDF');
      }

      // Crear y descargar archivo
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      const fileName = `inspeccion_${inspectionId}_${new Date().toISOString().split('T')[0]}.pdf`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando PDF por ID:', error);
      
      // Si el error tiene una respuesta blob, intentar leerla
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          console.error('Error response text:', text);
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || 'Error al descargar el PDF');
        } catch (parseError) {
          throw error;
        }
      }
      
      throw error;
    }
  }
};

export default reportsService;
