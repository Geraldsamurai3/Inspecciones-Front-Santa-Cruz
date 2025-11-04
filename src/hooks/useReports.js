// src/hooks/useReports.js
import { useState } from 'react';
import reportsService from '@/services/reportsService';

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [inspection, setInspection] = useState(null);
  const [inspections, setInspections] = useState([]); // Array para múltiples inspecciones
  const [error, setError] = useState(null);

  /**
   * Buscar inspección por número de trámite
   * @param {string} procedureNumber - Número de trámite
   */
  const searchByProcedureNumber = async (procedureNumber) => {
    setLoading(true);
    setError(null);
    setInspections([]); // Limpiar inspecciones múltiples
    try {
      const data = await reportsService.searchByProcedureNumber(procedureNumber);
      
      // Si hay múltiples inspecciones
      if (data.multiple) {
        setInspections(data.inspections);
        setInspection(null);
        return data;
      }
      
      // Si es una sola inspección
      setInspection(data);
      setInspections([]);
      return data;
    } catch (err) {
      setError(err);
      setInspection(null);
      setInspections([]);
      console.error('Error al buscar inspección:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Descargar CSV de inspección individual
   * @param {string} procedureNumber - Número de trámite
   */
  const downloadIndividualCSV = async (procedureNumber) => {
    setLoading(true);
    setError(null);
    try {
      await reportsService.downloadIndividualCSV(procedureNumber);
    } catch (err) {
      setError(err);
      console.error('Error al descargar CSV individual:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Descargar PDF de inspección individual
   * @param {string} procedureNumber - Número de trámite
   */
  const downloadIndividualPDF = async (procedureNumber) => {
    setLoading(true);
    setError(null);
    try {
      await reportsService.downloadIndividualPDF(procedureNumber);
    } catch (err) {
      setError(err);
      console.error('Error al descargar PDF individual:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener vista previa de inspecciones
   * @param {Object} filters - Filtros para el reporte
   */
  const getPreview = async (filters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsService.getPreview(filters);
      setPreview(data);
      return data;
    } catch (err) {
      setError(err);
      console.error('Error al obtener preview:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Descargar reporte CSV
   * @param {Object} filters - Filtros para el reporte
   */
  const downloadCSV = async (filters) => {
    setLoading(true);
    setError(null);
    try {
      await reportsService.downloadCSV(filters);
    } catch (err) {
      setError(err);
      console.error('Error al descargar CSV:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Descargar reporte PDF
   * @param {Object} filters - Filtros para el reporte
   */
  const downloadPDF = async (filters) => {
    setLoading(true);
    setError(null);
    try {
      await reportsService.downloadPDF(filters);
    } catch (err) {
      setError(err);
      console.error('Error al descargar PDF:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Descargar PDF detallado de una inspección
   * @param {number} inspectionId - ID de la inspección
   */
  const downloadDetailedPDF = async (inspectionId) => {
    setLoading(true);
    setError(null);
    try {
      await reportsService.downloadDetailedPDF(inspectionId);
    } catch (err) {
      setError(err);
      console.error('Error al descargar PDF detallado:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Descargar CSV por ID de inspección
   * @param {number} inspectionId - ID de la inspección
   */
  const downloadCSVById = async (inspectionId) => {
    setLoading(true);
    setError(null);
    try {
      await reportsService.downloadCSVById(inspectionId);
    } catch (err) {
      setError(err);
      console.error('Error al descargar CSV por ID:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Descargar PDF por ID de inspección
   * @param {number} inspectionId - ID de la inspección
   */
  const downloadPDFById = async (inspectionId) => {
    setLoading(true);
    setError(null);
    try {
      await reportsService.downloadPDFById(inspectionId);
    } catch (err) {
      setError(err);
      console.error('Error al descargar PDF por ID:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpiar la vista previa
   */
  const clearPreview = () => {
    setPreview(null);
    setError(null);
  };

  /**
   * Limpiar la inspección individual
   */
  const clearInspection = () => {
    setInspection(null);
    setError(null);
  };

  return {
    loading,
    preview,
    inspection,
    inspections, // Array de múltiples inspecciones
    error,
    searchByProcedureNumber,
    downloadIndividualCSV,
    downloadIndividualPDF,
    downloadCSVById,
    downloadPDFById,
    getPreview,
    downloadCSV,
    downloadPDF,
    downloadDetailedPDF,
    clearPreview,
    clearInspection,
  };
};
