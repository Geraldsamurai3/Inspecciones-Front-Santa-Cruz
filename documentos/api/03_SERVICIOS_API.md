# 🌐 Servicios API y Endpoints

## 📋 Índice
- [Visión General](#visión-general)
- [Configuración Base](#configuración-base)
- [authService](#authservice)
- [inspectionsService](#inspectionsservice)
- [usersService](#usersservice)
- [statsService](#statsservice)
- [dashboardService](#dashboardservice)
- [reportsService](#reportsservice)
- [profileService](#profileservice)
- [Manejo de Errores](#manejo-de-errores)
- [Interceptors Axios](#interceptors-axios)

---

## 🎯 Visión General

La capa de servicios abstrae toda la comunicación con el backend REST API. Cada servicio encapsula un dominio específico de funcionalidad y proporciona métodos para operaciones CRUD y tareas especializadas.

### Backend Base URL
```javascript
VITE_API_URL=https://inspecciones-muni-santa-cruz-production.up.railway.app
```

### Patrón de Diseño

Todos los servicios (excepto `reportsService`) utilizan el mismo patrón:

```javascript
// Función helper request
async function request(path, opts = {}) {
  const token = localStorage.getItem('token');
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  
  const res = await fetch(`${BASE_URL}${path}`, {
    method: opts.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...opts.headers
    },
    credentials: 'include',
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  
  if (!res.ok) {
    // Manejo de errores (incluye 401 para token expirado)
    if (res.status === 401) {
      handleTokenExpired();
      throw new Error('Token expirado');
    }
    throw new Error(`Error ${res.status}`);
  }
  
  return res.json();
}

// Servicio expuesto
export const someService = {
  getItems: () => request('/items'),
  createItem: (data) => request('/items', { method: 'POST', body: data }),
  // ...
};
```

**`reportsService`** usa **Axios** con interceptors para descargas de archivos binarios (CSV/PDF).

---

## ⚙️ Configuración Base

### axiosConfig.js

```javascript
// src/config/axiosConfig.js
import axios from 'axios';
import { handleTokenExpired } from '../utils/auth-helpers';

const BASE_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de REQUEST: Agregar token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de RESPONSE: Manejar errores 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthRequest = requestUrl.includes('/auth/login') || 
                           requestUrl.includes('/auth/register') ||
                           requestUrl.includes('/auth/forgot-password') ||
                           requestUrl.includes('/auth/reset-password');
      
      // Solo manejar token expirado si NO es autenticación
      if (!isAuthRequest) {
        handleTokenExpired();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

---

## 🔐 authService

**Archivo**: `src/services/authService.js`

### Métodos

#### `login(email, password)`

Autentica al usuario y devuelve un JWT.

**Request:**
```javascript
POST /auth/login
Content-Type: application/json

{
  "email": "admin@muni.com",
  "password": "secret123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@muni.com",
    "firstName": "Juan",
    "role": "admin"
  }
}
```

**Uso:**
```javascript
import { authService } from '@/services/authService';

const response = await authService.login('admin@muni.com', 'password123');
const token = response.access_token;
localStorage.setItem('token', token);
```

---

#### `register(userData)`

Registra un nuevo usuario (solo Admin).

**Request:**
```javascript
POST /auth/register
Content-Type: application/json

{
  "firstName": "María",
  "lastName": "González",
  "secondLastName": "Pérez",
  "cedula": "1-1234-5678",
  "email": "maria@example.com",
  "password": "pass123",
  "phone": "8888-8888",
  "role": "inspector"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "user": { ... }
}
```

**Uso:**
```javascript
const newUser = {
  firstName: 'María',
  lastName: 'González',
  secondLastName: 'Pérez',
  cedula: '1-1234-5678',
  email: 'maria@example.com',
  password: 'pass123',
  phone: '8888-8888',
  role: 'inspector'
};

const response = await authService.register(newUser);
```

---

### Seguridad en authService

#### Sanitización de Inputs

```javascript
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  return input;
};
```

Previene ataques XSS eliminando scripts maliciosos.

#### Validación de Path

```javascript
if (path.includes('../') || path.includes('..\\')) {
  throw new Error('Invalid path detected');
}
```

Previene ataques de directory traversal.

#### Validación de Token

```javascript
const authHeader = (token && isValidToken(token)) 
  ? { Authorization: `Bearer ${token}` } 
  : {};
```

Solo envía tokens con formato válido.

---

## 📄 inspectionsService

**Archivo**: `src/services/inspectionsService.js`

### Métodos

#### `getInspections(params)`

Obtiene lista de inspecciones con paginación y filtros.

**Request:**
```javascript
GET /inspections?page=1&limit=10&status=Nuevo&dependency=MayorOffice
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "procedureNumber": "2024-001",
      "inspectionDate": "2024-01-15",
      "status": "Nuevo",
      "dependency": "MayorOffice",
      "location": { ... },
      "inspectors": [ ... ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

**Uso:**
```javascript
const params = {
  page: 1,
  limit: 10,
  status: 'Nuevo',
  dependency: 'MayorOffice'
};

const response = await inspectionsService.getInspections(params);
```

---

#### `getInspectionById(id)`

Obtiene una inspección específica por ID.

**Request:**
```javascript
GET /inspections/123
```

**Response:**
```json
{
  "id": 123,
  "procedureNumber": "2024-001",
  "inspectionDate": "2024-01-15T00:00:00.000Z",
  "status": "Nuevo",
  "dependency": "MayorOffice",
  "applicantType": "Persona Física",
  "location": {
    "district": "SantaCruz",
    "exactAddress": "Calle Principal, 100m norte"
  },
  "individualRequest": {
    "firstName": "Juan",
    "lastName1": "Pérez",
    "lastName2": "García",
    "physicalId": "1-1234-5678"
  },
  "mayorOffice": {
    "procedureType": "Permiso",
    "observations": "Observaciones aquí",
    "photos": [
      "https://res.cloudinary.com/.../photo1.jpg",
      "https://res.cloudinary.com/.../photo2.jpg"
    ]
  },
  "inspectors": [
    {
      "id": 5,
      "firstName": "Carlos",
      "lastName": "Ramírez"
    }
  ],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

#### `createInspection(dto)`

Crea una nueva inspección.

**Request:**
```javascript
POST /inspections
Content-Type: application/json

{
  "inspectionDate": "2024-01-15",
  "procedureNumber": "2024-001",
  "applicantType": "Persona Física",
  "dependency": "MayorOffice",
  "inspectorIds": [5, 7],
  "location": {
    "district": "SantaCruz",
    "exactAddress": "Calle Principal, 100m norte"
  },
  "individualRequest": {
    "firstName": "Juan",
    "lastName1": "Pérez",
    "lastName2": "García",
    "physicalId": "1-1234-5678"
  },
  "mayorOffice": {
    "procedureType": "Permiso",
    "observations": "Observaciones",
    "photos": [
      "https://res.cloudinary.com/.../photo1.jpg",
      "https://res.cloudinary.com/.../photo2.jpg"
    ]
  }
}
```

**Response:**
```json
{
  "id": 456,
  "procedureNumber": "2024-001",
  "status": "Nuevo",
  ...
}
```

**Uso:**
```javascript
const dto = mapInspectionDto(formData); // Transformar datos del formulario
const newInspection = await inspectionsService.createInspection(dto);
```

---

#### `updateInspection(id, body)`

Actualiza una inspección existente (PATCH parcial).

**Request:**
```javascript
PATCH /inspections/123
Content-Type: application/json

{
  "status": "En proceso",
  "mayorOffice": {
    "observations": "Actualizado"
  }
}
```

**Response:**
```json
{
  "id": 123,
  "status": "En proceso",
  ...
}
```

---

#### `updateInspectionStatus(id, status)`

Actualiza solo el estado de una inspección.

**Request:**
```javascript
PATCH /inspections/123/status
Content-Type: application/json

{
  "status": "Revisado"
}
```

**Response:**
```json
{
  "id": 123,
  "status": "Revisado",
  ...
}
```

**Uso:**
```javascript
await inspectionsService.updateInspectionStatus(123, 'Revisado');
```

---

#### `deleteInspection(id)`

Elimina permanentemente una inspección.

**Request:**
```javascript
DELETE /inspections/123
```

**Response:**
```
204 No Content
```

---

### Papelera (Trash)

#### `getTrashInspections()`

Obtiene inspecciones en la papelera.

**Request:**
```javascript
GET /inspections/trash/list
```

**Response:**
```json
{
  "data": [
    {
      "id": 99,
      "procedureNumber": "2024-010",
      "status": "Papelera",
      ...
    }
  ]
}
```

---

#### `moveToTrash(id)`

Mueve una inspección a la papelera (soft delete).

**Request:**
```javascript
PATCH /inspections/123/trash
```

**Response:**
```json
{
  "id": 123,
  "status": "Papelera",
  ...
}
```

---

#### `restoreFromTrash(id)`

Restaura una inspección desde la papelera.

**Request:**
```javascript
PATCH /inspections/123/restore
```

**Response:**
```json
{
  "id": 123,
  "status": "Nuevo",
  ...
}
```

---

### Subida de Fotos (LEGACY - No usado actualmente)

#### `uploadPhotos(inspectionId, files)`

⚠️ **NOTA**: Este método existe pero **ya no se usa**. Las fotos ahora se suben a Cloudinary **antes** de crear la inspección, y las URLs se incluyen directamente en el payload de creación.

**Request (legacy):**
```javascript
POST /inspections/123/photos
Content-Type: multipart/form-data

files: [File, File, File]
```

**Flujo actual (correcto):**
```javascript
// 1. Subir a Cloudinary
const formData = new FormData();
formData.append('file', photoFile);
const response = await fetch(`${API_URL}/cloudinary/upload`, {
  method: 'POST',
  body: formData,
  headers: { Authorization: `Bearer ${token}` }
});
const { secure_url } = await response.json();

// 2. Incluir URL en el payload
const dto = {
  mayorOffice: {
    photos: [secure_url1, secure_url2, secure_url3]
  }
};

// 3. Crear inspección con fotos incluidas
await inspectionsService.createInspection(dto);
```

---

## 👥 usersService

**Archivo**: `src/services/usersService.js`

### Métodos

#### `getUsers()`

Obtiene todos los usuarios.

**Request:**
```javascript
GET /users
```

**Response:**
```json
[
  {
    "id": 1,
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@muni.com",
    "role": "admin",
    "blocked": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  ...
]
```

---

#### `getSystemUsers()`

Obtiene usuarios del sistema (para asignación de inspectores).

**Request:**
```javascript
GET /users/system
```

**Response:**
```json
[
  {
    "id": 5,
    "firstName": "Carlos",
    "lastName": "Ramírez",
    "role": "inspector"
  },
  ...
]
```

---

#### `updateUser(id, body)`

Actualiza datos de un usuario.

**Request:**
```javascript
PATCH /users/5
Content-Type: application/json

{
  "firstName": "Carlos Alberto",
  "phone": "9999-9999"
}
```

**Response:**
```json
{
  "id": 5,
  "firstName": "Carlos Alberto",
  "phone": "9999-9999",
  ...
}
```

---

#### `toggleBlock(id)`

Bloquea/desbloquea un usuario.

**Request:**
```javascript
PATCH /users/5/block
```

**Response:**
```json
{
  "id": 5,
  "blocked": true,
  ...
}
```

---

#### `deleteUser(id)`

Elimina un usuario permanentemente.

**Request:**
```javascript
DELETE /users/5
```

**Response:**
```
204 No Content
```

---

### Reset de Contraseña

#### `forgotPassword(email)`

Solicita token de reset de contraseña.

**Request:**
```javascript
POST /users/forgot-password
Content-Type: application/json

{
  "email": "usuario@muni.com"
}
```

**Response:**
```json
{
  "message": "Se ha enviado un correo con instrucciones"
}
```

⚠️ **Seguridad**: El servicio verifica que el backend **NO envíe `access_token`** en la respuesta (prevención de autologin no autorizado).

---

#### `resetPassword(token, newPassword)`

Resetea la contraseña con token recibido por email.

**Request:**
```javascript
POST /users/reset-password
Content-Type: application/json

{
  "token": "abc123xyz",
  "newPassword": "newSecret123"
}
```

**Response:**
```json
{
  "message": "Contraseña actualizada correctamente"
}
```

---

## 📊 statsService

**Archivo**: `src/services/statsService.js`

### Estructura de Clase

```javascript
class StatsService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    // Helper genérico con manejo de 401
  }

  async getSummary() { ... }
  async getStatusCounts() { ... }
  // ...
}

export default new StatsService(); // Singleton
```

### Métodos

#### `getSummary()`

Resumen general de inspecciones.

**Request:**
```javascript
GET /stats/summary
```

**Response:**
```json
{
  "totalInspections": 150,
  "byStatus": {
    "Nuevo": 30,
    "En proceso": 50,
    "Revisado": 60,
    "Archivado": 10
  },
  "byDependency": {
    "MayorOffice": 40,
    "Constructions": 50,
    "MaritimeZone": 30,
    ...
  },
  "totalInspectors": 10
}
```

---

#### `getStatusCounts()`

Conteo de inspecciones por estado.

**Request:**
```javascript
GET /stats/status-counts
```

**Response:**
```json
{
  "Nuevo": 30,
  "En proceso": 50,
  "Revisado": 60,
  "Archivado": 10
}
```

---

#### `getInspectors()`

Estadísticas de inspectores.

**Request:**
```javascript
GET /stats/inspectors
```

**Response:**
```json
[
  {
    "id": 5,
    "name": "Carlos Ramírez",
    "totalInspections": 45,
    "completedInspections": 30,
    "averageTime": 3.5
  },
  ...
]
```

---

#### `getDepartments()`

Estadísticas por dependencia.

**Request:**
```javascript
GET /stats/departments
```

**Response:**
```json
[
  {
    "dependency": "MayorOffice",
    "count": 40,
    "percentage": 26.7
  },
  {
    "dependency": "Constructions",
    "count": 50,
    "percentage": 33.3
  },
  ...
]
```

---

#### `getDetailed()`

Análisis detallado completo.

**Request:**
```javascript
GET /stats/detailed
```

**Response:**
```json
{
  "summary": { ... },
  "trends": {
    "last7days": 15,
    "last30days": 60,
    "growthRate": 5.2
  },
  "topInspectors": [ ... ],
  "byDistrict": { ... }
}
```

---

#### `getDashboard()`

Datos para dashboard (combinado).

**Request:**
```javascript
GET /stats/dashboard
```

**Response:**
```json
{
  "summary": { ... },
  "statusCounts": { ... },
  "recentInspections": [ ... ],
  "inspectorPerformance": [ ... ]
}
```

---

#### `getCompleteOverview()`

Vista completa con todos los datos.

**Request:**
```javascript
GET /stats/complete-overview
```

**Response:**
```json
{
  "summary": { ... },
  "inspections": [ ... ],
  "inspectors": [ ... ],
  "departments": [ ... ],
  "trends": { ... }
}
```

---

#### `getDependencies(params)`

Comparación entre dependencias con filtros.

**Request:**
```javascript
GET /stats/dependencies?startDate=2024-01-01&endDate=2024-12-31
```

**Response:**
```json
{
  "dependencies": [
    {
      "name": "MayorOffice",
      "count": 40,
      "percentage": 26.7,
      "statusBreakdown": {
        "Nuevo": 10,
        "En proceso": 15,
        "Revisado": 15
      }
    },
    ...
  ],
  "totalInspections": 150,
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  }
}
```

---

## 📱 dashboardService

**Archivo**: `src/services/dashboardService.js`

### Métodos

#### `getInspectorDashboard()`

Dashboard específico para inspectores.

**Request:**
```javascript
GET /dashboard/inspector
```

**Response:**
```json
{
  "myInspections": {
    "total": 25,
    "byStatus": {
      "Nuevo": 5,
      "En proceso": 10,
      "Revisado": 10
    }
  },
  "recentInspections": [ ... ],
  "stats": {
    "completionRate": 75.5,
    "averageTime": 3.2
  }
}
```

---

#### `getAdminDashboard()`

Dashboard para administradores.

**Request:**
```javascript
GET /dashboard/admin
```

**Response:**
```json
{
  "totalInspections": 150,
  "totalInspectors": 10,
  "byStatus": { ... },
  "byDependency": { ... },
  "byApplicantType": {
    "Anonimo": 30,
    "Persona Física": 80,
    "Persona Jurídica": 40
  },
  "team": [
    {
      "id": 5,
      "name": "Carlos Ramírez",
      "totalInspections": 45
    },
    ...
  ],
  "recentInspections": [ ... ]
}
```

---

#### `getStatsByPeriod(params)`

Estadísticas por rango de fechas.

**Request:**
```javascript
GET /dashboard/stats/period?startDate=2024-01-01&endDate=2024-03-31
```

**Response:**
```json
{
  "period": {
    "start": "2024-01-01",
    "end": "2024-03-31"
  },
  "totalInspections": 45,
  "byStatus": { ... },
  "byDependency": { ... },
  "trends": {
    "daily": [ ... ],
    "weekly": [ ... ]
  }
}
```

---

## 📄 reportsService

**Archivo**: `src/services/reportsService.js`

⚠️ **Nota**: Este servicio usa **Axios** (no fetch) para descargas de archivos binarios.

### Métodos

#### `searchByProcedureNumber(procedureNumber)`

Busca inspección por número de trámite.

**Request:**
```javascript
GET /reports/inspections?procedureNumber=2024-001
```

**Response (1 inspección):**
```json
{
  "id": 123,
  "procedureNumber": "2024-001",
  ...
}
```

**Response (múltiples):**
```json
{
  "multiple": true,
  "count": 3,
  "inspections": [
    { "id": 123, ... },
    { "id": 124, ... },
    { "id": 125, ... }
  ]
}
```

**Uso:**
```javascript
const result = await reportsService.searchByProcedureNumber('2024-001');

if (result.multiple) {
  console.log(`Se encontraron ${result.count} inspecciones`);
  // Mostrar selector
} else {
  console.log('Inspección única:', result);
}
```

---

#### `getPreview(filters)`

Vista previa de reporte con filtros.

**Request:**
```javascript
GET /reports/inspections/preview?startDate=2024-01-01&endDate=2024-12-31&status=Nuevo
```

**Response:**
```json
{
  "total": 30,
  "sample": [
    { "id": 1, "procedureNumber": "2024-001", ... },
    { "id": 2, "procedureNumber": "2024-002", ... },
    ...
  ]
}
```

---

#### `downloadIndividualCSV(procedureNumber)`

Descarga CSV de una inspección.

**Request:**
```javascript
GET /reports/inspections/2024-001/csv
```

**Response:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="inspeccion_2024-001.csv"

ID,Número Trámite,Fecha,Estado,...
123,2024-001,2024-01-15,Nuevo,...
```

**Uso:**
```javascript
await reportsService.downloadIndividualCSV('2024-001');
// Descarga automática en el navegador
```

---

#### `downloadIndividualPDF(procedureNumber)`

Descarga PDF de una inspección.

**Request:**
```javascript
GET /reports/inspections/2024-001/pdf
```

**Response:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="inspeccion_2024-001.pdf"

[Binary PDF data]
```

---

#### `downloadCSV(filters)`

Descarga CSV de múltiples inspecciones con filtros.

**Request:**
```javascript
GET /reports/inspections/csv?startDate=2024-01-01&endDate=2024-12-31
```

**Response:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="inspecciones_2024-01-15.csv"

[CSV data for multiple inspections]
```

---

#### `downloadPDF(filters)`

Descarga PDF de múltiples inspecciones con filtros.

**Request:**
```javascript
GET /reports/inspections/pdf?startDate=2024-01-01&endDate=2024-12-31
```

**Response:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="reporte_inspecciones_2024-01-15.pdf"

[Binary PDF data]
```

---

#### `downloadCSVById(inspectionId)`

Descarga CSV por ID de inspección (alternativa).

**Request:**
```javascript
GET /reports/inspections/by-id/123/csv
```

---

#### `downloadPDFById(inspectionId)`

Descarga PDF por ID de inspección (alternativa).

**Request:**
```javascript
GET /reports/inspections/by-id/123/pdf
```

---

## 👤 profileService

**Archivo**: `src/services/profileService.js`

### Métodos

#### `getProfile()`

Obtiene perfil del usuario autenticado.

**Request:**
```javascript
GET /users/me
```

**Response:**
```json
{
  "id": 5,
  "firstName": "Carlos",
  "lastName": "Ramírez",
  "secondLastName": "López",
  "email": "carlos@muni.com",
  "cedula": "1-1234-5678",
  "phone": "8888-8888",
  "role": "inspector",
  "blocked": false,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Uso:**
```javascript
const profile = await profileService.getProfile();
console.log(profile.firstName, profile.role);
```

---

## ⚠️ Manejo de Errores

### Patrón Consistente en Todos los Services

```javascript
async function request(path, opts = {}) {
  const res = await fetch(`${BASE_URL}${path}`, { ... });
  
  if (!res.ok) {
    // 1. Detectar token expirado
    if (res.status === 401) {
      // Excepto en login (donde 401 = credenciales incorrectas)
      if (!path.includes('/auth/login')) {
        handleTokenExpired();
        throw new Error('Token expirado');
      }
    }
    
    // 2. Intentar parsear error del backend
    let errBody = {};
    try { 
      errBody = await res.json(); 
    } catch {}
    
    // 3. Lanzar error con mensaje del backend o genérico
    throw new Error(errBody.message || `Error ${res.status}`);
  }
  
  // 4. Parsear respuesta exitosa
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  try { 
    return JSON.parse(text); 
  } catch { 
    return null; 
  }
}
```

### Manejo en Axios (reportsService)

```javascript
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthRequest = requestUrl.includes('/auth/');
      
      if (!isAuthRequest) {
        handleTokenExpired();
      }
    }
    return Promise.reject(error);
  }
);
```

### Ejemplos de Uso en Hooks

```javascript
// useInspections.js
const createInspectionFromForm = useCallback(async (formData) => {
  try {
    setLoading(true);
    const dto = mapInspectionDto(formData);
    const newInspection = await inspectionsService.createInspection(dto);
    await fetchInspections(initialParamsRef.current);
    return newInspection;
  } catch (err) {
    setError(err.message || 'Error al crear inspección');
    throw err;
  } finally {
    setLoading(false);
  }
}, [fetchInspections]);
```

---

## 📊 Resumen de Endpoints

### Tabla de Endpoints por Servicio

| Servicio | Endpoint | Método | Descripción |
|----------|----------|--------|-------------|
| **authService** | `/auth/login` | POST | Login |
| | `/auth/register` | POST | Registro |
| **inspectionsService** | `/inspections` | GET | Listar inspecciones |
| | `/inspections/:id` | GET | Detalle inspección |
| | `/inspections` | POST | Crear inspección |
| | `/inspections/:id` | PATCH | Actualizar inspección |
| | `/inspections/:id/status` | PATCH | Actualizar estado |
| | `/inspections/:id` | DELETE | Eliminar inspección |
| | `/inspections/trash/list` | GET | Listar papelera |
| | `/inspections/:id/trash` | PATCH | Mover a papelera |
| | `/inspections/:id/restore` | PATCH | Restaurar de papelera |
| **usersService** | `/users` | GET | Listar usuarios |
| | `/users/system` | GET | Usuarios del sistema |
| | `/users/:id` | PATCH | Actualizar usuario |
| | `/users/:id/block` | PATCH | Bloquear/desbloquear |
| | `/users/:id` | DELETE | Eliminar usuario |
| | `/users/forgot-password` | POST | Solicitar reset |
| | `/users/reset-password` | POST | Resetear contraseña |
| **statsService** | `/stats/summary` | GET | Resumen general |
| | `/stats/status-counts` | GET | Conteo por estado |
| | `/stats/inspectors` | GET | Stats inspectores |
| | `/stats/departments` | GET | Stats dependencias |
| | `/stats/detailed` | GET | Análisis detallado |
| | `/stats/dashboard` | GET | Dashboard data |
| | `/stats/complete-overview` | GET | Vista completa |
| | `/stats/dependencies` | GET | Comparación dependencias |
| **dashboardService** | `/dashboard/inspector` | GET | Dashboard inspector |
| | `/dashboard/admin` | GET | Dashboard admin |
| | `/dashboard/stats/period` | GET | Stats por periodo |
| **reportsService** | `/reports/inspections` | GET | Buscar por trámite |
| | `/reports/inspections/preview` | GET | Vista previa |
| | `/reports/inspections/:num/csv` | GET | CSV individual |
| | `/reports/inspections/:num/pdf` | GET | PDF individual |
| | `/reports/inspections/csv` | GET | CSV múltiple |
| | `/reports/inspections/pdf` | GET | PDF múltiple |
| | `/reports/inspections/by-id/:id/csv` | GET | CSV por ID |
| | `/reports/inspections/by-id/:id/pdf` | GET | PDF por ID |
| **profileService** | `/users/me` | GET | Perfil usuario |

---

## 🔧 Consideraciones Técnicas

### Fetch vs Axios

**Fetch (mayoría de services)**:
- ✅ Nativo del navegador
- ✅ Más ligero
- ❌ Manejo manual de errores

**Axios (reportsService)**:
- ✅ Interceptors automáticos
- ✅ Mejor manejo de blobs/binarios
- ✅ Cancelación de requests
- ❌ Librería externa (pero ya incluida)

### Credentials: 'include'

```javascript
fetch(url, {
  credentials: 'include'
})
```

Permite enviar cookies HttpOnly si el backend las usa (útil para CSRF tokens).

### ResponseType: 'blob'

```javascript
axiosInstance.get(url, {
  responseType: 'blob'
})
```

Esencial para descargas de archivos binarios (CSV/PDF).

---

## 🚀 Mejoras Futuras

1. **Request Caching**: Cache de respuestas con TTL
2. **Request Retry**: Reintentar en caso de fallo de red
3. **Request Cancellation**: Cancelar requests pendientes al desmontar componentes
4. **Optimistic Updates**: Actualizar UI antes de respuesta del servidor
5. **WebSockets**: Notificaciones en tiempo real
6. **GraphQL**: Alternativa a REST para queries complejas

---

**Documento actualizado**: ${new Date().toLocaleDateString('es-CR')}
**Autor**: Sistema de Inspecciones Municipales - Santa Cruz
