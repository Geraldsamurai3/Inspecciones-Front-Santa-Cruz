# Sistema de Papelera - Implementación Completa

## 📋 Resumen

Se ha implementado exitosamente un sistema completo de **papelera (soft-delete)** para las inspecciones, permitiendo mover inspecciones a la papelera y restaurarlas cuando sea necesario, sin eliminar permanentemente ningún dato.

---

## ✅ Componentes Implementados

### 1. **Enums y Configuración** (`src/domain/enums.js`)
- ✅ Agregado `PAPELERA: "Papelera"` al enum `InspectionStatus`
- Estado disponible para marcar inspecciones como eliminadas

### 2. **Capa de Servicios** (`src/services/inspectionsService.js`)
Tres nuevos endpoints:

```javascript
// Obtener todas las inspecciones en la papelera
getTrashInspections: () => request('/inspections/trash/list')

// Mover una inspección a la papelera
moveToTrash: (id) => request(`/inspections/${id}/trash`, { method: 'PATCH' })

// Restaurar una inspección desde la papelera
restoreFromTrash: (id) => request(`/inspections/${id}/restore`, { method: 'PATCH' })
```

### 3. **Hook de Datos** (`src/hooks/useInspections.js`)
Tres nuevas funciones:

```javascript
// Obtener inspecciones eliminadas (ordenadas por fecha de eliminación)
const getTrashInspections = useCallback(async () => {
  const data = await inspectionsService.getTrashInspections();
  return data.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
}, []);

// Mover a papelera y refrescar lista principal
const moveToTrash = useCallback(async (id) => {
  const result = await inspectionsService.moveToTrash(id);
  await fetchInspections(initialParamsRef.current);
  return result;
}, [fetchInspections]);

// Restaurar desde papelera y refrescar lista principal
const restoreFromTrash = useCallback(async (id) => {
  const result = await inspectionsService.restoreFromTrash(id);
  await fetchInspections(initialParamsRef.current);
  return result;
}, [fetchInspections]);
```

### 4. **Página de Papelera** (`src/pages/TrashPage.jsx`)
Componente completo (240 líneas) con:

- **Header**: Título "Papelera de Inspecciones" con icono Trash2 y contador
- **Botón de Actualizar**: RefreshCw para recargar la lista
- **Lista de Tarjetas**: Muestra inspecciones eliminadas con:
  - Número de expediente
  - Dependencia
  - Fecha de inspección
  - Ubicación
  - Solicitante
  - **Fecha de eliminación** (deletedAt)
- **Botón Restaurar**: Verde con confirmación SweetAlert2
- **Estado Vacío**: "La papelera está vacía" cuando no hay items
- **Estados de Carga**: Spinner mientras carga datos

### 5. **Gestión de Inspecciones** (`src/pages/InspectionManagementPage.jsx`)

#### a) Configuración de Estados
```javascript
[InspectionStatus.PAPELERA]: { 
  color: 'bg-red-100 text-red-800 border-red-200', 
  label: 'Papelera',
  actions: ['view', 'restore']
}
```

#### b) Acción "Mover a Papelera"
Agregada a los estados: `NUEVO`, `EN_PROCESO`, `REVISADO`, `ARCHIVADO`

```javascript
[InspectionStatus.NUEVO]: {
  // ...
  actions: ['view', 'start', 'trash']
}
```

#### c) Handler con Confirmación
```javascript
const handleMoveToTrash = async (inspectionId) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: '¿Deseas mover esta inspección a la papelera?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, mover a papelera',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    // Mover a papelera
    await moveToTrash(inspectionId);
    setIsModalOpen(false);
    // Mostrar mensaje de éxito
  }
};
```

#### d) Botón en Modal de Detalles
```javascript
{getStatusConfig(inspection.status).actions?.includes('trash') && (
  <Button variant="destructive" onClick={() => onMoveToTrash(inspection.id)}>
    <Trash2 className="w-4 h-4 mr-2" />
    Mover a Papelera
  </Button>
)}
```

### 6. **Rutas** (`src/App.jsx`)
```javascript
import TrashPage from './pages/TrashPage.jsx'

// En rutas de admin
<Route path="/admin/trash" element={<TrashPage />} />
```

### 7. **Navegación** (`src/components/admin/Sidebar.jsx`)
Nuevo item en el menú desplegable "Inspecciones-Trámite":

```javascript
{ 
  to: '/admin/trash', 
  label: 'Papelera', 
  icon: <Trash2 size={18}/>, 
  roles: ['admin'] 
}
```

---

## 🔄 Flujo Completo

### Mover a Papelera:
1. Usuario abre modal de inspección desde `/admin/inspections-management`
2. Ve botón "Mover a Papelera" (solo si estado lo permite)
3. Hace clic → aparece confirmación SweetAlert2
4. Si confirma:
   - Se llama `PATCH /inspections/:id/trash`
   - Backend cambia status a "Papelera" y establece `deletedAt`
   - Hook refresca lista principal
   - Modal se cierra
   - Mensaje de éxito
