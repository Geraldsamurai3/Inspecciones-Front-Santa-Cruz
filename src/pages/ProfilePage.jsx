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
import { useProfile } from '../services/useProfile'

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 flex items-center space-x-6">
          <User className="h-12 w-12 text-white" />
          <div>
            <h1 className="text-3xl font-semibold text-white">Mi Perfil</h1>
            <p className="text-indigo-100 mt-1">
              {firstName} {lastName} {secondLastName || ''}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="flex items-center space-x-4">
            <Mail className="h-6 w-6 text-gray-400" />
            <span className="text-gray-800 break-all">{email}</span>
          </div>
          <div className="flex items-center space-x-4">
            <CreditCard className="h-6 w-6 text-gray-400" />
            <span className="text-gray-800">Cédula: {cedula}</span>
          </div>
          <div className="flex items-center space-x-4">
            <Smartphone className="h-6 w-6 text-gray-400" />
            <span className="text-gray-800">Teléfono: {phone || '-'}</span>
          </div>
          <div className="flex items-center space-x-4">
            <Award className="h-6 w-6 text-gray-400" />
            <span className="text-gray-800 capitalize">Rol: {role}</span>
          </div>
          <div className="flex items-center space-x-4">
            <Lock className="h-6 w-6 text-gray-400" />
            <span className="text-gray-800">
              Estado: {isBlocked ? 'Bloqueado' : 'Activo'}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Calendar className="h-6 w-6 text-gray-400" />
            <span className="text-gray-800">
              Creado: {new Date(createdAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Reset Password Button */}
        <div className="p-8 border-t border-gray-100">
          <button
            onClick={() => navigate('/admin/forgot-password')}
            className="w-full flex items-center justify-center space-x-3 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold rounded-lg transition"
          >
            <Key className="h-6 w-6" />
            <span>Restablecer contraseña</span>
          </button>
        </div>
      </div>
    </div>
  )
}
