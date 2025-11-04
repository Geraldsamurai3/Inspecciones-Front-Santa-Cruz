import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Mail } from 'lucide-react'
import { useUsers } from '../hooks/useUsers'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate              = useNavigate()
  const { forgotPassword }    = useUsers()

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      // Asegurar que no hay token previo que pueda causar confusión
      localStorage.removeItem('token')
      
      await forgotPassword(email)
      
      // Verificar que no se haya guardado un token de acceso por error
      const suspiciousToken = localStorage.getItem('token')
      if (suspiciousToken) {
        console.error('SEGURIDAD: Token detectado después de forgot-password, removiendo...')
        localStorage.removeItem('token')
      }
      
      await Swal.fire({
        icon: 'success',
        title: '¡Correo enviado!',
        text: 'Revisa tu bandeja para restablecer tu contraseña.',
      })
      navigate('/login', { replace: true })
    } catch (err) {
      Swal.fire({ icon:'error', title:'Error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Recupera tu contraseña
          </h2>
          <p className="text-sm text-gray-500 text-center">
            Introduce tu correo y te enviaremos un enlace para restablecerla.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="relative mb-6">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              required
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar correo'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-3 mt-4 text-blue-600 font-medium rounded-lg border border-blue-600 hover:bg-blue-50 transition"
          >
            Volver al login
          </button>
        </form>
      </div>
    </div>
  )
}
