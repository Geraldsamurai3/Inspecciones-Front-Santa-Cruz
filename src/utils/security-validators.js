// src/utils/security-validators.js

/**
 * Utilidades de seguridad para validación y sanitización de datos
 * Siguiendo las mejores prácticas de seguridad web
 */

// Patrones de seguridad
const SECURITY_PATTERNS = {
  // XSS Prevention
  SCRIPT_TAG: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  HTML_TAGS: /<[^>]*>/g,
  SQL_INJECTION: /(union|select|insert|update|delete|drop|create|alter|exec|execute|\-\-|\/\*|\*\/|xp_|sp_)/gi,
  
  // Path Traversal
  PATH_TRAVERSAL: /\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c/gi,
  
  // Valid formats
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE_CR: /^[0-9\-\+\(\)\s]{8,15}$/,
  CEDULA_CR: /^[0-9]{9,10}$/,
  PROCEDURE_NUMBER: /^[a-zA-Z0-9\-]{1,50}$/,
  
  // File security
  SAFE_FILENAME: /^[a-zA-Z0-9\-_\.]{1,255}$/,
  ALLOWED_IMAGE_TYPES: /\.(jpg|jpeg|png|gif|webp)$/i,
};

/**
 * Sanitiza strings para prevenir XSS
 * @param {string} input - String a sanitizar
 * @returns {string} String sanitizado
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(SECURITY_PATTERNS.SCRIPT_TAG, '') // Remover script tags
    .replace(SECURITY_PATTERNS.HTML_TAGS, '') // Remover HTML tags
    .replace(/[<>]/g, '') // Remover < y >
    .slice(0, 1000); // Limitar longitud
};

/**
 * Sanitiza objetos recursivamente
 * @param {Object} obj - Objeto a sanitizar
 * @returns {Object} Objeto sanitizado
 */
export const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const cleanKey = sanitizeString(key);
    sanitized[cleanKey] = sanitizeObject(value);
  }
  
  return sanitized;
};

/**
 * Valida y sanitiza un email
 * @param {string} email - Email a validar
 * @returns {string|null} Email válido o null
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return null;
  
  const sanitized = sanitizeString(email.toLowerCase());
  return SECURITY_PATTERNS.EMAIL.test(sanitized) ? sanitized : null;
};

/**
 * Valida número de cédula costarricense
 * @param {string} cedula - Cédula a validar
 * @returns {string|null} Cédula válida o null
 */
export const validateCedula = (cedula) => {
  if (!cedula || typeof cedula !== 'string') return null;
  
  const sanitized = sanitizeString(cedula.replace(/\D/g, ''));
  return SECURITY_PATTERNS.CEDULA_CR.test(sanitized) ? sanitized : null;
};

/**
 * Valida número de teléfono
 * @param {string} phone - Teléfono a validar
 * @returns {string|null} Teléfono válido o null
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return null;
  
  const sanitized = sanitizeString(phone);
  return SECURITY_PATTERNS.PHONE_CR.test(sanitized) ? sanitized : null;
};

/**
 * Valida número de procedimiento
 * @param {string} procedureNumber - Número de procedimiento
 * @returns {string|null} Número válido o null
 */
export const validateProcedureNumber = (procedureNumber) => {
  if (!procedureNumber || typeof procedureNumber !== 'string') return null;
  
  const sanitized = sanitizeString(procedureNumber);
  return SECURITY_PATTERNS.PROCEDURE_NUMBER.test(sanitized) ? sanitized : null;
};

/**
 * Detecta posibles ataques de inyección SQL
 * @param {string} input - String a verificar
 * @returns {boolean} true si es seguro, false si detecta patrones sospechosos
 */
export const isSQLSafe = (input) => {
  if (typeof input !== 'string') return true;
  return !SECURITY_PATTERNS.SQL_INJECTION.test(input);
};

/**
 * Detecta intentos de path traversal
 * @param {string} path - Path a verificar
 * @returns {boolean} true si es seguro, false si detecta traversal
 */
export const isPathSafe = (path) => {
  if (typeof path !== 'string') return true;
  return !SECURITY_PATTERNS.PATH_TRAVERSAL.test(path);
};

/**
 * Valida nombres de archivos
 * @param {string} filename - Nombre de archivo
 * @returns {boolean} true si es seguro
 */
export const isFilenameSafe = (filename) => {
  if (typeof filename !== 'string') return false;
  return SECURITY_PATTERNS.SAFE_FILENAME.test(filename);
};

/**
 * Valida tipos de imagen permitidos
 * @param {string} filename - Nombre de archivo
 * @returns {boolean} true si es un tipo de imagen permitido
 */
export const isAllowedImageType = (filename) => {
  if (typeof filename !== 'string') return false;
  return SECURITY_PATTERNS.ALLOWED_IMAGE_TYPES.test(filename);
};

/**
 * Valida longitud máxima de texto
 * @param {string} text - Texto a validar
 * @param {number} maxLength - Longitud máxima permitida
 * @returns {boolean} true si cumple con la longitud
 */
export const isValidLength = (text, maxLength = 1000) => {
  if (typeof text !== 'string') return true;
  return text.length <= maxLength;
};

/**
 * Rate limiting simple en memoria (para desarrollo)
 * En producción debería usar Redis o similar
 */
const rateLimitStore = new Map();

/**
 * Rate limiting básico
 * @param {string} identifier - Identificador único (IP, user ID, etc.)
 * @param {number} maxRequests - Máximo de requests permitidos
 * @param {number} windowMs - Ventana de tiempo en millisegundos
 * @returns {boolean} true si está dentro del límite
 */
export const isWithinRateLimit = (identifier, maxRequests = 100, windowMs = 60000) => {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitStore.has(identifier)) {
    rateLimitStore.set(identifier, []);
  }
  
  const requests = rateLimitStore.get(identifier);
  
  // Limpiar requests antiguos
  const validRequests = requests.filter(timestamp => timestamp > windowStart);
  
  if (validRequests.length >= maxRequests) {
    return false;
  }
  
  // Agregar request actual
  validRequests.push(now);
  rateLimitStore.set(identifier, validRequests);
  
  return true;
};

/**
 * Genera un token CSRF simple
 * @returns {string} Token CSRF
 */
export const generateCSRFToken = () => {
  return crypto.randomUUID ? crypto.randomUUID() : 
    Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Valida un token JWT básico (solo estructura, no firma)
 * @param {string} token - Token JWT
 * @returns {boolean} true si tiene estructura válida
 */
export const isValidJWTStructure = (token) => {
  if (!token || typeof token !== 'string') return false;
  
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  try {
    // Verificar que cada parte sea base64 válido
    parts.forEach(part => {
      if (part.length === 0) throw new Error('Empty part');
      atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    });
    return true;
  } catch {
    return false;
  }
};

/**
 * Headers de seguridad recomendados para requests
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
};

export default {
  sanitizeString,
  sanitizeObject,
  validateEmail,
  validateCedula,
  validatePhone,
  validateProcedureNumber,
  isSQLSafe,
  isPathSafe,
  isFilenameSafe,
  isAllowedImageType,
  isValidLength,
  isWithinRateLimit,
  generateCSRFToken,
  isValidJWTStructure,
  SECURITY_HEADERS,
};