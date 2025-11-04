# Sistema de Manejo de Expiración de Token

## 📋 Resumen

Se ha implementado un sistema automático para manejar la expiración de tokens JWT en toda la aplicación. Cuando un token expire, el usuario verá una alerta y será redirigido automáticamente a la página de login.

## 🔧 Implementación

### 1. **Helper de Autenticación** (`src/utils/auth-helpers.js`)

Archivo centralizado con utilidades de autenticación:

#### Funcionalidad Principal
- `handleTokenExpired()`: Maneja la expiración del token
  - **Ignora rutas públicas** (login, forgot-password, reset-password)
  - Limpia el token del localStorage
  - Muestra alerta de SweetAlert2: "Sesión Expirada"
  - Redirige automáticamente a `/login`
  - Evita múltiples alertas simultáneas

- `isValidToken(token)`: Valida formato JWT básico
- `isTokenExpired(token)`: Decodifica JWT y verifica fecha de expiración
- `hasValidSession()`: Verifica si hay sesión activa y válida
- `getToken()`: Obtiene token del localStorage

#### Rutas Públicas Protegidas
```javascript
const PUBLIC_ROUTES = [
  '/login',
  '/admin/forgot-password',
  '/admin/reset-password'
];
```

### 2. **Configuración Centralizada de Axios** (`src/config/axiosConfig.js`)

Se creó una instancia configurada de axios con interceptores que:

#### Interceptor de Request (Salida)
- Agrega automáticamente el token JWT a todas las peticiones
- Lee el token de `localStorage`
- Lo añade en el header `Authorization: Bearer {token}`

#### Interceptor de Response (Entrada)
- Detecta respuestas con código 401 (No Autorizado)
- Llama a `handleTokenExpired()` cuando detecta 401
- El helper decide si mostrar alerta según el contexto

### 3. **Componente de Verificación Periódica** (`src/components/TokenExpirationChecker.jsx`)

Componente montado en `App.jsx` que:
- Verifica el token cada **30 segundos**
- Verifica inmediatamente al montar la aplicación
- **Ignora rutas públicas** para evitar alertas innecesarias
- Llama a `handleTokenExpired()` si detecta token expirado
- No renderiza nada visualmente (componente invisible)

### 4. **Actualización de Todos los Services**

Se actualizaron **7 servicios** para manejar errores 401:

#### Services con `fetch` (HTTP nativo):
- ✅ `authService.js` - Autenticación
- ✅ `inspectionsService.js` - Inspecciones
- ✅ `profileService.js` - Perfil de usuario
- ✅ `dashboardService.js` - Dashboard
- ✅ `usersService.js` - Usuarios
- ✅ `statsService.js` - Estadísticas

Todos detectan código 401 y llaman a `handleTokenExpired()`

#### Services con `axios`:
- ✅ `reportsService.js` - Reportes

Usa `axiosInstance` que tiene el interceptor configurado

## 🎯 Beneficios

1. **Centralizado**: Una sola configuración maneja todos los errores de token
2. **Consistente**: Mismo comportamiento en toda la aplicación
3. **UX Mejorado**: El usuario recibe un mensaje claro de lo que pasó
4. **Seguridad**: El token expirado se elimina inmediatamente
5. **Mantenible**: No hay que agregar lógica de manejo de token en cada servicio

## 🔄 Flujo de Trabajo

### Flujo 1: Detección por Petición HTTP
```
Usuario hace petición
        ↓
Service agrega token al header
        ↓
Backend recibe petición
        ↓
Token expirado → Backend responde 401
        ↓
Service/Interceptor detecta 401
        ↓
Llama handleTokenExpired()
        ↓
¿Es ruta pública? → SÍ → Solo limpia token, no alerta
        ↓ NO
Limpia localStorage
        ↓
Muestra alerta "Sesión Expirada"
        ↓
Usuario presiona "Aceptar"
        ↓
Redirige a /login
```

### Flujo 2: Verificación Periódica (cada 30s)
```
TokenExpirationChecker se ejecuta
        ↓
¿Hay token? → NO → Continuar
        ↓ SÍ
¿Es ruta pública? → SÍ → Continuar
        ↓ NO
Decodifica y verifica expiración JWT
        ↓
¿Token expirado? → NO → Continuar
        ↓ SÍ
Llama handleTokenExpired()
        ↓
Muestra alerta y redirige
```

## 📝 Archivos Creados y Modificados

### Archivos NUEVOS:
1. ✨ `src/utils/auth-helpers.js` - Utilidades de autenticación centralizadas
2. ✨ `src/config/axiosConfig.js` - Configuración de axios con interceptores
3. ✨ `src/components/TokenExpirationChecker.jsx` - Verificador periódico de token

### Archivos MODIFICADOS:
4. 📝 `src/services/authService.js` - Usa helper centralizado
5. 📝 `src/services/inspectionsService.js` - Detecta 401 y llama helper
6. 📝 `src/services/profileService.js` - Detecta 401 y llama helper
7. 📝 `src/services/dashboardService.js` - Detecta 401 y llama helper
8. 📝 `src/services/usersService.js` - Detecta 401 y llama helper
9. 📝 `src/services/statsService.js` - Detecta 401 y llama helper
10. 📝 `src/services/reportsService.js` - Usa axiosInstance configurado
11. 📝 `src/App.jsx` - Monta TokenExpirationChecker

## 🧪 Cómo Probar

### Prueba 1: Expiración Automática
1. Iniciar sesión normalmente
2. Esperar a que el token expire naturalmente
3. Verificar que aparezca la alerta "Sesión Expirada" automáticamente
4. Confirmar que redirige a `/login` después de cerrar la alerta

### Prueba 2: Token Expirado en Petición
1. Iniciar sesión normalmente
2. Manipular el localStorage con un token expirado (modificar `exp` en el JWT)
3. Hacer cualquier acción (cargar dashboard, crear inspección, etc.)
4. Verificar que aparezca la alerta inmediatamente
5. Confirmar redirección a login

### Prueba 3: Rutas Públicas (NO debe mostrar alerta)
1. Ir a `/admin/forgot-password`
2. Introducir email (puede generar error 401 internamente)
3. **Verificar que NO aparezca alerta de sesión expirada**
4. Lo mismo para `/admin/reset-password`

### Prueba 4: Verificación Periódica
1. Iniciar sesión
2. Dejar la aplicación abierta sin interactuar
3. Esperar 30+ segundos después de que expire el token
4. Verificar que la alerta aparezca automáticamente sin necesidad de hacer una acción

## 🔒 Seguridad

- El token se elimina inmediatamente del localStorage
- No se permiten múltiples alertas (se usa `allowOutsideClick: false`)
- El usuario debe confirmar antes de ser redirigido
- Aplica a todas las peticiones HTTP de la aplicación

## 🚀 Próximos Pasos (Opcional)

Si se desea mejorar aún más el sistema:

1. **Refresh Token**: Implementar sistema de renovación automática de tokens
2. **Pre-validación**: Verificar la expiración del token antes de hacer la petición
3. **Contador de Sesión**: Mostrar cuánto tiempo queda antes de la expiración
4. **Logging**: Registrar cuándo y por qué se expiran las sesiones

## 💡 Notas

- El sistema funciona tanto con `axios` (reportsService) como con `fetch` (authService y otros)
- SweetAlert2 ya está instalado en el proyecto, no se requiere instalación adicional
- Los servicios que aún usan `fetch` también están protegidos con lógica similar en el `request()` helper
