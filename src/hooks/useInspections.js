// src/hooks/useInspections.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { inspectionsService } from '@/services/inspectionsService';
import { mapInspectionDto } from '@/utils/mapInspectionDto';

export function useInspections({ autoFetch = true, initialParams = {} } = {}) {
  const [inspections, setInspections] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(!!autoFetch);
  const [error, setError] = useState(null);
  
  // Usar useRef para evitar recreación de initialParams
  const initialParamsRef = useRef(initialParams);

  const fetchInspections = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await inspectionsService.getInspections(params);
      let inspectionsData = [];
      
      if (data?.items) {
        inspectionsData = data.items;
        setPagination(data.meta || null);
      } else {
        inspectionsData = Array.isArray(data) ? data : [];
        setPagination(null);
      }
      
      // Ordenar por fecha de creación (más nuevo primero)
      const sortedInspections = inspectionsData.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || a.inspectionDate || 0);
        const dateB = new Date(b.createdAt || b.created_at || b.inspectionDate || 0);
        return dateB - dateA; // Orden descendente (más nuevo primero)
      });
      
      setInspections(sortedInspections);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchInspections(initialParamsRef.current);
    }
  }, [autoFetch, fetchInspections]);

  const getInspection = useCallback(async (id) => {
    return await inspectionsService.getInspectionById(id);
  }, []);

  const createInspectionFromForm = useCallback(async (formValues, photosBySection = {}) => {
    const dto = mapInspectionDto(formValues);
    const created = await inspectionsService.createInspection(dto);

    if (!created || !created.id) {
      throw new Error('Inspection creation failed');
    }

    const uploads = [];
    if (photosBySection.mayorOfficePhotos?.length) {
      uploads.push(inspectionsService.uploadPhotos(created.id, photosBySection.mayorOfficePhotos, { section: 'majorOfficePhotos' }));
    }
    if (photosBySection.antiguedadPhotos?.length) {
      uploads.push(inspectionsService.uploadPhotos(created.id, photosBySection.antiguedadPhotos, { section: 'antiguedadPhotos' }));
    }
    if (photosBySection.pcCancellationPhotos?.length) {
      uploads.push(inspectionsService.uploadPhotos(created.id, photosBySection.pcCancellationPhotos, { section: 'pcCancellationPhotos' }));
    }
    if (photosBySection.generalInspectionPhotos?.length) {
      uploads.push(inspectionsService.uploadPhotos(created.id, photosBySection.generalInspectionPhotos, { section: 'generalInspectionPhotos' }));
    }
    if (photosBySection.workReceiptPhotos?.length) {
      uploads.push(inspectionsService.uploadPhotos(created.id, photosBySection.workReceiptPhotos, { section: 'workReceiptPhotos' }));
    }
    if (photosBySection.zmtConcessionPhotos?.length) {
      uploads.push(inspectionsService.uploadPhotos(created.id, photosBySection.zmtConcessionPhotos, { section: 'zmtConcessionPhotos' }));
    }
    await Promise.allSettled(uploads);

    await fetchInspections(initialParamsRef.current);
    return created;
  }, [fetchInspections]);

  const updateInspection = useCallback(async (id, partialFormValues) => {
    const body = mapInspectionDto(partialFormValues);
    const updated = await inspectionsService.updateInspection(id, body);
    await fetchInspections(initialParamsRef.current);
    return updated;
  }, [fetchInspections]);

  const updateInspectionStatus = useCallback(async (id, status) => {
    const updated = await inspectionsService.updateInspectionStatus(id, status);
    await fetchInspections(initialParamsRef.current);
    return updated;
  }, [fetchInspections]);

  const deleteInspection = useCallback(async (id) => {
    await inspectionsService.deleteInspection(id);
    await fetchInspections(initialParamsRef.current);
  }, [fetchInspections]);

  return {
    inspections,
    pagination,
    loading,
    error,
    fetchInspections,
    getInspection,
    createInspectionFromForm,
    updateInspection,
    updateInspectionStatus,
    deleteInspection,
  };
}
