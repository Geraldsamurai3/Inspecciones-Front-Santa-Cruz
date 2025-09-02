// src/hooks/useInspections.js
import { useState, useEffect, useCallback } from 'react';
import { inspectionsService } from '@/services/inspectionsService';
import { mapInspectionDto } from '@/utils/mapInspectionDto';

export function useInspections({ autoFetch = true, initialParams = {} } = {}) {
  const [inspections, setInspections] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(!!autoFetch);
  const [error, setError] = useState(null);

  const fetchInspections = useCallback(async (params = initialParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await inspectionsService.getInspections(params);
      if (data?.items) {
        setInspections(data.items);
        setPagination(data.meta || null);
      } else {
        setInspections(Array.isArray(data) ? data : []);
        setPagination(null);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  useEffect(() => {
    if (autoFetch) fetchInspections(initialParams);
  }, [autoFetch, fetchInspections, initialParams]);

  const getInspection = useCallback(async (id) => {
    return await inspectionsService.getInspectionById(id);
  }, []);

  const createInspectionFromForm = useCallback(async (formValues, photosBySection = {}) => {
    const dto = mapInspectionDto(formValues);
    const created = await inspectionsService.createInspection(dto);

    console.log('Photos by section:', Object.keys(photosBySection).reduce((acc, key) => {
      acc[key] = photosBySection[key]?.length || 0;
      return acc;
    }, {}));

    if (!created || !created.id) {
      console.error('Failed to create inspection or no ID');
      throw new Error('Inspection creation failed');
    }

    const uploads = [];
    if (photosBySection.mayorOfficePhotos?.length) {
      console.log('Uploading mayorOfficePhotos:', photosBySection.mayorOfficePhotos.length);
      uploads.push(inspectionsService.uploadPhotos(created.id, photosBySection.mayorOfficePhotos, { section: 'mayorOfficePhotos' }));
    }
    // ... otros
    console.log('Total uploads to process:', uploads.length);
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
    const results = await Promise.allSettled(uploads);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    console.log(`Uploads: ${successful} successful, ${failed} failed`);
    if (failed > 0) {
      console.error('Failed uploads:', results.filter(r => r.status === 'rejected').map(r => r.reason));
    }

    await fetchInspections();
    return created;
  }, [fetchInspections]);

  const updateInspection = useCallback(async (id, partialFormValues) => {
    const body = mapInspectionDto(partialFormValues);
    const updated = await inspectionsService.updateInspection(id, body);
    await fetchInspections();
    return updated;
  }, [fetchInspections]);

  const deleteInspection = useCallback(async (id) => {
    await inspectionsService.deleteInspection(id);
    await fetchInspections();
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
    deleteInspection,
  };
}
