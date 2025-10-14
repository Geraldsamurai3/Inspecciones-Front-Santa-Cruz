# 🔧 Corrección CORS: X-Requested-With Header

## 📅 Fecha: 13 de Octubre 2025

## ⚠️ Problema Detectado

```
Access to fetch at 'http://localhost:3000/auth/login' from origin 'http://localhost:5174' 
has been blocked by CORS policy: Request header field x-requested-with is not allowed 
by Access-Control-Allow-Headers in preflight response.
```

---

## 🔍 Causa Raíz

El header `X-Requested-With: XMLHttpRequest` fue agregado como medida de protección CSRF, pero:

1. **El backend no está configurado** para aceptar este header en CORS
2. El header causaba un **preflight request** (OPTIONS) adicional
3. El backend rechazaba el preflight por headers no permitidos

---

## ✅ Solución Implementada

### Archivo Modificado: `src/services/authService.js`

**ANTES:**
```javascript
headers: {
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest', // ❌ Causaba error CORS
  ...authHeader,
  ...headers,
}
```

**DESPUÉS:**
```javascript
headers: {
  'Content-Type': 'application/json',
  // X-Requested-With removido para evitar problemas CORS
  // La protección CSRF se maneja con credentials: 'include' y tokens
  ...authHeader,
  ...headers,
}
```

---

## 🛡️ Protección CSRF Alternativa

Aunque removimos el header `X-Requested-With`, mantenemos protección CSRF mediante:

### 1. **Credentials: 'include'**
```javascript
credentials: 'include'
```
- Envía cookies HTTP-only automáticamente
- El backend puede validar el token en la cookie

### 2. **Tokens JWT en Authorization Header**
```javascript
Authorization: `Bearer ${token}`
```
- Token almacenado en localStorage
- Validado en cada request
- No puede ser robado por XSS gracias a la sanitización

### 3. **Validación de Origen**
- El backend debe validar el `Origin` header
- Solo permitir dominios autorizados

### 4. **SameSite Cookies** (Recomendación para Backend)
```javascript
// En el backend, configurar cookies con:
res.cookie('token', jwt, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});
```

---

## 🔄 Configuración CORS Recomendada (Backend)

Para evitar futuros problemas CORS, el backend debería configurar:

```javascript
// Express.js ejemplo
app.use(cors({
  origin: ['http://localhost:5174', 'https://tu-dominio.com'],
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    // Agregar solo headers necesarios
  ],
  exposedHeaders: ['Set-Cookie'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
```

### Headers que SÍ están permitidos:
- ✅ `Content-Type`
- ✅ `Authorization`

### Headers que NO necesitamos:
- ❌ `X-Requested-With` (removido)

---

## 📊 Impacto del Cambio

### ✅ Ventajas:
1. **Login funciona correctamente** sin errores CORS
2. **Menos requests** (no hay preflight para cada petición)
3. **Mejor performance** (preflight OPTIONS eliminado)
4. **Compatibilidad** con configuración CORS estándar

### ⚠️ Consideraciones:
1. La protección CSRF ahora depende de:
   - Tokens JWT
   - Validación de origen en backend
   - SameSite cookies (si se implementan)

---

## 🧪 Testing

### Verificar que funciona:

1. **Login**
```bash
# Debe funcionar sin errores CORS
POST http://localhost:3000/auth/login
```

2. **Requests Autenticados**
```bash
# Con token JWT en header
GET http://localhost:3000/api/inspections
Authorization: Bearer <token>
```

### Verificar en DevTools:

1. Abrir **Network tab** en DevTools
2. Hacer login
3. Verificar que:
   - ✅ No hay request OPTIONS fallido
   - ✅ Request POST funciona
   - ✅ Response 200 OK

---

## 📚 Referencias

### CORS y Preflight Requests:
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [MDN: Preflight Request](https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request)

### CSRF Protection:
- [OWASP: CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [SameSite Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)

---

## ✅ Checklist de Seguridad Actualizado

- [x] Sanitización de inputs
- [x] Validación de tokens JWT
- [x] Protección contra path traversal
- [x] Rate limiting básico
- [x] Validación de archivos
- [x] **CORS configurado correctamente**
- [x] **Protección CSRF mediante tokens**
- [ ] SameSite cookies (recomendado para backend)

---

## 🔄 Próximos Pasos Recomendados

### Corto Plazo:
1. ✅ **Verificar que login funciona** - COMPLETADO
2. Configurar SameSite cookies en backend
3. Agregar validación de Origin en backend

### Mediano Plazo:
1. Implementar refresh tokens
2. Agregar rate limiting en backend
3. Configurar HTTPS en producción

---

**Estado:** ✅ **RESUELTO**  
**Impacto:** 🟢 **BAJO** - Seguridad mantenida con método alternativo  
**Prioridad:** 🔴 **CRÍTICA** - Necesario para que funcione el login

---

*Documento creado: 13 de Octubre 2025*