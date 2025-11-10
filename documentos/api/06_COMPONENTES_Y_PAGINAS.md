# 🧩 Componentes y Páginas del Sistema

## 📋 Índice
- [Páginas Principales](#páginas-principales)
- [Componentes Admin](#componentes-admin)
- [Componentes de Autenticación](#componentes-de-autenticación)
- [Componentes de Inspecciones](#componentes-de-inspecciones)
- [Componentes de Reportes](#componentes-de-reportes)
- [Componentes de Estadísticas](#componentes-de-estadísticas)
- [Componentes de Usuarios](#componentes-de-usuarios)
- [Componentes UI](#componentes-ui)

---

## 📄 Páginas Principales

### AdminDashboard.jsx
**Ruta**: `/admin/dashboard`  
**Acceso**: Solo Admin

**Funcionalidad**:
- Dashboard completo del administrador
- Estadísticas generales del sistema
- Gráficos de inspecciones por estado
- Lista de equipo de inspectores
- Inspecciones recientes
- Contadores por tipo de solicitante

**Datos mostrados**:
- Total de inspecciones
- Total de inspectores
- Distribución por estado (Nuevo, En proceso, Revisado, Archivado)
- Distribución por dependencia
- Top 5 inspectores más activos

---

### InspectorDashboard.jsx
**Ruta**: `/admin/inspector-dashboard`  
**Acceso**: Inspector y Admin

**Funcionalidad**:
- Dashboard personal del inspector
- Sus propias inspecciones
- Estadísticas personales
- Inspecciones asignadas

**Datos mostrados**:
- Mis inspecciones por estado
- Inspecciones recientes propias
- Tasa de completitud
- Tiempo promedio

---

### InspectionManagementPage.jsx
**Ruta**: `/admin/inspections-management`  
**Acceso**: Solo Admin

**Funcionalidad**:
- CORE del sistema - Gestión completa de inspecciones
- Visualización en tarjetas con colores por dependencia
- Filtros avanzados
- Cambio de estado
- Eliminación (mover a papelera)

**Características**:
- **Colores por dependencia**:
  - Mayor Office: Naranja
  - Constructions: Azul
  - Maritime Zone: Verde azulado
  - Service Platform: Violeta
  - Collections: Amarillo
  - Work Closure: Rojo
  - Taxes and Licenses: Índigo

- **Filtros disponibles**:
  - Por estado
  - Por dependencia
  - Por inspector
  - Por rango de fechas
  - Por número de trámite

- **Acciones por tarjeta**:
  - Ver detalle completo
  - Cambiar estado
  - Mover a papelera
  - Exportar PDF/CSV

---

### InspectionForm.jsx (en components)
**Ruta**: `/admin/inspectionsform`  
**Acceso**: Inspector y Admin

**Funcionalidad**:
- Formulario multi-paso para crear inspecciones
- **Paso 1**: Información básica
  - Fecha de inspección
  - Número de trámite
  - Tipo de solicitante (Anónimo, Persona Física, Persona Jurídica)
  - Inspectores asignados
  - Ubicación (distrito, dirección exacta)

- **Paso 2**: Datos del solicitante
  - Si es Persona Física: Nombre, apellidos, cédula
  - Si es Persona Jurídica: Razón social, cédula jurídica

- **Paso 3**: Dependencia específica
  - Mayor Office (Alcaldía)
  - Constructions (5 procedimientos)
  - Maritime Zone (ZMT)
  - Service Platform
  - Collections
  - Work Closure
  - Taxes and Licenses

**Validaciones**:
- react-hook-form con Zod schemas
- Validación de fotos requeridas
- Validación de campos obligatorios por dependencia

**Líneas de código**: 2625 líneas (componente más grande del sistema)

---

### UsersPage.jsx
**Ruta**: `/admin/users`  
**Acceso**: Solo Admin

**Funcionalidad**:
- CRUD completo de usuarios
- Crear nuevo usuario (Admin o Inspector)
- Editar datos de usuarios
- Bloquear/desbloquear usuarios
- Eliminar usuarios
- Ver lista de usuarios con filtros

**Campos del formulario**:
- Nombre
- Apellidos
- Cédula
- Email
- Teléfono
- Contraseña
- Rol (Admin/Inspector)

---

### StatsPage.jsx
**Ruta**: `/admin/stats`  
**Acceso**: Solo Admin

**Funcionalidad**:
- Página de estadísticas avanzadas
- Múltiples gráficos y visualizaciones
- Exportación de datos

**Componentes incluidos**:
- SummaryCards (resumen)
- StatusChart (gráfico por estado)
- DepartmentComparison (comparación de dependencias)
- InspectorRanking (ranking de inspectores)
- InspectionTrends (tendencias temporales)
- DetailedAnalytics (análisis detallado)

---

### ReportsPage.jsx
**Ruta**: `/admin/reports`  
**Acceso**: Solo Admin

**Funcionalidad**:
- Búsqueda individual por número de trámite
- Búsqueda masiva con filtros
- Vista previa de resultados
- Exportación CSV/PDF (individual o masiva)

**Componentes incluidos**:
- IndividualSearch (búsqueda individual)
- ReportFilters (filtros avanzados)
- PreviewTable (tabla de resultados)

---

### TrashPage.jsx
**Ruta**: `/admin/trash`  
**Acceso**: Solo Admin

**Funcionalidad**:
- Papelera de reciclaje
- Inspecciones eliminadas (soft delete)
- Restaurar inspecciones
- Eliminación permanente

**Acciones disponibles**:
- Restaurar una inspección
- Eliminar permanentemente
- Ver detalles de inspección eliminada

---

### ProfilePage.jsx
**Ruta**: `/admin/profile`  
**Acceso**: Inspector y Admin

**Funcionalidad**:
- Ver perfil del usuario autenticado
- Datos personales
- Rol asignado
- Información de cuenta

**Datos mostrados**:
- Nombre completo
- Email
- Cédula
- Teléfono
- Rol
- Fecha de creación de cuenta

---

### ForgotPasswordPage.jsx
**Ruta**: `/admin/forgot-password`  
**Acceso**: Público

**Funcionalidad**:
- Solicitar reset de contraseña
- Envía email con token de recuperación

---

### ResetPasswordPage.jsx
**Ruta**: `/admin/reset-password`  
**Acceso**: Público (con token)

**Funcionalidad**:
- Resetear contraseña con token recibido por email
- Validación de token
- Nueva contraseña

---

## 🔐 Componentes Admin

### AdminLayout.jsx
**Funcionalidad**:
- Layout principal del área administrativa
- Sidebar de navegación
- Área de contenido principal
- Header con user info

**Estructura**:
```jsx
<AdminLayout>
  <Sidebar />
  <main>
    <Outlet /> {/* Páginas hijas */}
  </main>
</AdminLayout>
```

---

### Sidebar.jsx
**Funcionalidad**:
- Navegación principal del sistema
- Menú colapsable en móvil
- Items por rol (Admin/Inspector)
- Submenú de inspecciones
- Botón de logout

**Items del menú**:

**Para Inspectores**:
- Dashboard Inspector
- Crear Inspección
- Perfil

**Para Admins** (además de los anteriores):
- Dashboard Admin
- Gestión de Inspecciones
- Usuarios
- Estadísticas
- Reportes
- Papelera

---

## 🔑 Componentes de Autenticación

### LoginPage.jsx
**Funcionalidad**:
- Página de login
- Formulario con email y password
- Toggle para mostrar/ocultar contraseña
- Link a "Olvidé mi contraseña"
- Ilustración decorativa

**Validaciones**:
- Email requerido
- Password requerida
- Mensajes de error claros

---

### RequireAuth.jsx
**Funcionalidad**:
- HOC para proteger rutas
- Verifica que exista usuario autenticado
- Redirige a login si no hay usuario

```jsx
<Route element={<RequireAuth />}>
  {/* Rutas protegidas */}
</Route>
```

---

### RequireRole.jsx
**Funcionalidad**:
- HOC para control de acceso por rol
- Verifica que el usuario tenga el rol requerido
- Admin tiene acceso a todo
- Inspector solo a sus rutas

```jsx
<Route element={<RequireRole roles={["admin"]} />}>
  {/* Solo Admin */}
</Route>
```

---

### TokenExpirationChecker.jsx
**Funcionalidad**:
- Componente invisible que verifica token periódicamente
- Cada 30 segundos verifica si el token expiró
- Muestra alerta y redirige a login si expira
- Se monta en App.jsx

---

## 📋 Componentes de Inspecciones

### InspectionForm.jsx
**Componentes internos**:

#### PhotoField
- Campo para subir fotos
- Validación de tipo, tamaño, nombre
- Preview del archivo seleccionado
- Botón para eliminar
- Mensajes de error

**Props**:
```typescript
{
  fieldKey: string;
  label: string;
  photos: object;
  setPhotos: function;
  photoErrors: object;
  setPhotoErrors: function;
}
```

#### AddressField (ejemplo de campo reutilizable)
- Campo para dirección exacta
- Textarea con validación

---

## 📊 Componentes de Reportes

### IndividualSearch.jsx
**Funcionalidad**:
- Búsqueda por número de trámite
- Input con validación
- Muestra resultados
- Botones para exportar CSV/PDF

**Casos de uso**:
- Búsqueda única → Muestra detalle
- Múltiples resultados → Muestra selector

---

### ReportFilters.jsx
**Funcionalidad**:
- Filtros avanzados para reportes masivos
- Filtro por rango de fechas
- Filtro por estado
- Filtro por inspector
- Botón para aplicar filtros

**Campos**:
- Fecha inicio
- Fecha fin
- Estado (dropdown)
- Inspector (dropdown)

---

### PreviewTable.jsx
**Funcionalidad**:
- Tabla de vista previa de resultados
- Muestra primeros 10 registros
- Botones para exportar todos
- Paginación

**Columnas**:
- Número de trámite
- Fecha
- Estado
- Dependencia
- Inspector
- Acciones

---

## 📈 Componentes de Estadísticas

### SummaryCards.jsx
**Funcionalidad**:
- Tarjetas de resumen con números clave
- Total de inspecciones
- Total por estado
- Total de inspectores

**Estilo**: Cards con iconos y colores

---

### StatusChart.jsx
**Funcionalidad**:
- Gráfico de dona (doughnut) con Chart.js
- Muestra distribución por estado
- Colores por estado:
  - Nuevo: Azul
  - En proceso: Amarillo
  - Revisado: Verde
  - Archivado: Gris

---

### DepartmentComparison.jsx
**Funcionalidad**:
- Gráfico de barras comparativo
- Inspecciones por dependencia
- Colores distintivos por dependencia

---

### InspectorRanking.jsx
**Funcionalidad**:
- Ranking de inspectores más activos
- Tabla ordenada por cantidad de inspecciones
- Top 10 inspectores

---

### InspectionTrends.jsx
**Funcionalidad**:
- Gráfico de línea temporal
- Tendencias de inspecciones en el tiempo
- Por día/semana/mes

---

### DetailedAnalytics.jsx
**Funcionalidad**:
- Análisis detallado completo
- Múltiples gráficos
- Tablas de datos
- Exportación

---

### DependenciesFlat.jsx
**Funcionalidad**:
- Vista plana de dependencias
- Lista simple con contadores

---

### DependenciesNested.jsx
**Funcionalidad**:
- Vista anidada de dependencias
- Árbol expandible
- Sub-procedimientos visibles

---

### StatsConfig.jsx
**Funcionalidad**:
- Configuración de estadísticas
- Selección de métricas a mostrar
- Rango de fechas global

---

### StatsErrorBoundary.jsx
**Funcionalidad**:
- Error boundary para componentes de stats
- Captura errores de gráficos
- Muestra mensaje amigable

---

### StatsConnectionTest.jsx
**Funcionalidad**:
- Test de conexión con endpoints de stats
- Útil para debugging
- Verifica disponibilidad de cada endpoint

---

## 👥 Componentes de Usuarios

### UserList.jsx
**Funcionalidad**:
- Lista de usuarios en tabla
- Acciones por usuario (Editar, Bloquear, Eliminar)
- Indicador de estado (Activo/Bloqueado)
- Badge de rol

---

### UserForm.jsx
**Funcionalidad**:
- Formulario para crear usuario nuevo
- Validación de todos los campos
- Select de rol
- Generación de contraseña

---

### EditUserForm.jsx
**Funcionalidad**:
- Formulario para editar usuario existente
- Pre-llenado con datos actuales
- No edita contraseña (requiere reset)

---

## 🎨 Componentes UI (shadcn/ui)

Componentes reutilizables basados en Radix UI:

### button.jsx
- Botones con variantes: default, destructive, outline, ghost, link
- Tamaños: sm, default, lg, icon

### card.jsx
- Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter

### input.jsx
- Input estilizado con Tailwind

### label.jsx
- Label para formularios

### badge.jsx
- Badges con variantes: default, secondary, destructive, outline

### checkbox.jsx
- Checkbox estilizado

### radio-group.jsx
- Radio buttons estilizados

### textarea.jsx
- Textarea para textos largos

### separator.jsx
- Línea separadora

### pagination.jsx
- Componente de paginación

### toast.jsx / toaster.jsx
- Notificaciones toast

### security-alert.jsx
- Alerta de seguridad customizada

---

## 🗂️ Estructura Completa

```
src/
├── pages/                          ← 10 páginas principales
│   ├── AdminDashboard.jsx
│   ├── InspectorDashboard.jsx
│   ├── InspectionManagementPage.jsx
│   ├── UsersPage.jsx
│   ├── StatsPage.jsx
│   ├── ReportsPage.jsx
│   ├── TrashPage.jsx
│   ├── ProfilePage.jsx
│   ├── ForgotPasswordPage.jsx
│   └── ResetPasswordPage.jsx
│
├── components/
│   ├── admin/                      ← Layout admin
│   │   ├── AdminLayout.jsx
│   │   └── Sidebar.jsx
│   │
│   ├── auth/                       ← Autenticación
│   │   └── LoginPage.jsx
│   │
│   ├── inspections/                ← CORE
│   │   └── InspectionForm.jsx      (2625 líneas)
│   │
│   ├── reports/                    ← Reportes
│   │   ├── IndividualSearch.jsx
│   │   ├── ReportFilters.jsx
│   │   └── PreviewTable.jsx
│   │
│   ├── stats/                      ← Estadísticas (12 componentes)
│   │   ├── SummaryCards.jsx
│   │   ├── StatusChart.jsx
│   │   ├── DepartmentComparison.jsx
│   │   ├── InspectorRanking.jsx
│   │   ├── InspectionTrends.jsx
│   │   ├── DetailedAnalytics.jsx
│   │   ├── DependenciesFlat.jsx
│   │   ├── DependenciesNested.jsx
│   │   ├── StatsConfig.jsx
│   │   ├── StatsErrorBoundary.jsx
│   │   ├── StatsConnectionTest.jsx
│   │   └── index.js
│   │
│   ├── users/                      ← Gestión usuarios
│   │   ├── UserList.jsx
│   │   ├── UserForm.jsx
│   │   └── EditUserForm.jsx
│   │
│   ├── ui/                         ← Componentes UI (shadcn)
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── input.jsx
│   │   ├── label.jsx
│   │   ├── badge.jsx
│   │   ├── checkbox.jsx
│   │   ├── radio-group.jsx
│   │   ├── textarea.jsx
│   │   ├── separator.jsx
│   │   ├── pagination.jsx
│   │   ├── toast.jsx
│   │   ├── toaster.jsx
│   │   └── security-alert.jsx
│   │
│   ├── RequireAuth.jsx             ← HOCs de protección
│   ├── RequireRole.jsx
│   ├── ProtectedRoute.jsx
│   └── TokenExpirationChecker.jsx
│
├── hooks/                          ← 8 custom hooks
├── services/                       ← 7 API services
├── utils/                          ← 5 utilidades
└── ...
```

---

## 📊 Métricas de Componentes

| Categoría | Cantidad | Líneas aprox |
|-----------|----------|--------------|
| **Páginas** | 10 | ~5,000 |
| **Componentes Admin** | 2 | ~500 |
| **Componentes Auth** | 4 | ~600 |
| **Componentes Inspecciones** | 1 | ~2,625 |
| **Componentes Reportes** | 3 | ~800 |
| **Componentes Stats** | 12 | ~3,000 |
| **Componentes Usuarios** | 3 | ~700 |
| **Componentes UI** | 14 | ~1,200 |
| **TOTAL** | **49** | **~14,425** |

---

**Documento actualizado**: ${new Date().toLocaleDateString('es-CR')}
**Autor**: Sistema de Inspecciones Municipales - Santa Cruz
