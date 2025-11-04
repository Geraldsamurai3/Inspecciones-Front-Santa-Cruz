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
    console.log('📤 Creating inspection with DTO:', dto);
    const created = await inspectionsService.createInspection(dto);

    if (!created || !created.id) {
      throw new Error('Inspection creation failed');
    }

    console.log('✅ Inspection created with ID:', created.id);
    console.log('📸 Photos to upload by section:', photosBySection);

    const uploads = [];
    if (photosBySection.mayorOfficePhotos?.length) {
      console.log(`📸 Uploading ${photosBySection.mayorOfficePhotos.length} Mayor Office photos`);
      uploads.push(inspectionsService.uploadPhotos(created.id, photosBySection.mayorOfficePhotos, { section: 'mayorOfficePhotos' }));
    }
    if (photosBySection.antiguedadPhotos?.length) {
      console.log(`📸 Uploading ${photosBySection.antiguedadPhotos.length} Antiquity photos`);
      uploads.push(inspectionsService.uploadPhotos(created.id, photosBySection.antiguedadPhotos, { section: 'antiquityPhotos' }));
    }
    if (photosBySection.pcCancellationPhotos?.length) {
      console.log(`📸 Uploading ${photosBySection.pcCancellationPhotos.length} PC Cancellation photos`);
      uploads.push(inspectionsService.uploadPhotos(created.id, photosBySection.pcCancellationPhotos, { section: 'pcCancellationPhotos' }));
    }
    if (photosBySection.generalInspectionPhotos?.length) {
      console.log(`📸 Uploading ${photosBySection.generalInspectionPhotos.length} General Inspection photos`);
      uploads.push(inspectionsService.uploadPhotos(created.id, photosBySection.generalInspectionPhotos, { section: 'generalInspectionPhotos' }));
    }
    if (photosBySection.workReceiptPhotos?.length) {
      console.log(`📸 Uploading ${photosBySection.workReceiptPhotos.length} Work Receipt photos`);
      uploads.push(inspectionsService.uploadPhotos(created.id, photosBySection.workReceiptPhotos, { section: 'workReceiptPhotos' }));
    }
    if (photosBySection.zmtConcessionPhotos?.length) {
      console.log(`📸 Uploading ${photosBySection.zmtConcessionPhotos.length} ZMT Concession photos`);
      uploads.push(inspectionsService.uploadPhotos(created.id, photosBySection.zmtConcessionPhotos, { section: 'zmtConcessionPhotos' }));
    }
    if (photosBySection.workClosurePhotos?.length) {
      console.log(`📸 Uploading ${photosBySection.workClosurePhotos.length} Work Closure photos`);
      uploads.push(inspectionsService.uploadPhotos(created.id, photosBySection.workClosurePhotos, { section: 'workClosurePhotos' }));
    }
    
    console.log(`📤 Total upload requests: ${uploads.length}`);
    const results = await Promise.allSettled(uploads);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ Upload ${index + 1} successful:`, result.value);
      } else {
        console.error(`❌ Upload ${index + 1} failed:`, result.reason);
      }
    });

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

  // Papelera functions
  const getTrashInspections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inspectionsService.getTrashInspections();
      const inspectionsData = Array.isArray(data) ? data : [];
      
      // Ordenar por fecha de eliminación (más reciente primero)
      const sortedInspections = inspectionsData.sort((a, b) => {
        const dateA = new Date(a.deletedAt || 0);
        const dateB = new Date(b.deletedAt || 0);
        return dateB - dateA;
      });
      
      return sortedInspections;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const moveToTrash = useCallback(async (id) => {
    const result = await inspectionsService.moveToTrash(id);
    await fetchInspections(initialParamsRef.current);
    return result;
  }, [fetchInspections]);

  const restoreFromTrash = useCallback(async (id) => {
    const result = await inspectionsService.restoreFromTrash(id);
    await fetchInspections(initialParamsRef.current);
    return result;
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
    // Papelera
    getTrashInspections,
    moveToTrash,
    restoreFromTrash,
  };
}
