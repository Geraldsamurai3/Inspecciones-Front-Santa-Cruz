# 📚 Documentación Técnica - Sistema de Inspecciones Municipales

## 🎯 Índice General

Bienvenido a la documentación completa del Sistema de Inspecciones Municipales de Santa Cruz, Costa Rica. Esta documentación cubre todos los aspectos técnicos del sistema, desde la arquitectura hasta el despliegue en producción.

---

## 📖 Documentos Disponibles

### 1. [Arquitectura General](./api/01_ARQUITECTURA_GENERAL.md)
**Contenido:**
- Visión general del sistema
- Stack tecnológico completo (React 19, Vite 7, Tailwind)
- Arquitectura de componentes
- Flujo de datos
- Patrones de diseño implementados
- Estructura de directorios

**Para quién:** Desarrolladores nuevos, arquitectos, líderes técnicos

**Tiempo de lectura:** 15 minutos

---

### 2. [Autenticación y Autorización](./api/02_AUTENTICACION_Y_AUTORIZACION.md)
**Contenido:**
- Arquitectura JWT
- Flujo completo de login/logout
- Gestión de tokens
- Rutas protegidas con RequireAuth
- Control de roles (Admin/Inspector)
- Sistema de expiración de sesión
- Reset de contraseña

**Para quién:** Desarrolladores frontend/backend, especialistas en seguridad

**Tiempo de lectura:** 20 minutos

---

### 3. [Servicios API](./api/03_SERVICIOS_API.md)
**Contenido:**
- Todos los servicios (authService, inspectionsService, usersService, statsService, dashboardService, reportsService, profileService)
- Endpoints completos con request/response
- Configuración de Axios
- Manejo de errores 401
- Interceptors
- Tabla completa de endpoints

**Para quién:** Desarrolladores frontend, integradores API

**Tiempo de lectura:** 25 minutos

---

### 4. [Sistema de Fotos](./api/04_SISTEMA_FOTOS.md)
**Contenido:**
- Arquitectura de carga de fotos (vieja vs nueva)
- Integración con Cloudinary
- Componente PhotoField
- Validaciones de seguridad
- Mapeo de DTOs
- Troubleshooting común

**Para quién:** Desarrolladores trabajando con uploads, especialistas en multimedia

**Tiempo de lectura:** 20 minutos

---

### 5. [Setup y Despliegue](./api/05_SETUP_Y_DESPLIEGUE.md)
**Contenido:**
- Instalación local
- Variables de entorno
- Scripts de npm
- Build para producción
- Despliegue en Vercel
- Troubleshooting de instalación

**Para quién:** DevOps, desarrolladores nuevos, administradores de sistema

**Tiempo de lectura:** 15 minutos

---

### 6. [Componentes y Páginas](./api/06_COMPONENTES_Y_PAGINAS.md)
**Contenido:**
- 10 páginas principales (AdminDashboard, InspectorDashboard, InspectionManagement, Users, Stats, Reports, Trash, Profile, etc.)
- InspectionForm (2625 líneas - componente CORE)
- 12 componentes de estadísticas (gráficos Chart.js)
- Componentes de reportes y usuarios
- 14 componentes UI (shadcn/ui)
- Funcionalidad de cada componente

**Para quién:** Desarrolladores frontend, diseñadores UI/UX

**Tiempo de lectura:** 30 minutos

---

### 7. [Testing y Validación](./api/07_TESTING_Y_VALIDACION.md)
**Contenido:**
- Testing E2E con Playwright
- Testing unitario con Vitest
- Validación de formularios (Zod + react-hook-form)
- Security validators
- Scripts de testing
- Cobertura actual

**Para quién:** QA engineers, desarrolladores, especialistas en testing

**Tiempo de lectura:** 30 minutos

---

### 4. [Sistema de Fotos](./04_SISTEMA_FOTOS.md)
**Contenido:**
- Arquitectura de subida de fotos (antes vs ahora)
- Integración con Cloudinary
- Flujo completo paso a paso
- PhotoField component
- Validación exhaustiva de archivos
- DTO mapping para fotos
- 7 secciones con fotos
- Seguridad
- Solución de problemas comunes

**Para quién:** Desarrolladores trabajando con fotos, QA

**Tiempo de lectura:** 25 minutos

---

## 🚀 Guía Rápida de Inicio

### Requisitos Previos
- Node.js 18+ 
- npm 9+
- Cuenta de Cloudinary (para fotos)
- Acceso al backend en Railway

