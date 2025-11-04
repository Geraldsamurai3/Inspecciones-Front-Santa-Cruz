# Fix de Seguridad: Bypass de Autenticación en Password Reset

## 🔴 Vulnerabilidad Identificada

**Severidad:** CRÍTICA  
**Fecha:** 20 de octubre de 2025  
**Tipo:** Bypass de autenticación mediante flujo de recuperación de contraseña

### Descripción del Problema

Se detectó una vulnerabilidad que permitía acceder al sistema administrativo sin autenticación válida a través del flujo de "Olvidé mi contraseña":

1. Usuario accede a `/admin/forgot-password`
2. Ingresa su email y solicita recuperación
3. El backend (incorrectamente) retorna un `access_token` en la respuesta
4. El frontend guarda este token en `localStorage`
5. Usuario puede acceder directamente a `/admin/dashboard` sin completar el reset

**Impacto:** Acceso no autorizado al sistema administrativo

---

## ✅ Solución Implementada

### 1. **ForgotPasswordPage.jsx** - Prevención en Frontend
```javascript
// Limpiar token antes de solicitar reset
localStorage.removeItem('token')

await forgotPassword(email)

// Verificar que no se haya guardado token por error
const suspiciousToken = localStorage.getItem('token')
if (suspiciousToken) {
  console.error('SEGURIDAD: Token detectado después de forgot-password, removiendo...')
  localStorage.removeItem('token')
}
```

### 2. **ResetPasswordPage.jsx** - Prevención en Reset
```javascript
// Limpiar token antes de resetear
localStorage.removeItem('token')

await resetPassword(token, password)

// Verificar que no se haya guardado access_token por error
const suspiciousToken = localStorage.getItem('token')
if (suspiciousToken) {
  console.error('SEGURIDAD: Token de acceso detectado después de reset-password, removiendo...')
  localStorage.removeItem('token')
}
```

### 3. **usersService.js** - Sanitización de Respuestas
```javascript
// Forgot Password - NO debe retornar access_token
forgotPassword: async (email) => {
  const response = await request('/users/forgot-password', { method: 'POST', body: { email } });
  
  if (response && response.access_token) {
    console.error('ALERTA DE SEGURIDAD: Backend envió access_token en forgot-password');
    delete response.access_token;
    localStorage.removeItem('token');
  }
  
  return response;
}

// Reset Password - NO debe retornar access_token
resetPassword: async (token, newPassword) => {
  const response = await request('/users/reset-password', { method: 'POST', body: { token, newPassword } });
  
  if (response && response.access_token) {
    console.error('ALERTA DE SEGURIDAD: Backend envió access_token en reset-password');
    delete response.access_token;
    localStorage.removeItem('token');
  }
  
  return response;
}
```

### 4. **ProtectedRoute.jsx** - Validación de Token
```javascript
useEffect(() => {
  const token = localStorage.getItem('token')
  if (token && user) {
    try {
      const [, payload] = token.split('.')
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      const decoded = JSON.parse(json)
      
      // Verificar que sea un token de autenticación válido
      if (!decoded.email || !decoded.role || !decoded.sub) {
        console.error('SEGURIDAD: Token inválido (posiblemente token de reset)')
        logout()
        navigate('/admin/login', { replace: true })
        return
      }
      
      // Verificar expiración
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        console.error('SEGURIDAD: Token expirado')
        logout()
        navigate('/admin/login', { replace: true })
        return
      }
    } catch (error) {
      console.error('SEGURIDAD: Error al validar token', error)
      logout()
      navigate('/admin/login', { replace: true })
    }
  }
}, [user, logout, navigate])
```

---

## 🛡️ Capas de Protección Implementadas

### Capa 1: Limpieza Proactiva
- Se elimina cualquier token previo antes de iniciar flujo de reset
- Se elimina cualquier token después de completar el reset

### Capa 2: Sanitización de Respuestas
- Se verifica que las respuestas de forgot/reset NO contengan `access_token`
- Si se detecta, se elimina y se registra en consola

### Capa 3: Validación de Token en Rutas Protegidas
- Se valida estructura del token (debe tener email, role, sub)
- Se valida expiración del token
- Se expulsa automáticamente si el token no es válido

### Capa 4: Logging de Seguridad
- Todos los intentos sospechosos se registran en consola
- Facilita auditoría y detección de ataques

---

## 🔍 Cómo Probar el Fix

### Escenario 1: Flujo Normal (debe funcionar)
1. Ir a `/admin/login`
2. Click en "¿Olvidaste tu contraseña?"
3. Ingresar email válido
4. Recibir mensaje de éxito
5. Ir al link del correo electrónico
6. Ingresar nueva contraseña
7. Recibir confirmación
8. Volver a login
9. Iniciar sesión con nueva contraseña ✅

### Escenario 2: Intento de Bypass (debe fallar)
1. Ir a `/admin/forgot-password`
2. Ingresar email
3. Inspeccionar localStorage → NO debe haber `token`
4. Intentar acceder a `/admin/dashboard` → Debe redirigir a login ❌
5. Verificar consola → Debe mostrar logs de seguridad

### Escenario 3: Token de Reset Inválido (debe fallar)
1. Obtener token de reset
2. Guardar manualmente en localStorage como si fuera access_token
3. Intentar acceder a `/admin/dashboard`
4. Debe detectar token inválido y expulsar al login ❌

---

## 📋 Recomendaciones Adicionales para Backend

### ⚠️ CRÍTICO: Backend NO debe enviar access_token en:
- `POST /users/forgot-password` 
  - ✅ Debe retornar: `{ message: "Email sent" }`
  - ❌ NO debe retornar: `{ access_token: "..." }`

- `POST /users/reset-password`
  - ✅ Debe retornar: `{ message: "Password reset successful" }`
  - ❌ NO debe retornar: `{ access_token: "..." }`

### Tokens Separados
- **Reset Token**: Solo para resetear contraseña, vida corta (15-30 min)
- **Access Token**: Solo para autenticación, vida configurable

### Validación Backend
- Reset token NO debe permitir acceso a endpoints protegidos
- Reset token debe ser de un solo uso (invalidar después de usar)
- Reset token debe tener claims diferentes (ej: `type: "reset"`)

---

## 📊 Estado de Seguridad

| Componente | Estado | Observaciones |
|------------|--------|---------------|
| ForgotPasswordPage | ✅ Seguro | Limpia tokens, verifica respuestas |
| ResetPasswordPage | ✅ Seguro | Limpia tokens, verifica respuestas |
| usersService | ✅ Seguro | Sanitiza respuestas del backend |
| ProtectedRoute | ✅ Seguro | Valida estructura y expiración |
| Backend | ⚠️ Verificar | Asegurar que NO envíe access_token |

---

## 🔐 Checklist de Seguridad

- [x] Frontend limpia tokens antes de forgot/reset
- [x] Frontend verifica respuestas del backend
- [x] Frontend valida estructura de tokens
- [x] Frontend valida expiración de tokens
- [x] Logging de intentos sospechosos
- [ ] Backend NO envía access_token en forgot-password
- [ ] Backend NO envía access_token en reset-password
- [ ] Backend invalida reset tokens después de uso
- [ ] Backend separa claims de reset vs auth tokens

---

## 📝 Conclusión

El fix implementado en frontend agrega **4 capas de protección** contra el bypass de autenticación. Sin embargo, es **CRÍTICO** que el backend también se corrija para no enviar `access_token` en las respuestas de forgot/reset password.

**Prioridad Backend:** 🔴 URGENTE
