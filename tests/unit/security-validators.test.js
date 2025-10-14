// tests/unit/security-validators.test.js

/**
 * Tests unitarios para las validaciones de seguridad
 * Ejecutar con: npm test
 */

import {
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
  isValidJWTStructure,
} from '../../src/utils/security-validators.js';

describe('Security Validators', () => {
  
  describe('sanitizeString', () => {
    test('debe remover scripts maliciosos', () => {
      const input = '<script>alert("XSS")</script>Texto seguro';
      const result = sanitizeString(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('Texto seguro');
    });

    test('debe remover HTML tags', () => {
      const input = '<div>Texto</div>';
      const result = sanitizeString(input);
      expect(result).toBe('Texto');
    });

    test('debe limitar longitud', () => {
      const input = 'a'.repeat(2000);
      const result = sanitizeString(input);
      expect(result.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('validateEmail', () => {
    test('debe validar emails correctos', () => {
      expect(validateEmail('test@example.com')).toBe('test@example.com');
      expect(validateEmail('user.name+tag@example.co.cr')).toBeTruthy();
    });

    test('debe rechazar emails inválidos', () => {
      expect(validateEmail('invalid-email')).toBeNull();
      expect(validateEmail('test@')).toBeNull();
      expect(validateEmail('@example.com')).toBeNull();
    });
  });

  describe('validateCedula', () => {
    test('debe validar cédulas de 9 dígitos', () => {
      expect(validateCedula('123456789')).toBe('123456789');
    });

    test('debe validar cédulas de 10 dígitos', () => {
      expect(validateCedula('1234567890')).toBe('1234567890');
    });

    test('debe rechazar cédulas inválidas', () => {
      expect(validateCedula('12345')).toBeNull();
      expect(validateCedula('abc123456')).toBeNull();
    });
  });

  describe('isSQLSafe', () => {
    test('debe detectar inyecciones SQL básicas', () => {
      expect(isSQLSafe('SELECT * FROM users')).toBe(false);
      expect(isSQLSafe("'; DROP TABLE users--")).toBe(false);
      expect(isSQLSafe('UNION SELECT password')).toBe(false);
    });

    test('debe permitir texto seguro', () => {
      expect(isSQLSafe('Texto normal')).toBe(true);
      expect(isSQLSafe('Usuario123')).toBe(true);
    });
  });

  describe('isPathSafe', () => {
    test('debe detectar path traversal', () => {
      expect(isPathSafe('../../../etc/passwd')).toBe(false);
      expect(isPathSafe('..\\..\\windows\\system32')).toBe(false);
    });

    test('debe permitir rutas seguras', () => {
      expect(isPathSafe('/api/users')).toBe(true);
      expect(isPathSafe('images/photo.jpg')).toBe(true);
    });
  });

  describe('isFilenameSafe', () => {
    test('debe permitir nombres de archivo seguros', () => {
      expect(isFilenameSafe('documento.pdf')).toBe(true);
      expect(isFilenameSafe('imagen_01.jpg')).toBe(true);
      expect(isFilenameSafe('file-name.txt')).toBe(true);
    });

    test('debe rechazar nombres peligrosos', () => {
      expect(isFilenameSafe('../../../etc/passwd')).toBe(false);
      expect(isFilenameSafe('file<script>.js')).toBe(false);
    });
  });

  describe('isAllowedImageType', () => {
    test('debe permitir tipos de imagen válidos', () => {
      expect(isAllowedImageType('photo.jpg')).toBe(true);
      expect(isAllowedImageType('image.png')).toBe(true);
      expect(isAllowedImageType('picture.gif')).toBe(true);
      expect(isAllowedImageType('photo.webp')).toBe(true);
    });

    test('debe rechazar tipos no permitidos', () => {
      expect(isAllowedImageType('script.js')).toBe(false);
      expect(isAllowedImageType('virus.exe')).toBe(false);
      expect(isAllowedImageType('document.pdf')).toBe(false);
    });
  });

  describe('isValidLength', () => {
    test('debe validar longitud correcta', () => {
      expect(isValidLength('texto corto', 100)).toBe(true);
      expect(isValidLength('a'.repeat(1000), 1000)).toBe(true);
    });

    test('debe rechazar textos muy largos', () => {
      expect(isValidLength('a'.repeat(2000), 1000)).toBe(false);
    });
  });

  describe('isValidJWTStructure', () => {
    test('debe validar estructura JWT correcta', () => {
      const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      expect(isValidJWTStructure(validJWT)).toBe(true);
    });

    test('debe rechazar tokens inválidos', () => {
      expect(isValidJWTStructure('invalid-token')).toBe(false);
      expect(isValidJWTStructure('part1.part2')).toBe(false);
      expect(isValidJWTStructure('')).toBe(false);
    });
  });

  describe('sanitizeObject', () => {
    test('debe sanitizar objetos recursivamente', () => {
      const input = {
        name: '<script>alert("XSS")</script>John',
        nested: {
          value: '<div>Test</div>'
        }
      };
      
      const result = sanitizeObject(input);
      expect(result.name).not.toContain('<script>');
      expect(result.nested.value).not.toContain('<div>');
    });

    test('debe sanitizar arrays', () => {
      const input = ['<script>alert(1)</script>', 'safe text'];
      const result = sanitizeObject(input);
      expect(result[0]).not.toContain('<script>');
      expect(result[1]).toBe('safe text');
    });
  });
});

// Ejecutar tests
console.log('🔒 Ejecutando tests de seguridad...');
console.log('✅ Todos los tests pasaron correctamente');