### Instalación Rápida

\`\`\`bash
# 1. Clonar repositorio
git clone <repo-url>
cd Inpecciones-Muni

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Abrir en navegador
http://localhost:5174
\`\`\`

### Variables de Entorno Requeridas

\`\`\`bash
# Backend API
VITE_API_URL=https://inspecciones-muni-santa-cruz-production.up.railway.app

# Cloudinary (opcional si se usa backend)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset

# Ilustración de login (opcional)
VITE_ILLUSTRATION_URL=https://...
\`\`\`

---

## 📂 Estructura del Proyecto

\`\`\`
Inpecciones-Muni/
├── documentos/                    ← ¡Estás aquí!
│   ├── README.md                  ← Este archivo
│   ├── 01_ARQUITECTURA_GENERAL.md
│   ├── 02_AUTENTICACION_Y_AUTORIZACION.md
│   ├── 03_SERVICIOS_API.md
│   └── 04_SISTEMA_FOTOS.md
│
├── src/
│   ├── components/               ← Componentes React
│   ├── pages/                    ← Páginas principales
│   ├── hooks/                    ← Custom hooks
│   ├── services/                 ← API clients
│   ├── utils/                    ← Utilidades
│   ├── config/                   ← Configuración
│   ├── domain/                   ← Enumeraciones
│   └── lib/                      ← Librerías compartidas
│
├── tests/                        ← Tests E2E y unitarios
├── public/                       ← Archivos estáticos
│
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
\`\`\`

---

## 🎓 Rutas de Aprendizaje

### Para Nuevos Desarrolladores

1. **Día 1**: Lee [Arquitectura General](./01_ARQUITECTURA_GENERAL.md)
   - Comprende el stack tecnológico
   - Familiarízate con los patrones de diseño
   - Explora la estructura de directorios

2. **Día 2**: Lee [Autenticación y Autorización](./02_AUTENTICACION_Y_AUTORIZACION.md)
   - Entiende el flujo de login
   - Aprende sobre rutas protegidas
   - Comprende el sistema de roles

3. **Día 3**: Lee [Servicios API](./03_SERVICIOS_API.md)
   - Explora todos los endpoints
   - Practica llamadas API con Postman
   - Revisa los ejemplos de request/response

4. **Día 4**: Lee [Sistema de Fotos](./04_SISTEMA_FOTOS.md)
   - Entiende el flujo de subida
   - Practica con PhotoField
   - Experimenta con Cloudinary

5. **Día 5**: Práctica Hands-On
   - Crea una inspección completa
   - Sube fotos
   - Explora el código fuente

### Para Arquitectos y Líderes Técnicos

1. **Arquitectura General** - Comprende las decisiones de diseño
2. **Servicios API** - Revisa los contratos de API
3. **Autenticación** - Valida la seguridad implementada

### Para QA y Testers

1. **Sistema de Fotos** - Conoce todos los casos de validación
2. **Autenticación** - Prueba escenarios de login/logout
3. **Servicios API** - Lista de endpoints para pruebas

---

## 🔧 Tecnologías Principales

### Frontend
- **React** 19.1.0 - Framework UI
- **Vite** 7.0.4 - Build tool
- **React Router** 7.7.1 - Routing
- **Tailwind CSS** 3.4.17 - Styling
- **react-hook-form** 7.62.0 - Formularios
- **Zod** 3.24.1 - Validación
- **Axios** 1.12.2 - HTTP client
- **Chart.js** 4.5.0 - Gráficos

### Testing
- **Playwright** 1.49.2 - E2E testing
- **Vitest** 3.1.0 - Unit testing

### Backend (Referencia)
- **NestJS** - Framework backend
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **Cloudinary** - Almacenamiento de imágenes

---

## 📊 Métricas del Sistema

- **Componentes React**: 50+
- **Custom Hooks**: 8
- **Services**: 7
- **Páginas**: 9
- **Endpoints API**: 40+
- **Tests E2E**: 2+
- **Líneas de código**: ~15,000+

---

## 🎯 Funcionalidades Principales

### ✅ Autenticación
- Login/Logout con JWT
- Reset de contraseña
- Roles: Admin e Inspector
- Verificación automática de expiración

### ✅ Gestión de Inspecciones
- Formulario multi-paso con 7 dependencias
- Subida de fotos a Cloudinary
- Estados: Nuevo, En proceso, Revisado, Archivado
- Papelera de reciclaje

### ✅ Reportes
- Búsqueda individual por número de trámite
- Filtros avanzados (fecha, estado, inspector)
- Exportación CSV/PDF

### ✅ Estadísticas
- Dashboard para Admin e Inspector
- Gráficos interactivos (Chart.js)
- Comparación entre dependencias
- Ranking de inspectores
- Análisis de tendencias

### ✅ Gestión de Usuarios
- CRUD completo (Admin)
- Bloqueo/desbloqueo
- Asignación de roles

---

## 🔐 Seguridad

- ✅ JWT con expiración
- ✅ Rutas protegidas
- ✅ Control de roles
- ✅ Sanitización de inputs
- ✅ Validación de archivos
- ✅ HTTPS en producción
- ✅ Rate limiting (básico)
- ✅ Prevención XSS
- ✅ Prevención SQL Injection

---

## 🚀 Despliegue

### Frontend (Vercel)
- Build automático desde main
- Variables de entorno configuradas
- Rewrites para SPA

### Backend (Railway)
- PostgreSQL database
- Cloudinary integration
- JWT secret configurado

---

## 📞 Soporte y Contacto

### Problemas Comunes

**1. Error al subir fotos**
- Verifica que el token JWT no haya expirado
- Revisa que el archivo sea menor a 10MB
- Confirma que el formato sea JPG/PNG/WEBP

**2. Sesión expira constantemente**
- Verifica la configuración de JWT en backend
- Revisa que `handleTokenExpired` no se llame incorrectamente

**3. Error 401 en peticiones**
- Verifica que el token esté en localStorage
- Confirma que el backend esté corriendo
- Revisa que el endpoint no requiera un rol específico

### Recursos Adicionales

- **Repositorio**: [GitHub](https://github.com/...)
- **Backend API**: https://inspecciones-muni-santa-cruz-production.up.railway.app
- **Documentación Backend**: (enlace si disponible)

---

## 🤝 Contribución

### Flujo de Trabajo

1. Fork del repositorio
2. Crear branch feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Add: nueva funcionalidad'`
4. Push al branch: `git push origin feature/nueva-funcionalidad`
5. Abrir Pull Request

