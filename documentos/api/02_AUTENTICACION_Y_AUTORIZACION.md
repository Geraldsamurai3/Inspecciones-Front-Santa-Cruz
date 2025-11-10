# 🔐 Sistema de Autenticación y Autorización

## 📋 Índice
- [Visión General](#visión-general)
- [Arquitectura JWT](#arquitectura-jwt)
- [Flujo de Login](#flujo-de-login)
- [Gestión de Tokens](#gestión-de-tokens)
- [Rutas Protegidas](#rutas-protegidas)
- [Control de Roles](#control-de-roles)
- [Expiración de Sesión](#expiración-de-sesión)
- [Seguridad](#seguridad)

---

## 🎯 Visión General

El sistema utiliza **JWT (JSON Web Tokens)** para autenticación y autorización basada en roles. Los tokens se almacenan en `localStorage` y se envían en cada request mediante el header `Authorization: Bearer <token>`.

### Características Principales
- ✅ Autenticación JWT con tokens stateless
- ✅ Roles: Admin (acceso total) e Inspector (acceso limitado)
- ✅ Validación automática de expiración de token
- ✅ Rutas protegidas con React Router
- ✅ Logout manual vs automático por expiración
- ✅ Reset de contraseña con tokens temporales

---

## 🏗️ Arquitectura JWT

### Estructura del Token

El backend devuelve un JWT en formato estándar:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE... (3 partes separadas por .)
├─ Header (algoritmo, tipo)
├─ Payload (datos del usuario)
└─ Signature (firma criptográfica)
```

**Payload decodificado:**
```json
{
  "sub": 123,               // ID del usuario
  "email": "admin@muni.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "admin",          // o "inspector"
  "iat": 1705000000,        // Issued At (timestamp)
  "exp": 1705086400         // Expiration (timestamp)
}
```

### Decodificación en Frontend

```javascript
// src/hooks/useAuth.jsx
function decodeJWT(token) {
  try {
    const [, payload] = token.split('.')
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}
```

**Nota**: Esta función **NO valida la firma** (solo el backend puede hacerlo). Se usa únicamente para leer datos del usuario.

---

## 🔄 Flujo de Login

### 1. Usuario Ingresa Credenciales

```jsx
// LoginPage.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await login(formData.email, formData.password);
    navigate("/admin/dashboard", { replace: true });
  } catch (err) {
    setError(err.message || "Error al iniciar sesión");
  }
};
```

### 2. useAuth.login() Procesa la Autenticación

```javascript
// useAuth.jsx
const login = useCallback(async (email, password) => {
  setLoading(true);
  try {
    // Llama al servicio de autenticación
    const res = await authService.login(email, password);
    const token = res.access_token;
    
    if (!token) throw new Error('No vino access_token del login');
    
    // Guarda token en localStorage
    localStorage.setItem('token', token);
    
    // Decodifica y establece usuario en estado
    const payload = decodeJWT(token);
    setUser(payload);
    
    return payload;
  } finally {
    setLoading(false);
  }
}, []);
```

### 3. authService.login() Hace Request HTTP

```javascript
// authService.js
login: (email, password) =>
  request('/auth/login', {
    method: 'POST',
    body: { email, password },
    credentials: 'include',
  })
```

### 4. Backend Valida y Devuelve Token

```
POST /auth/login
{
  "email": "admin@muni.com",
  "password": "secret123"
}

→ 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }  // Opcional
}
```

### 5. React Router Redirige

```jsx
// App.jsx - RequireAuth verifica token
<Route element={<RequireAuth />}>
  <Route path="/admin" element={<AdminLayout />}>
    {/* Rutas protegidas */}
  </Route>
</Route>
```

---

## 🔑 Gestión de Tokens

### Almacenamiento

```javascript
// Al hacer login
localStorage.setItem('token', jwt_token);

// Al hacer logout
localStorage.removeItem('token');

// Para obtenerlo
const token = localStorage.getItem('token');
```

### Envío en Requests

**Opción 1: Fetch nativo (en services)**
```javascript
const token = localStorage.getItem('token');
const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

const response = await fetch(`${BASE_URL}/inspections`, {
  headers: {
    'Content-Type': 'application/json',
    ...authHeader,
  },
});
```

**Opción 2: Axios con interceptor**
```javascript
// axiosConfig.js
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 🛡️ Rutas Protegidas

### RequireAuth - Verifica Existencia de Usuario

```jsx
// RequireAuth.jsx
export default function RequireAuth() {
  const { user } = useAuth();

  if (!user) {
    // No hay token válido → redirigir al login
    return <Navigate to="/login" replace />;
  }

  // Usuario autenticado → renderizar rutas hijas
  return <Outlet />;
}
```

**Uso en App.jsx:**
```jsx
<Route element={<RequireAuth />}>
  {/* Todo lo que esté aquí requiere autenticación */}
  <Route path="/admin" element={<AdminLayout />}>
    <Route path="dashboard" element={<AdminDashboard />} />
    {/* ... */}
  </Route>
</Route>
```

### Rutas Públicas

```jsx
// NO requieren RequireAuth
<Route path="/login" element={<LoginPage />} />
<Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
<Route path="/admin/reset-password" element={<ResetPasswordPage />} />
```

---

## 👥 Control de Roles

### RequireRole - Verifica Permisos por Rol

```jsx
// RequireRole.jsx
export default function RequireRole({ roles = [] }) {
  const { user } = useAuth();
  const location = useLocation();

  // Si no hay usuario, RequireAuth se encarga
  if (!user) return <Navigate to="/login" replace />;

  const role = normalizeRole(user); // Extrae y normaliza rol

  // Admin SIEMPRE pasa (acceso total)
  if (role === 'admin') return <Outlet />;

  // Si el rol está en la lista permitida
  if (roles.map(r => r.toLowerCase()).includes(role)) {
    return <Outlet />;
  }

  // No autorizado → redirigir a dashboard
  return <Navigate to="/admin/dashboard" replace />;
}
```

### Normalización de Roles

```javascript
function normalizeRole(user) {
  // Backend puede enviar 'role' o 'rol'
  const raw = (user?.role || user?.rol || '').toString().trim().toLowerCase();
  if (!raw) return 'inspector'; // Fallback conservador
  return raw; // "admin" o "inspector"
}
```

### Jerarquía de Rutas por Rol

```jsx
// App.jsx
<Route element={<RequireAuth />}>
  <Route path="/admin" element={<AdminLayout />}>
    
    {/* Rutas para Inspector (y Admin por herencia) */}
    <Route element={<RequireRole roles={["inspector"]} />}>
      <Route path="inspector-dashboard" element={<InspectorDashboard />} />
      <Route path="inspectionsform" element={<InspectionForm />} />
      <Route path="profile" element={<ProfilePage />} />
    </Route>

    {/* Rutas SOLO para Admin */}
    <Route element={<RequireRole roles={["admin"]} />}>
      <Route path="users" element={<UsersPage />} />
      <Route path="inspections-management" element={<InspectionManagementPage />} />
      <Route path="stats" element={<StatsPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="trash" element={<TrashPage />} />
    </Route>

  </Route>
</Route>
```

**Resumen de accesos:**

| Ruta | Admin | Inspector |
|------|-------|-----------|
| `/admin/inspector-dashboard` | ✅ | ✅ |
| `/admin/inspectionsform` | ✅ | ✅ |
| `/admin/profile` | ✅ | ✅ |
| `/admin/dashboard` | ✅ | ❌ |
| `/admin/users` | ✅ | ❌ |
| `/admin/stats` | ✅ | ❌ |
| `/admin/reports` | ✅ | ❌ |
| `/admin/trash` | ✅ | ❌ |

---

## ⏱️ Expiración de Sesión

### TokenExpirationChecker - Verificación Periódica

```jsx
// TokenExpirationChecker.jsx
const TokenExpirationChecker = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar cada 30 segundos
    const intervalId = setInterval(() => {
      const token = localStorage.getItem('token');
      const currentPath = window.location.pathname;
      const isPublicRoute = PUBLIC_ROUTES.some(route => 
        currentPath.startsWith(route)
      );
      
      // Si no hay token o está en ruta pública, no hacer nada
      if (!token || isPublicRoute) return;

      // Si el token ha expirado
      if (!hasValidSession()) {
        handleTokenExpired();
      }
    }, 30000); // 30 segundos

    return () => clearInterval(intervalId);
  }, [navigate]);

  return null; // No renderiza nada
};
```

**Montado en App.jsx:**
```jsx
export default function App() {
  return (
    <>
      <TokenExpirationChecker />
      <Routes>
        {/* ... */}
      </Routes>
    </>
  );
}
```

### Validación de Token

```javascript
// auth-helpers.js

// Verificar estructura del token
export const isValidToken = (token) => {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

// Verificar expiración
export const isTokenExpired = (token) => {
  if (!isValidToken(token)) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convertir a milisegundos
    return Date.now() >= exp;
  } catch (error) {
    return true;
  }
};

// Verificar sesión activa
export const hasValidSession = () => {
  const token = getToken();
  if (!token) return false;
  return !isTokenExpired(token);
};
```

### Manejo de Token Expirado

```javascript
// auth-helpers.js
export const handleTokenExpired = () => {
  // No mostrar alerta si fue un logout manual
  if (isManualLogout) return;

  // No mostrar alerta si estamos en una ruta pública
  if (isPublicRoute()) {
    localStorage.removeItem('token');
    return;
  }

  // No mostrar si ya no hay token
  const token = localStorage.getItem('token');
  if (!token) return;

  // Evitar mostrar múltiples alertas
  if (isShowingExpiredAlert) return;
  
  isShowingExpiredAlert = true;
  localStorage.removeItem('token');
  
  // Mostrar alerta con SweetAlert2
  Swal.fire({
    icon: 'warning',
    title: 'Sesión Expirada',
    text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    confirmButtonText: 'Aceptar',
    allowOutsideClick: false,
    allowEscapeKey: false,
  }).then(() => {
    isShowingExpiredAlert = false;
    window.location.href = '/login';
  });
};
```

### Manejo de 401 en Services

```javascript
// inspectionsService.js
async function request(path, opts = {}) {
  const res = await fetch(`${BASE_URL}${path}`, { /* ... */ });

  if (!res.ok) {
    // Si el backend devuelve 401, token inválido o expirado
    if (res.status === 401) {
      handleTokenExpired();
      throw new Error('Token expirado');
    }
    // Otros errores...
  }
  // ...
}
```

**Todos los services implementan este patrón:**
- authService.js
- inspectionsService.js
- usersService.js
- statsService.js
- dashboardService.js
- profileService.js

---

## 🔒 Seguridad

### 1. Sanitización de Inputs

```javascript
// authService.js
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  return input;
};
```

### 2. HTTPS en Producción

```javascript
// .env
VITE_API_URL=https://inspecciones-muni-santa-cruz-production.up.railway.app
```

### 3. Credentials Include

```javascript
fetch(url, {
  credentials: 'include', // Permite cookies HttpOnly si el backend las usa
});
```

### 4. Token No Accesible desde XSS

**Desventaja de `localStorage`**: Vulnerable a XSS.

**Mitigación:**
- Sanitización de inputs
- Content Security Policy (CSP) en headers
- Validación de todas las URLs de Cloudinary

**Alternativa mejor (futuro)**: Usar `httpOnly cookies` para almacenar el token (requiere cambio en backend).

### 5. Logout Manual vs Automático

```javascript
// auth-helpers.js
let isManualLogout = false;

export const handleManualLogout = () => {
  isManualLogout = true; // Marca como logout intencional
  localStorage.removeItem('token');
  setTimeout(() => {
    isManualLogout = false; // Reset después de 500ms
  }, 500);
};

// useAuth.jsx
const logout = useCallback(() => {
  handleManualLogout(); // Usa la función especial
  setUser(null);
}, []);
```

**Beneficio**: Evita mostrar "Sesión expirada" cuando el usuario hace logout manualmente.

---

## 🔄 Flujo de Reset de Contraseña

### 1. Usuario Solicita Reset

```jsx
// ForgotPasswordPage.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await forgotPassword(email);
    // Muestra mensaje de éxito
  } catch (err) {
    setError(err.message);
  }
};
```

### 2. Backend Envía Email con Token

```
POST /auth/forgot-password
{
  "email": "usuario@muni.com"
}

→ 200 OK
{
  "message": "Se ha enviado un correo con instrucciones"
}
```

### 3. Usuario Hace Clic en Link

```
https://app.muni.com/admin/reset-password?token=abc123xyz
```

### 4. Usuario Ingresa Nueva Contraseña

```jsx
// ResetPasswordPage.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  const token = new URLSearchParams(location.search).get('token');
  
  try {
    await resetPassword(token, newPassword);
    navigate('/login');
  } catch (err) {
    setError('Token inválido o expirado');
  }
};
```

### 5. Backend Valida Token y Actualiza

```
POST /auth/reset-password
{
  "token": "abc123xyz",
  "newPassword": "newSecret123"
}

→ 200 OK
{
  "message": "Contraseña actualizada correctamente"
}
```

---

## 📊 Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE AUTENTICACIÓN                    │
└─────────────────────────────────────────────────────────────┘

1. LOGIN
   Usuario → LoginPage
      ↓
   useAuth.login(email, password)
      ↓
   authService.login() → POST /auth/login
      ↓
   Backend valida → Devuelve JWT
      ↓
   localStorage.setItem('token', jwt)
      ↓
   decodeJWT() → setUser(payload)
      ↓
   Navigate to /admin/dashboard

2. REQUEST AUTENTICADO
   Componente → Hook (useInspections)
      ↓
   Service (inspectionsService)
      ↓
   const token = localStorage.getItem('token')
      ↓
   fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      ↓
   Backend valida JWT
      ↓
   Devuelve datos

3. TOKEN EXPIRADO
   Backend devuelve 401
      ↓
   Service detecta: if (res.status === 401)
      ↓
   handleTokenExpired()
      ↓
   SweetAlert: "Sesión expirada"
      ↓
   localStorage.removeItem('token')
      ↓
   window.location.href = '/login'

4. LOGOUT MANUAL
   Usuario hace clic en "Cerrar Sesión"
      ↓
   handleManualLogout() → isManualLogout = true
      ↓
   localStorage.removeItem('token')
      ↓
   setUser(null)
      ↓
   Navigate to /login

5. VERIFICACIÓN PERIÓDICA
   TokenExpirationChecker ejecuta cada 30s
      ↓
   hasValidSession()
      ↓
   Si expirado → handleTokenExpired()
```

---

## 🧪 Testing del Sistema de Auth

### Casos de Prueba

1. **Login exitoso**
   - Input: email y password válidos
   - Output: Token en localStorage, redirección a dashboard

2. **Login fallido**
   - Input: credenciales incorrectas
   - Output: Mensaje de error, no se guarda token

3. **Acceso a ruta protegida sin token**
   - Input: Navegar a `/admin/users` sin token
   - Output: Redirección a `/login`

4. **Acceso con rol incorrecto**
   - Input: Inspector intenta acceder a `/admin/users`
   - Output: Redirección a `/admin/dashboard`

5. **Token expirado en request**
   - Input: Token expirado al hacer fetch
   - Output: Alert "Sesión expirada", redirección a login

6. **Logout manual**
   - Input: Click en "Cerrar Sesión"
   - Output: Token eliminado, sin alert, redirección a login

---

## 📚 Archivos Relacionados

| Archivo | Propósito |
|---------|-----------|
| `src/hooks/useAuth.jsx` | Context + Hook de autenticación |
| `src/services/authService.js` | API calls de auth |
| `src/components/RequireAuth.jsx` | HOC para rutas protegidas |
| `src/components/RequireRole.jsx` | HOC para control de roles |
| `src/components/TokenExpirationChecker.jsx` | Verificación periódica |
| `src/utils/auth-helpers.js` | Helpers de validación y manejo |
| `src/components/auth/LoginPage.jsx` | Página de login |
| `src/pages/ForgotPasswordPage.jsx` | Solicitud de reset |
| `src/pages/ResetPasswordPage.jsx` | Reset de contraseña |
| `src/App.jsx` | Configuración de rutas |

---

## 🚀 Mejoras Futuras

1. **Refresh Tokens**: Renovar token sin re-login
2. **HttpOnly Cookies**: Más seguro que localStorage
3. **2FA (Two-Factor Auth)**: Doble autenticación
4. **Rate Limiting**: Prevenir ataques de fuerza bruta
5. **Session Management**: Ver sesiones activas
6. **Remember Me**: Persistencia configurable

---

**Documento actualizado**: ${new Date().toLocaleDateString('es-CR')}
**Autor**: Sistema de Inspecciones Municipales - Santa Cruz
