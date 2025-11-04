// src/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token          = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);
  const [showCfm,  setShowCfm]  = useState(false);
  const navigate = useNavigate();
  const { resetPassword } = useUsers({ skipFetchOnMount: true });

  useEffect(() => {
    if (!token) {
      Swal.fire({ icon: 'error', title: 'Token inválido' });
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  const validate = () => {
    const e = {};
    const pwdRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!pwdRegex.test(password)) {
      e.password = 'Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo';
    }
    if (confirm !== password) {
      e.confirm = 'Las contraseñas no coinciden';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Asegurar que no hay token de sesión previo
      localStorage.removeItem('token');
      
      await resetPassword(token, password);
      
      // CRÍTICO: Verificar que no se haya guardado un access_token por error
      const suspiciousToken = localStorage.getItem('token');
      if (suspiciousToken) {
        console.error('SEGURIDAD: Token de acceso detectado después de reset-password, removiendo...');
        localStorage.removeItem('token');
      }
      
      await Swal.fire({
        icon: 'success',
        title: 'Contraseña restablecida',
        text: 'Ya puedes iniciar sesión con tu nueva contraseña.',
      });
      navigate('/login', { replace: true });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.message || 'Token inválido o expirado.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Nueva contraseña</h2>
          <p className="text-sm text-gray-500 text-center">
            Debe tener ≥8 caracteres, 1 mayúscula, 1 número y 1 símbolo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Contraseña */}
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.password
                  ? 'border-red-500 focus:ring-red-300'
                  : 'border-gray-300 focus:ring-blue-500'
              } transition`}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {showPwd ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
            </button>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Campo Confirmar Contraseña */}
          <div className="relative">
            <input
              type={showCfm ? 'text' : 'password'}
              placeholder="Confirmar contraseña"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.confirm
                  ? 'border-red-500 focus:ring-red-300'
                  : 'border-gray-300 focus:ring-blue-500'
              } transition`}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowCfm(v => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {showCfm ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
            </button>
            {errors.confirm && (
              <p className="mt-1 text-xs text-red-600">{errors.confirm}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Procesando…' : 'Restablecer contraseña'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-3 mt-4 text-blue-600 font-medium rounded-lg border border-blue-600 hover:bg-blue-50 transition"
            disabled={loading}
          >
            Volver al login
          </button>
        </form>
      </div>
    </div>
  );
}