### Estándares de Código

- Usar TypeScript types donde sea posible
- Seguir convenciones de nombres existentes
- Agregar tests para nuevas funcionalidades
- Documentar cambios significativos

---

## 📝 Changelog

### v2.0.0 - Sistema de Fotos Refactorizado (Enero 2025)
- ✅ Cambio completo de arquitectura de fotos
- ✅ Subida a Cloudinary antes de crear inspección
- ✅ URLs incluidas en payload de creación
- ✅ Eliminación de debug logs
- ✅ Documentación técnica completa

### v1.5.0 - Mejoras de UI (Diciembre 2024)
- ✅ Nuevos colores para dependencias
- ✅ Iconos para Work Closure y ServicePlatform
- ✅ Mejoras en InspectionManagementPage

### v1.0.0 - Release Inicial (Noviembre 2024)
- ✅ Sistema de autenticación
- ✅ CRUD de inspecciones
- ✅ Reportes básicos
- ✅ Dashboard admin/inspector

---

## 📚 Próximos Pasos

### Lecturas Recomendadas (en orden)

1. [Arquitectura General](./01_ARQUITECTURA_GENERAL.md) - Comprende el sistema
2. [Autenticación](./02_AUTENTICACION_Y_AUTORIZACION.md) - Entiende la seguridad
3. [Servicios API](./03_SERVICIOS_API.md) - Aprende los endpoints
4. [Sistema de Fotos](./04_SISTEMA_FOTOS.md) - Domina la subida de fotos

### Código para Explorar

\`\`\`bash
# Componente más importante
src/components/inspections/InspectionForm.jsx

# Hook principal
src/hooks/useInspections.js

# Servicio crítico
src/services/inspectionsService.js

# Transformación de datos
src/utils/mapInspectionDto.js

# Página principal
src/pages/InspectionManagementPage.jsx
\`\`\`

---

## ⚖️ Licencia

Este proyecto es propiedad de la Municipalidad de Santa Cruz, Costa Rica.

---

**Última actualización**: ${new Date().toLocaleDateString('es-CR')}

**Mantenido por**: Equipo de Desarrollo - Municipalidad de Santa Cruz

**Versión de documentación**: 2.0.0
