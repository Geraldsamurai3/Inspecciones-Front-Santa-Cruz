// src/pages/ProfilePage.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, CreditCard, Smartphone, Lock, Calendar, Key, ShieldCheck } from 'lucide-react'
import { useProfile } from '../hooks/useProfile'

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return '-'
  }
}

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

  const fullName = `${firstName ?? ''} ${lastName ?? ''} ${secondLastName ?? ''}`.trim()
  const memberSince = createdAt ? new Date(createdAt) : null
  const memberBadge = memberSince
    ? `Miembro desde ${memberSince.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
    : 'Miembro'

  // Iniciales para el avatar (Nombre + Apellido)
  const initials = `${(firstName?.[0] ?? '').toUpperCase()}${(lastName?.[0] ?? '').toUpperCase()}` || 'U'

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 md:px-8 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Mi Perfil</h1>
          <p className="text-slate-500">Gestiona tu información personal y configuración de cuenta</p>
        </div>

        {/* Hero / identity card */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-6 p-6 md:p-8">
            <div className="relative">
              {/* Gradient ring avatar */}
              <div className="p-[3px] rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 shadow-sm">
                <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center">
                  <span className="select-none text-indigo-700 font-semibold text-2xl tracking-wide">{initials}</span>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                <div>
                  <h2 className="text-[22px] md:text-[26px] font-semibold text-slate-900 leading-tight">{fullName || 'Usuario'}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {memberSince && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-semibold border border-blue-200 shadow-sm whitespace-nowrap">
                        {memberBadge}
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-700">
                      {role || 'Usuario'}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium ${isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {isBlocked ? 'Bloqueado' : 'Activo'}
                    </span>
                  </div>
                </div>
                <div className="md:ml-auto flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 transition shadow-sm"
                  >
                    Editar perfil
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/forgot-password')}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-md hover:from-blue-500 hover:to-indigo-500 transition"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Seguridad
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: About card */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
              <h3 className="text-sm font-semibold text-slate-900">Resumen</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Información clave de tu cuenta.
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[{label:'Rol', value: role || '-', color:'from-blue-500 to-indigo-500'},
                  {label:'Estado', value: isBlocked ? 'Bloqueado' : 'Activo', color: isBlocked ? 'from-rose-500 to-red-500' : 'from-emerald-500 to-teal-500'},
                  {label:'Miembro desde', value: formatDate(createdAt), color:'from-indigo-500 to-purple-500'},
                  {label:'Identificación', value: cedula || '-', color:'from-amber-500 to-yellow-500'},
                ].map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 p-4 bg-white shadow-sm hover:shadow transition flex flex-col">
                    <div className={`h-1.5 w-10 rounded-full bg-gradient-to-r ${item.color} mb-3`}></div>
                    <p className="text-[11px] text-slate-500 leading-none">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Info + Security */}
          <div className="lg:col-span-8 space-y-6">
            {/* Información personal */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-md">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Información Personal</h3>
                  <p className="text-xs text-slate-500">Tus datos de contacto y básicos</p>
                </div>
                <button
                  type="button"
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm"
                >
                  Editar
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-4">
                  {[{
                      key: 'email', icon: Mail, label: 'Email', value: email || '-', span: 'xl:col-span-6 sm:col-span-2 col-span-1'
                    },{
                      key: 'phone', icon: Smartphone, label: 'Teléfono', value: phone || '-', span: 'xl:col-span-3 sm:col-span-1 col-span-1'
                    },{
                      key: 'cedula', icon: CreditCard, label: 'Cédula', value: cedula || '-', span: 'xl:col-span-3 sm:col-span-1 col-span-1'
                    },{
                      key: 'member', icon: Calendar, label: 'Miembro desde', value: formatDate(createdAt), span: 'xl:col-span-3 sm:col-span-1 col-span-1'
                    }]
                    .map(({ key, icon: Icon, label, value, span }) => (
                    <div key={key} className={`${span} flex items-start gap-3 rounded-xl border border-slate-200 p-4 bg-white shadow-sm hover:shadow transition`}>
                      <div className="rounded-md bg-slate-100 p-2 shrink-0">
                        <Icon className="h-4 w-4 text-slate-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">{label}</p>
                        <p className={`text-sm font-medium text-slate-800 ${key==='email' ? 'break-all' : 'break-words'}`}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Seguridad */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-md">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Configuración de Seguridad</h3>
                  <p className="text-xs text-slate-500">Gestión de tu contraseña y acceso</p>
                </div>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl border border-slate-200 p-4 bg-white shadow-sm hover:shadow transition">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-slate-100 p-2">
                      <Lock className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Contraseña</p>
                      <p className="text-xs text-slate-500">Última actualización {createdAt ? 'reciente' : '—'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/admin/forgot-password')}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-md hover:from-blue-500 hover:to-indigo-500 transition"
                  >
                    <Key className="h-4 w-4" />
                    Cambiar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
