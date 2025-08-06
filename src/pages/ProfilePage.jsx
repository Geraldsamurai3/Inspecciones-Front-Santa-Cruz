// src/pages/ProfilePage.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  CreditCard,
  Smartphone,
  Award,
  Lock,
  Calendar,
  Key,
} from 'lucide-react'
import { useProfile } from '../hooks/useProfile'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { profile, loading, error } = useProfile()

  if (loading) return <p className="p-6 text-center">Cargando perfil…</p>
  if (error)   return <p className="p-6 text-center text-red-600">{error.message}</p>

  const {
    firstName,
    lastName,
    secondLastName,
    email,
    cedula,
    phone,
    role,
    isBlocked,
    createdAt,
  } = profile

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow">
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 flex items-center space-x-6">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
            <User className="h-10 w-10 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              {firstName} {lastName} {secondLastName}
            </h1>
            <p className="text-indigo-200 mt-1 text-lg">Mi Perfil</p>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { icon: Mail, label: email },
            { icon: CreditCard, label: `Cédula: ${cedula}` },
            { icon: Smartphone, label: `Teléfono: ${phone || '-'}` },
            { icon: Award, label: `Rol: ${role}` },
            { icon: Lock, label: `Estado: ${isBlocked ? 'Bloqueado' : 'Activo'}` },
            {
              icon: Calendar,
              label: `Creado: ${new Date(createdAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}`,
            },
          ].map(({ icon: Icon, label }, i) => (
            <div
              key={i}
              className="flex items-center space-x-4 bg-indigo-50 rounded-xl p-4 hover:bg-indigo-100 transition-colors"
            >
              <Icon className="h-6 w-6 text-indigo-600" />
              <span className="text-gray-700 font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Botón */}
        <div className="p-8 border-t border-gray-100">
          <button
            onClick={() => navigate('/admin/forgot-password')}
            className="w-full flex items-center justify-center space-x-3 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold rounded-xl shadow-md transition"
          >
            <Key className="h-6 w-6" />
            <span>Restablecer contraseña</span>
          </button>
        </div>
      </div>
    </div>
  )
}