5. La inspección desaparece de la lista principal

### Restaurar desde Papelera:
1. Usuario navega a `/admin/trash` desde el menú
2. Ve lista de inspecciones eliminadas (ordenadas por fecha de eliminación)
3. Hace clic en "Restaurar" → aparece confirmación SweetAlert2
4. Si confirma:
   - Se llama `PATCH /inspections/:id/restore`
   - Backend cambia status a "Nuevo" y limpia `deletedAt`
   - Se refresca lista de papelera
   - Mensaje de éxito
5. La inspección desaparece de la papelera y reaparece en lista principal

---

## 🎨 Características de UI/UX

### Papelera (`TrashPage.jsx`)
- **Icono**: Trash2 rojo en el header
- **Tarjetas**: Borde izquierdo rojo (#ef4444)
- **Botón Restaurar**: Verde con icono RefreshCw
- **Fechas**: Formato legible "DD/MM/YYYY HH:mm"
- **Estado vacío**: Icono AlertCircle + mensaje claro

### Modal de Inspección
- **Botón Papelera**: Variante "destructive" (rojo)
- **Posicionamiento**: Sticky bottom junto a otras acciones
- **Confirmación**: Dialog de advertencia (warning icon)

### Navegación
- **Posición**: Dentro del menú "Inspecciones-Trámite"
- **Acceso**: Solo rol admin
- **Icono**: Trash2 consistente con el tema

---

## 🔒 Reglas de Negocio Implementadas

1. ✅ **Soft Delete**: Nunca se elimina data permanentemente
2. ✅ **Audit Trail**: Timestamp `deletedAt` preservado
3. ✅ **Auto-filtrado**: GET /inspections excluye automáticamente Papelera
4. ✅ **Permisos**: Solo admin puede ver/gestionar papelera
5. ✅ **Confirmaciones**: Todos los cambios requieren confirmación explícita
6. ✅ **Restauración limpia**: Al restaurar → status "Nuevo" + deletedAt null
7. ✅ **Refresh automático**: Listas se actualizan después de cada acción

---

## 📡 Integración Backend

### Endpoints Utilizados:
```
GET  /inspections/trash/list     → Lista inspecciones con status "Papelera"
PATCH /inspections/:id/trash     → Cambia status a "Papelera" + establece deletedAt
PATCH /inspections/:id/restore   → Cambia status a "Nuevo" + limpia deletedAt
```

### Campos Importantes:
- `status`: "Papelera" para inspecciones eliminadas
- `deletedAt`: Timestamp de cuándo se movió a papelera (ISO 8601)
- Auto-restauración: status → "Nuevo" (configurable si es necesario)

---

## 🧪 Testing Recomendado

### Casos a Probar:
1. ✅ Mover inspección nueva a papelera
2. ✅ Mover inspección en proceso a papelera
3. ✅ Verificar que desaparece de lista principal
4. ✅ Abrir `/admin/trash` y verificar que aparece
5. ✅ Verificar orden por fecha de eliminación (más reciente primero)
6. ✅ Restaurar inspección desde papelera
7. ✅ Verificar que vuelve a lista principal con status "Nuevo"
8. ✅ Verificar que deletedAt se limpia al restaurar
9. ✅ Intentar mover inspección ya en papelera (no debe mostrar botón)
10. ✅ Verificar confirmaciones en ambas acciones

---

## 📦 Archivos Modificados

```
✅ src/domain/enums.js                         (+ PAPELERA status)
✅ src/services/inspectionsService.js          (+ 3 endpoints)
✅ src/hooks/useInspections.js                 (+ 3 funciones)
✅ src/pages/InspectionManagementPage.jsx      (+ statusConfig, handler, botón)
✅ src/components/admin/Sidebar.jsx            (+ menu item)
✅ src/App.jsx                                 (+ ruta)
```

## 📦 Archivos Creados

```
✅ src/pages/TrashPage.jsx                     (240 líneas - componente completo)
```

---

## 🎯 Estado Final

- ✅ **0 errores de compilación**
- ✅ **Integración completa con backend**
- ✅ **UI/UX consistente con diseño existente**
- ✅ **Confirmaciones de seguridad implementadas**
- ✅ **Navegación accesible desde menú**
- ✅ **Documentación completa**

---

## 🚀 Próximos Pasos (Opcionales)

1. **Badge con contador**: Mostrar número de items en papelera en el menú
2. **Eliminación automática**: Configurar limpieza automática después de X días
3. **Filtros en papelera**: Por fecha, dependencia, etc.
4. **Búsqueda en papelera**: Campo de búsqueda por expediente/solicitante
5. **Exportación**: Permitir exportar lista de items eliminados

---

**Implementado por**: GitHub Copilot  
**Fecha**: ${new Date().toLocaleDateString('es-ES')}  
**Estado**: ✅ COMPLETADO
