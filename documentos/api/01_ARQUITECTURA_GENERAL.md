# 🏗️ Arquitectura General del Sistema

## 📋 Índice
- [Visión General](#visión-general)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura de Componentes](#arquitectura-de-componentes)
- [Flujo de Datos](#flujo-de-datos)
- [Patrones de Diseño](#patrones-de-diseño)
- [Estructura de Directorios](#estructura-de-directorios)

---

## 🎯 Visión General

Sistema de gestión de inspecciones municipales de Santa Cruz, Costa Rica. Permite a inspectores y administradores crear, gestionar y rastrear inspecciones en múltiples dependencias municipales.

### Características Principales
- ✅ Autenticación JWT con roles (Admin/Inspector)
- ✅ Formulario multi-paso para 7+ tipos de inspecciones
- ✅ Carga de fotos a Cloudinary antes de creación
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Sistema de reportes y filtros avanzados
- ✅ Papelera de reciclaje para inspecciones eliminadas
- ✅ Gestión de usuarios y permisos

---

## 🛠️ Stack Tecnológico

### Frontend Core
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 19.1.0 | Framework UI principal |
| **Vite** | 7.0.4 | Build tool y dev server |
| **React Router** | 7.7.1 | Routing client-side |
| **Tailwind CSS** | 3.4.17 | Styling utility-first |

### Gestión de Formularios y Validación
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **react-hook-form** | 7.62.0 | Gestión de formularios |
| **Zod** | 3.24.1 | Validación de esquemas |
| **@hookform/resolvers** | 3.9.3 | Integración Zod + RHF |

### Componentes UI
| Tecnología | Propósito |
|------------|-----------|
| **Radix UI** | Primitivos accesibles (Dialog, Dropdown, etc.) |
| **lucide-react** | Sistema de iconos |
| **shadcn/ui** | Componentes pre-construidos |

### Gráficos y Visualización
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Chart.js** | 4.5.0 | Librería de gráficos base |
| **react-chartjs-2** | 5.3.0 | Wrapper React para Chart.js |
| **recharts** | 3.2.1 | Gráficos responsivos adicionales |

### HTTP y Estado
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Axios** | 1.12.2 | Cliente HTTP con interceptors |
| **SweetAlert2** | 11.22.5 | Alertas y notificaciones |

### Autenticación y Seguridad
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **jwt-decode** | 4.0.0 | Decodificación de JWT |
| **@cloudinary/url-gen** | 1.29.0 | Manipulación segura de URLs |

### Testing
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Playwright** | 1.49.2 | E2E testing |
| **Vitest** | 3.1.0 | Unit testing |

---

## 🏛️ Arquitectura de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                         NAVEGADOR                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              CAPA DE PRESENTACIÓN (React)                │    │
│  │  ┌────────────┐  ┌──────────────┐  ┌────────────────┐  │    │
│  │  │   Pages    │  │  Components  │  │   UI Library   │  │    │
│  │  │            │  │              │  │   (Radix UI)   │  │    │
│  │  │ - Admin    │  │ - Inspections│  │                │  │    │
│  │  │ - Inspector│  │ - Admin      │  │ - Dialog       │  │    │
│  │  │ - Users    │  │ - Auth       │  │ - Dropdown     │  │    │
│  │  │ - Stats    │  │ - Reports    │  │ - Form Controls│  │    │
│  │  │ - Reports  │  │ - Stats      │  │                │  │    │
│  │  └────────────┘  └──────────────┘  └────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ↕                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │          CAPA DE LÓGICA DE NEGOCIO (Hooks)              │    │
│  │  ┌────────────┐  ┌──────────────┐  ┌────────────────┐  │    │
│  │  │ useAuth    │  │useInspections│  │   useStats     │  │    │
│  │  │ useUsers   │  │ useDashboard │  │  useReports    │  │    │
│  │  │ useProfile │  │              │  │                │  │    │
│  │  └────────────┘  └──────────────┘  └────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ↕                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │         CAPA DE SERVICIOS (API Clients)                 │    │
│  │  ┌────────────┐  ┌──────────────┐  ┌────────────────┐  │    │
│  │  │authService │  │inspectionsS. │  │  statsService  │  │    │
│  │  │usersService│  │dashboardS.   │  │ reportsService │  │    │
│  │  │profileS.   │  │              │  │                │  │    │
│  │  └────────────┘  └──────────────┘  └────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              ↕                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │           CAPA DE UTILIDADES                            │    │
│  │  • mapInspectionDto    • auth-helpers                   │    │
│  │  • date-helpers        • security-validators            │    │
│  │  • cloudinary          • axiosConfig                    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICIOS EXTERNOS                            │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │  Backend API    │  │   Cloudinary     │  │  Railway DB   │  │
│  │  (Railway)      │  │  (Image Storage) │  │  (PostgreSQL) │  │
│  │                 │  │                  │  │               │  │
│  │ REST Endpoints  │  │ /cloudinary/     │  │  Inspecciones │  │
│  │ JWT Auth        │  │  upload          │  │  Usuarios     │  │
│  └─────────────────┘  └──────────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos

### 1. Autenticación y Autorización

```
Usuario → LoginPage → useAuth.login()
  ↓
authService.login(email, password)
  ↓
POST /auth/login → Backend valida credenciales
  ↓
Backend devuelve { access_token: "JWT..." }
  ↓
localStorage.setItem('token', jwt)
  ↓
Decodifica JWT → setUser(payload)
  ↓
React Router → Navigate to /admin/dashboard
  ↓
RequireAuth verifica token válido
  ↓
RequireRole verifica rol (admin/inspector)
  ↓
Renderiza página correspondiente
```

### 2. Creación de Inspección con Fotos

```
Usuario completa formulario multi-paso
  ↓
Usuario selecciona 3 fotos (File objects)
  ↓
Usuario hace clic en "Guardar"
  ↓
Validación react-hook-form + Zod
  ↓
InspectionForm.handleSubmit()
  ↓
┌─────────────────────────────────────┐
│  Para cada foto:                    │
│  1. Crear FormData con file         │
│  2. POST /cloudinary/upload          │
│  3. Recibir { secure_url }          │
│  4. Guardar URL en array            │
└─────────────────────────────────────┘
  ↓
mapInspectionDto(formData) → DTO con photos: [urls...]
  ↓
useInspections.createInspectionFromForm(dto)
  ↓
inspectionsService.createInspection(dto)
  ↓
POST /inspections con payload completo
  ↓
Backend guarda todo en DB (incluyendo URLs)
  ↓
Fetch inspecciones actualizadas
  ↓
Navigate to /admin/inspections-management
```

### 3. Consulta de Estadísticas

```
StatsPage → useStats('summary', { autoFetch: true })
  ↓
useStats.fetchData()
  ↓
statsService.getSummary()
  ↓
GET /stats/summary con Authorization: Bearer <token>
  ↓
Backend calcula estadísticas
  ↓
Devuelve { totalInspections, byStatus, byDependency... }
  ↓
setData(result) → Re-render con nuevos datos
  ↓
Componentes Chart.js renderizan gráficos
```

---

## 🎨 Patrones de Diseño

### 1. **Custom Hooks Pattern**
Toda la lógica de negocio encapsulada en hooks reutilizables:

```javascript
// Ejemplo: useInspections
export function useInspections({ autoFetch = true, initialParams = {} }) {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchInspections = useCallback(async (params) => {
    // Lógica de fetching
  }, []);
  
  return { inspections, loading, error, fetchInspections, ... };
}
```

**Beneficios:**
- ✅ Separación de responsabilidades
- ✅ Lógica reutilizable
- ✅ Testing más fácil

### 2. **Service Layer Pattern**
Capa de abstracción para todas las llamadas API:

```javascript
// inspectionsService.js
export const inspectionsService = {
  getInspections: (params) => request('/inspections', { method: 'GET', params }),
  createInspection: (dto) => request('/inspections', { method: 'POST', body: dto }),
  updateInspection: (id, body) => request(`/inspections/${id}`, { method: 'PATCH', body }),
  // ...
};
```

**Beneficios:**
- ✅ Centraliza configuración HTTP
- ✅ Manejo consistente de errores
- ✅ Fácil mockear en tests

### 3. **DTO (Data Transfer Object) Pattern**
Transformación de datos entre frontend y backend:

```javascript
// mapInspectionDto.js
export function mapInspectionDto(formValues) {
  // Transforma datos del formulario a formato esperado por API
  return {
    inspectionDate: formatDate(formValues.date),
    mayorOffice: {
      photos: formValues.photos.map(f => f.url),
      observations: formValues.obs,
    },
    // ...
  };
}
```

**Beneficios:**
- ✅ Desacopla frontend de backend
- ✅ Validación y normalización centralizada
- ✅ Facilita cambios en API sin tocar componentes

### 4. **Protected Routes Pattern**
Seguridad basada en roles con Higher Order Components:

```jsx
// App.jsx
<Route element={<RequireAuth />}>
  <Route element={<RequireRole roles={["admin"]} />}>
    <Route path="/admin/users" element={<UsersPage />} />
  </Route>
</Route>
```

**Beneficios:**
- ✅ Seguridad declarativa
- ✅ Código más legible
- ✅ Fácil agregar/quitar protecciones

### 5. **Compound Components Pattern**
Componentes complejos como Sidebar que se componen de sub-componentes:

```jsx
<Sidebar>
  <SidebarHeader />
  <SidebarNav>
    <NavItem icon={<Home />} to="/dashboard" />
    <NavGroup label="Inspecciones">
      <NavItem to="/inspectionsform" />
      <NavItem to="/inspections" />
    </NavGroup>
  </SidebarNav>
</Sidebar>
```

### 6. **Render Props / Children Pattern**
Flexibilidad en composición de componentes:

```jsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Contenido dinámico */}
  </CardContent>
</Card>
```

---

## 📂 Estructura de Directorios

```
c:\Users\MSI GERALD\Inpecciones-Muni\
│
├── 📁 src/                           # Código fuente
│   ├── 📁 components/                # Componentes React
│   │   ├── 📁 admin/                 # Layout y Sidebar admin
│   │   ├── 📁 auth/                  # Login, Reset Password
│   │   ├── 📁 inspections/           # InspectionForm (CORE)
│   │   ├── 📁 reports/               # Filtros, tablas de reportes
│   │   ├── 📁 stats/                 # Gráficos y estadísticas
│   │   ├── 📁 users/                 # Gestión de usuarios
│   │   ├── 📁 ui/                    # Componentes reutilizables (shadcn)
│   │   ├── ProtectedRoute.jsx
│   │   ├── RequireAuth.jsx
│   │   ├── RequireRole.jsx
│   │   └── TokenExpirationChecker.jsx
│   │
│   ├── 📁 pages/                     # Páginas principales
│   │   ├── AdminDashboard.jsx
│   │   ├── InspectorDashboard.jsx
│   │   ├── InspectionManagementPage.jsx
│   │   ├── UsersPage.jsx
│   │   ├── StatsPage.jsx
│   │   ├── ReportsPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── TrashPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   └── ResetPasswordPage.jsx
│   │
│   ├── 📁 hooks/                     # Custom Hooks
│   │   ├── useAuth.jsx               # Autenticación (Context + Hook)
│   │   ├── useInspections.js         # CRUD inspecciones
│   │   ├── useUsers.js               # CRUD usuarios
│   │   ├── useStats.js               # Estadísticas
│   │   ├── useDashboard.js           # Dashboard data
│   │   ├── useReports.js             # Reportes
│   │   ├── useProfile.js             # Perfil de usuario
│   │   └── use-toast.js              # Notificaciones toast
│   │
│   ├── 📁 services/                  # Clientes API
│   │   ├── authService.js            # Login, register, reset
│   │   ├── inspectionsService.js     # Inspecciones API
│   │   ├── usersService.js           # Usuarios API
│   │   ├── statsService.js           # Estadísticas API
│   │   ├── dashboardService.js       # Dashboard API
│   │   ├── reportsService.js         # Reportes API (Axios)
│   │   └── profileService.js         # Perfil API
│   │
│   ├── 📁 utils/                     # Utilidades
│   │   ├── mapInspectionDto.js       # Transformación de datos (CRÍTICO)
│   │   ├── auth-helpers.js           # Helpers de autenticación
│   │   ├── date-helpers.js           # Formateo de fechas
│   │   ├── security-validators.js    # Validación de archivos
│   │   └── cloudinary.js             # Integración Cloudinary
│   │
│   ├── 📁 config/                    # Configuración
│   │   └── axiosConfig.js            # Axios interceptors
│   │
│   ├── 📁 domain/                    # Modelos de dominio
│   │   └── enums.js                  # Enumeraciones del sistema
│   │
│   ├── 📁 lib/                       # Librerías compartidas
│   │   └── utils.js                  # Utility functions (clsx, etc)
│   │
│   ├── 📁 assets/                    # Imágenes, fonts, etc
│   ├── App.jsx                       # Componente raíz + Routing
│   ├── main.jsx                      # Entry point (monta React)
│   ├── App.css                       # Estilos globales
│   └── index.css                     # Tailwind imports
│
├── 📁 public/                        # Archivos estáticos
├── 📁 tests/                         # Tests
│   ├── 📁 e2e/                       # Tests Playwright
│   └── 📁 unit/                      # Tests unitarios
│
├── 📁 documentos/                    # Documentación técnica
│
├── 📄 package.json                   # Dependencias
├── 📄 vite.config.js                 # Config Vite
├── 📄 tailwind.config.js             # Config Tailwind
├── 📄 playwright.config.js           # Config Playwright
├── 📄 vercel.json                    # Config despliegue Vercel
└── 📄 README.md                      # Documentación general
```

---

## 🔑 Conceptos Clave

### Enumeraciones del Sistema

Definidas en `src/domain/enums.js`:

```javascript
// Tipos de solicitante
ApplicantType: { ANONIMO, FISICA, JURIDICA }

// Estados de inspección
InspectionStatus: { NUEVO, EN_PROCESO, REVISADO, ARCHIVADO, PAPELERA }

// Distritos de Santa Cruz
District: { SantaCruz, Bolson, VeintisieteAbril, Tempate, Cartagena, ... }

// Dependencias municipales
Dependency: { 
  MayorOffice,        // Alcaldía
  Constructions,      // Construcciones (5 procedimientos)
  MaritimeZone,       // ZMT - Zona Marítima Terrestre
  ServicePlatform,    // Plataforma de Servicios
  Collections,        // Cobros
  WorkClosure,        // Cierre de Obras
  TaxesAndLicenses    // Patentes
}

// Procedimientos de construcciones
ConstructionProcedure: { 
  UsoSuelo, 
  Antiguedad, 
  AnulacionPC, 
  InspeccionGeneral, 
  RecibidoObra 
}
```

### Roles de Usuario

- **Admin**: Acceso total al sistema
  - Dashboard completo
  - Gestión de usuarios
  - Estadísticas avanzadas
  - Reportes
  - Papelera
  
- **Inspector**: Acceso limitado
  - Dashboard personal
  - Crear inspecciones
  - Ver sus propias inspecciones
  - Perfil

---

## 🌐 Configuración de Entorno

Variables de entorno requeridas (`.env`):

```bash
# Backend API
VITE_API_URL=https://inspecciones-muni-santa-cruz-production.up.railway.app

# Cloudinary (opcional, si se usa directamente desde frontend)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset

# Otros
VITE_ILLUSTRATION_URL=https://...
```

---

## 🚀 Scripts de Desarrollo

```json
{
  "dev": "vite",                    // Servidor desarrollo (puerto 5174)
  "build": "vite build",            // Build producción
  "preview": "vite preview",        // Preview build local
  "test": "playwright test",        // E2E tests
  "test:ui": "playwright test --ui" // Tests con UI
}
```

---

## 📊 Métricas del Proyecto

- **Líneas de código**: ~15,000+
- **Componentes React**: 50+
- **Custom Hooks**: 8
- **Services**: 7
- **Páginas**: 9
- **Tests E2E**: 2+
- **Dependencias municipales**: 7
- **Procedimientos construcciones**: 5

---

## 🔐 Seguridad

### Token JWT
- Almacenado en `localStorage`
- Validación en cada request
- Auto-logout al expirar
- Interceptor global en Axios

### Validación de Archivos
- Tipos permitidos: `image/jpeg, image/png, image/webp`
- Tamaño máximo: 5MB
- Sanitización de nombres
- Validación de extensiones

### CORS y Headers
- Credenciales incluidas: `credentials: 'include'`
- Authorization header: `Bearer <token>`

---

## 🔄 Flujo de Actualización

```
git pull origin main
npm install           # Instalar nuevas dependencias
npm run build         # Build producción
Vercel auto-deploy    # Deploy automático
```

---

## 📚 Referencias

- [React 19 Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [Playwright Testing](https://playwright.dev)

---

**Documento actualizado**: ${new Date().toLocaleDateString('es-CR')}
**Autor**: Sistema de Inspecciones Municipales - Santa Cruz
