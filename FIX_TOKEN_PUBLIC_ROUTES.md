# 🔧 Fix: Sistema de Expiración de Token - Rutas Públicas

## Problema Reportado

El usuario reportó que al hacer clic en "Olvidé mi contraseña" aparecía el mensaje de "Sesión Expirada", cuando esta es una ruta pública que no requiere autenticación.

## Causa Raíz

El sistema estaba mostrando la alerta de token expirado en **TODAS** las rutas cuando detectaba un error 401, incluyendo rutas públicas como:
- `/login`
- `/admin/forgot-password`
- `/admin/reset-password`

## Solución Implementada

### 1. **Detección de Rutas Públicas en Helper**

Se agregó lógica en `src/utils/auth-helpers.js` para:
- Definir lista de rutas públicas
- Verificar si la ruta actual es pública antes de mostrar alerta
- Si es ruta pública: solo limpiar token, NO mostrar alerta

```javascript
const PUBLIC_ROUTES = [
  '/login',
  '/admin/forgot-password',
  '/admin/reset-password'
];

const isPublicRoute = () => {
  const currentPath = window.location.pathname;
  return PUBLIC_ROUTES.some(route => currentPath.startsWith(route));
};
```

### 2. **Actualización de TokenExpirationChecker**

El componente de verificación periódica ahora:
- Ignora rutas públicas en la verificación
- No intenta validar tokens cuando el usuario está en login/forgot/reset

### 3. **Comportamiento Final**

✅ **EN RUTAS PROTEGIDAS** (Dashboard, Inspecciones, etc.):
- Detecta token expirado
- Muestra alerta "Sesión Expirada"
- Redirige a `/login`

✅ **EN RUTAS PÚBLICAS** (Login, Forgot Password, Reset Password):
- Detecta token expirado
- Solo limpia el token silenciosamente
- **NO muestra alerta**
- Permite al usuario continuar en la ruta pública

## Archivos Modificados

1. ✅ `src/utils/auth-helpers.js` - Agregada detección de rutas públicas
2. ✅ `src/components/TokenExpirationChecker.jsx` - Ignora rutas públicas

## Pruebas Recomendadas

1. ✅ Ir a "Olvidé mi contraseña" → NO debe mostrar alerta
2. ✅ Ir a "Restablecer contraseña" → NO debe mostrar alerta  
3. ✅ Estar en Dashboard con token expirado → SÍ debe mostrar alerta
4. ✅ Hacer clic en cualquier acción protegida con token expirado → SÍ debe mostrar alerta

## Estado

✅ **RESUELTO** - El sistema ahora distingue entre rutas públicas y protegidas correctamente.
