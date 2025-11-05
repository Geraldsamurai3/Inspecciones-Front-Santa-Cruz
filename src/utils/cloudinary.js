/**
 * Utilidades para subir imágenes a Cloudinary
 */

const CLOUDINARY_UPLOAD_URL = `${import.meta.env.VITE_API_URL}/cloudinary/upload`;

/**
 * Sube una imagen a Cloudinary
 * @param {File} file - Archivo de imagen
 * @param {string} token - JWT token
 * @returns {Promise<string>} - URL de la imagen subida
 */
export const uploadImageToCloudinary = async (file, token) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al subir imagen');
    }

    const data = await response.json();
    return data.secure_url; // Retorna URL segura
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Sube múltiples imágenes a Cloudinary
 * @param {FileList|File[]} files - Lista de archivos
 * @param {string} token - JWT token
 * @returns {Promise<string[]>} - Array de URLs
 */
export const uploadMultipleImages = async (files, token) => {
  const uploadPromises = Array.from(files).map(file => 
    uploadImageToCloudinary(file, token)
  );

  return await Promise.all(uploadPromises);
};

/**
 * Validar que el archivo sea una imagen válida
 * @param {File} file - Archivo a validar
 * @returns {boolean}
 */
export const isValidImage = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato de imagen no válido. Use JPG, PNG, GIF o WEBP.'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'La imagen es muy grande. Máximo 5MB.'
    };
  }

  return { valid: true };
};

/**
 * Validar múltiples archivos de imagen
 * @param {FileList|File[]} files - Lista de archivos
 * @returns {{valid: File[], invalid: {file: File, error: string}[]}}
 */
export const validateMultipleImages = (files) => {
  const valid = [];
  const invalid = [];

  Array.from(files).forEach(file => {
    const validation = isValidImage(file);
    if (validation.valid) {
      valid.push(file);
    } else {
      invalid.push({ file, error: validation.error });
    }
  });

  return { valid, invalid };
};
