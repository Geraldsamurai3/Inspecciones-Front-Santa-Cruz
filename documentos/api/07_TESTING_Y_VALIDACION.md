# 🧪 Testing y Validación del Sistema

## 📋 Índice
- [Estrategia de Testing](#estrategia-de-testing)
- [Testing E2E con Playwright](#testing-e2e-con-playwright)
- [Testing Unitario con Vitest](#testing-unitario-con-vitest)
- [Validación de Formularios](#validación-de-formularios)
- [Validación de Seguridad](#validación-de-seguridad)
- [Scripts de Testing](#scripts-de-testing)

---

## 🎯 Estrategia de Testing

### Niveles de Testing

```
┌─────────────────────────────────┐
│   E2E Testing (Playwright)      │  ← Tests end-to-end
├─────────────────────────────────┤
│   Integration Testing           │  ← Tests de integración
├─────────────────────────────────┤
│   Unit Testing (Vitest)         │  ← Tests unitarios
├─────────────────────────────────┤
│   Form Validation (Zod)         │  ← Validación de esquemas
└─────────────────────────────────┘
```

### Cobertura Actual

| Tipo | Herramienta | Estado | Archivos |
|------|-------------|--------|----------|
| **E2E** | Playwright | ✅ Implementado | 1 test suite |
| **Unit** | Vitest | ✅ Implementado | 1 test suite |
| **Validación** | Zod + react-hook-form | ✅ Implementado | En todos los forms |
| **Seguridad** | Custom validators | ✅ Implementado | security-validators.js |

---

## 🎭 Testing E2E con Playwright

### Configuración

**Archivo**: `playwright.config.js`

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### Test Suite: Input Visibility

**Archivo**: `tests/e2e/input-visibility.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Input visibility tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de login antes de cada test
    await page.goto('/admin/login');
  });

  test('Input en LoginPage permanece visible al escribir', async ({ page }) => {
    // Seleccionar el input de email
    const emailInput = page.locator('input[type="email"]');
    
    // Verificar que el input existe
    await expect(emailInput).toBeVisible();
    
    // Escribir en el input
    await emailInput.fill('test@example.com');
    
    // Verificar que el input todavía es visible
    await expect(emailInput).toBeVisible();
    
    // Verificar que el valor se escribió correctamente
    await expect(emailInput).toHaveValue('test@example.com');
  });

  test('Input de password funciona correctamente', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('mySecurePassword123');
    
    // El input debe permanecer visible
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveValue('mySecurePassword123');
  });

  test('Toggle de visibilidad de password funciona', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    const toggleButton = page.locator('button[aria-label="Toggle password visibility"]');
    
    // Verificar estado inicial (type="password")
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click en toggle
    await toggleButton.click();
    
    // Verificar que cambió a type="text"
    const textInput = page.locator('input[type="text"]');
    await expect(textInput).toBeVisible();
  });
});
```

---

### Ejecutar Tests E2E

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar en modo UI (interactivo)
npm run test:e2e:ui

# Ejecutar solo en Chromium
npx playwright test --project=chromium

# Ejecutar en modo debug
npx playwright test --debug

# Ver reporte HTML
npx playwright show-report
```

---

### Estructura de Reportes

```
playwright-report/
├── index.html                      ← Reporte principal
└── data/
    └── 5e64f7f425a46da676eac710c5de2eb5ecec047e.md
```

**Acceso**: Abrir `playwright-report/index.html` en el navegador

---

## 🧪 Testing Unitario con Vitest

### Configuración

**Archivo**: `vite.config.js` (incluye config de testing)

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

---

### Test Suite: Security Validators

**Archivo**: `tests/unit/security-validators.test.js`

```javascript
import { describe, it, expect } from 'vitest';
import {
  validateFileName,
  validateMimeType,
  validateFileSize,
  sanitizeFileName,
  validateImageFile,
} from '../../src/utils/security-validators';

describe('Security Validators', () => {
  
  describe('validateFileName', () => {
    it('debe aceptar nombres de archivo válidos', () => {
      expect(validateFileName('documento.pdf')).toBe(true);
      expect(validateFileName('foto-inspeccion_2024.jpg')).toBe(true);
      expect(validateFileName('reporte-final.xlsx')).toBe(true);
    });

    it('debe rechazar nombres con caracteres peligrosos', () => {
      expect(validateFileName('../../../etc/passwd')).toBe(false);
      expect(validateFileName('file<script>.jpg')).toBe(false);
      expect(validateFileName('photo;rm -rf /.jpg')).toBe(false);
    });

    it('debe rechazar nombres muy largos', () => {
      const longName = 'a'.repeat(256) + '.jpg';
      expect(validateFileName(longName)).toBe(false);
    });

    it('debe rechazar nombres sin extensión', () => {
      expect(validateFileName('archivo_sin_extension')).toBe(false);
    });
  });

  describe('validateMimeType', () => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    it('debe aceptar tipos MIME permitidos', () => {
      expect(validateMimeType('image/jpeg', allowedTypes)).toBe(true);
      expect(validateMimeType('image/png', allowedTypes)).toBe(true);
    });

    it('debe rechazar tipos MIME no permitidos', () => {
      expect(validateMimeType('application/pdf', allowedTypes)).toBe(false);
      expect(validateMimeType('text/html', allowedTypes)).toBe(false);
      expect(validateMimeType('image/svg+xml', allowedTypes)).toBe(false);
    });

    it('debe rechazar MIME type undefined', () => {
      expect(validateMimeType(undefined, allowedTypes)).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    const maxSize = 5 * 1024 * 1024; // 5MB

    it('debe aceptar archivos dentro del límite', () => {
      expect(validateFileSize(1024, maxSize)).toBe(true); // 1KB
      expect(validateFileSize(1024 * 1024, maxSize)).toBe(true); // 1MB
      expect(validateFileSize(4 * 1024 * 1024, maxSize)).toBe(true); // 4MB
    });

    it('debe rechazar archivos que exceden el límite', () => {
      expect(validateFileSize(6 * 1024 * 1024, maxSize)).toBe(false); // 6MB
      expect(validateFileSize(10 * 1024 * 1024, maxSize)).toBe(false); // 10MB
    });

    it('debe rechazar tamaños negativos o cero', () => {
      expect(validateFileSize(0, maxSize)).toBe(false);
      expect(validateFileSize(-1, maxSize)).toBe(false);
    });
  });

  describe('sanitizeFileName', () => {
    it('debe eliminar caracteres peligrosos', () => {
      expect(sanitizeFileName('file<script>.jpg')).toBe('filescript.jpg');
      expect(sanitizeFileName('doc;rm -rf /.pdf')).toBe('docrm-rf.pdf');
    });

    it('debe reemplazar espacios con guiones bajos', () => {
      expect(sanitizeFileName('mi archivo.pdf')).toBe('mi_archivo.pdf');
    });

    it('debe preservar guiones y guiones bajos', () => {
      expect(sanitizeFileName('reporte-final_2024.xlsx')).toBe('reporte-final_2024.xlsx');
    });

    it('debe eliminar path traversal', () => {
      expect(sanitizeFileName('../../../etc/passwd')).toBe('etcpasswd');
    });
  });

  describe('validateImageFile', () => {
    const mockFile = (name, type, size) => ({
      name,
      type,
      size,
    });

    it('debe validar imagen correcta', () => {
      const file = mockFile('foto.jpg', 'image/jpeg', 1024 * 1024);
      const result = validateImageFile(file);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('debe detectar archivo sin nombre', () => {
      const file = mockFile('', 'image/jpeg', 1024);
      const result = validateImageFile(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Nombre de archivo inválido');
    });

    it('debe detectar tipo MIME incorrecto', () => {
      const file = mockFile('doc.pdf', 'application/pdf', 1024);
      const result = validateImageFile(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Tipo de archivo no permitido');
    });

    it('debe detectar archivo muy grande', () => {
      const file = mockFile('foto.jpg', 'image/jpeg', 6 * 1024 * 1024);
      const result = validateImageFile(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Archivo muy grande (máximo 5MB)');
    });

    it('debe detectar múltiples errores', () => {
      const file = mockFile('', 'application/pdf', 6 * 1024 * 1024);
      const result = validateImageFile(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
```

---

### Ejecutar Tests Unitarios

```bash
# Ejecutar todos los tests unitarios
npm run test

# Ejecutar con watch mode
npm run test:watch

# Ejecutar con coverage
npm run test:coverage

# Ejecutar tests específicos
npx vitest run tests/unit/security-validators.test.js
```

---

## 📝 Validación de Formularios

### Zod Schemas

El sistema utiliza **Zod** para validación de esquemas en formularios con **react-hook-form**.

#### Ejemplo: InspectionForm Validation

```javascript
import { z } from 'zod';

// Schema base para información básica
const basicInfoSchema = z.object({
  inspectionDate: z.string()
    .min(1, 'La fecha de inspección es requerida'),
  
  procedureNumber: z.string()
    .min(1, 'El número de trámite es requerido')
    .max(100, 'Máximo 100 caracteres'),
  
  applicantType: z.enum(['anonymous', 'physical_person', 'juridical_person'], {
    errorMap: () => ({ message: 'Tipo de solicitante inválido' })
  }),
  
  inspectors: z.array(z.string())
    .min(1, 'Debe asignar al menos un inspector'),
  
  district: z.string()
    .min(1, 'El distrito es requerido'),
  
  exactAddress: z.string()
    .min(10, 'La dirección debe tener al menos 10 caracteres')
    .max(500, 'Máximo 500 caracteres'),
});

// Schema para Persona Física
const physicalPersonSchema = z.object({
  applicantName: z.string()
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  
  applicantLastName: z.string()
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  
  applicantIdNumber: z.string()
    .regex(/^\d{9}$/, 'La cédula debe tener 9 dígitos'),
});

// Schema para Persona Jurídica
const juridicalPersonSchema = z.object({
  companyName: z.string()
    .min(2, 'Mínimo 2 caracteres')
    .max(200, 'Máximo 200 caracteres'),
  
  companyId: z.string()
    .regex(/^\d{10}$/, 'La cédula jurídica debe tener 10 dígitos'),
});

// Schema condicional según tipo de solicitante
const applicantSchema = z.discriminatedUnion('applicantType', [
  z.object({
    applicantType: z.literal('anonymous'),
  }),
  z.object({
    applicantType: z.literal('physical_person'),
    ...physicalPersonSchema.shape,
  }),
  z.object({
    applicantType: z.literal('juridical_person'),
    ...juridicalPersonSchema.shape,
  }),
]);

// Schema para fotos (ejemplo: Mayor Office)
const mayorOfficePhotosSchema = z.object({
  licenciaComercialFrontal: z.object({
    file: z.instanceof(File, { message: 'Foto requerida' }),
  }),
  
  licenciaComercialLateral: z.object({
    file: z.instanceof(File, { message: 'Foto requerida' }),
  }),
  
  rotulo: z.object({
    file: z.instanceof(File, { message: 'Foto requerida' }),
  }),
}).refine(
  (data) => {
    // Validación personalizada
    return Object.values(data).every(photo => photo.file);
  },
  {
    message: 'Todas las fotos son requeridas',
  }
);
```

---

### react-hook-form Integration

```javascript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function InspectionForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      inspectionDate: '',
      procedureNumber: '',
      applicantType: '',
      inspectors: [],
      district: '',
      exactAddress: '',
    },
  });

  const onSubmit = async (data) => {
    // Validación pasó, procesar datos
    console.log('Datos válidos:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('procedureNumber')} />
      {errors.procedureNumber && (
        <span className="error">{errors.procedureNumber.message}</span>
      )}
      
      {/* Más campos... */}
    </form>
  );
}
```

---

### Validaciones Custom

#### Validación de Fecha

```javascript
const dateSchema = z.string()
  .refine(
    (date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      return selectedDate <= today;
    },
    {
      message: 'La fecha no puede ser futura',
    }
  );
```

#### Validación de Cédula Costarricense

```javascript
const cedulaSchema = z.string()
  .refine(
    (cedula) => {
      // Remover guiones y espacios
      const clean = cedula.replace(/[-\s]/g, '');
      
      // Debe tener 9 dígitos
      if (!/^\d{9}$/.test(clean)) return false;
      
      // Validación de dígito verificador (algoritmo oficial)
      return validateCedulaCheckDigit(clean);
    },
    {
      message: 'Cédula inválida',
    }
  );
```

---

## 🔒 Validación de Seguridad

### Archivo: `src/utils/security-validators.js`

```javascript
/**
 * Valida el nombre de un archivo para prevenir ataques
 * @param {string} fileName - Nombre del archivo
 * @returns {boolean}
 */
export function validateFileName(fileName) {
  if (!fileName || typeof fileName !== 'string') return false;
  
  // Máximo 255 caracteres
  if (fileName.length > 255) return false;
  
  // Debe tener extensión
  if (!fileName.includes('.')) return false;
  
  // Rechazar path traversal
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return false;
  }
  
  // Rechazar caracteres peligrosos
  const dangerousChars = /[<>:"|?*;]/;
  if (dangerousChars.test(fileName)) return false;
  
  return true;
}

/**
 * Valida el tipo MIME de un archivo
 * @param {string} mimeType - Tipo MIME del archivo
 * @param {string[]} allowedTypes - Tipos permitidos
 * @returns {boolean}
 */
export function validateMimeType(mimeType, allowedTypes) {
  if (!mimeType || !allowedTypes) return false;
  return allowedTypes.includes(mimeType);
}

/**
 * Valida el tamaño de un archivo
 * @param {number} fileSize - Tamaño en bytes
 * @param {number} maxSize - Tamaño máximo permitido
 * @returns {boolean}
 */
export function validateFileSize(fileSize, maxSize) {
  if (!fileSize || fileSize <= 0) return false;
  return fileSize <= maxSize;
}

/**
 * Sanitiza el nombre de un archivo
 * @param {string} fileName - Nombre original
 * @returns {string} - Nombre sanitizado
 */
export function sanitizeFileName(fileName) {
  return fileName
    .replace(/[<>:"|?*;]/g, '') // Eliminar caracteres peligrosos
    .replace(/\.\./g, '') // Eliminar path traversal
    .replace(/[\/\\]/g, '') // Eliminar slashes
    .replace(/\s+/g, '_') // Espacios a guiones bajos
    .toLowerCase();
}

/**
 * Validación completa de archivo de imagen
 * @param {File} file - Archivo a validar
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export function validateImageFile(file) {
  const errors = [];
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  // Validar nombre
  if (!validateFileName(file.name)) {
    errors.push('Nombre de archivo inválido');
  }
  
  // Validar tipo
  if (!validateMimeType(file.type, allowedTypes)) {
    errors.push('Tipo de archivo no permitido (solo JPG, PNG)');
  }
  
  // Validar tamaño
  if (!validateFileSize(file.size, maxSize)) {
    errors.push('Archivo muy grande (máximo 5MB)');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

---

## 🚀 Scripts de Testing

### package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

---

## 📊 Cobertura de Tests

### Áreas Cubiertas

✅ **Validación de Seguridad**
- Nombres de archivo
- Tipos MIME
- Tamaños de archivo
- Sanitización

✅ **E2E - Login Flow**
- Visibilidad de inputs
- Toggle de password
- Validación de formulario

### Áreas por Cubrir (Recomendaciones)

⚠️ **Tests E2E adicionales**:
- Flujo completo de creación de inspección
- Flujo de gestión de usuarios
- Flujo de reportes
- Navegación entre páginas

⚠️ **Tests Unitarios adicionales**:
- Utilities (date-helpers, mapInspectionDto)
- Custom hooks
- API services (mocks)

⚠️ **Tests de Integración**:
- Integración con backend
- Flujos completos de negocio

---

## 🔍 Buenas Prácticas de Testing

### 1. Naming Conventions

```javascript
describe('Componente/Funcionalidad', () => {
  it('debe hacer X cuando Y', () => {
    // Test
  });
});
```

### 2. AAA Pattern

```javascript
it('debe validar cédula correcta', () => {
  // Arrange (Preparar)
  const cedula = '123456789';
  
  // Act (Actuar)
  const result = validateCedula(cedula);
  
  // Assert (Verificar)
  expect(result).toBe(true);
});
```

### 3. Test Isolation

Cada test debe ser independiente y no depender de otros.

### 4. Mock External Dependencies

```javascript
import { vi } from 'vitest';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));
```

---

**Documento actualizado**: ${new Date().toLocaleDateString('es-CR')}
