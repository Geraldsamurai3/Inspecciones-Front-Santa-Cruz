// src/AdministrativePage/components/Sidebar.jsx
"use client"

import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  Menu,
  X,
  Home,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  User,
  FileText,
} from 'lucide-react'

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  const menuItems = [
    { to: '/admin/dashboard',   label: 'Dashboard',    icon: <Home size={20}/> },
    { to: '/admin/inspections', label: 'Inspecciones', icon: <ClipboardList size={20}/> },
    { to: '/admin/inspections-management', label: 'Gestión de Trámites', icon: <FileText size={20}/> },
    { to: '/admin/users',        label: 'Usuarios',     icon: <Users size={20}/> },
    { to: '/admin/settings',     label: 'Ajustes',      icon: <Settings size={20}/> },
    { to: '/admin/inspectionsform', label: 'Formulario Inspecciones', icon: <ClipboardList size={20}/> },
  ]

  return (
    <>
      {/* Botón móvil para abrir */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded shadow"
        onClick={() => setOpen(true)}
      >
        <Menu size={24}/>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 bg-white border-r border-gray-200 shadow-lg
          transform transition-transform duration-300 z-50
          ${open ? 'translate-x-0' : '-translate-x-full'}
          w-full md:w-64 md:translate-x-0 md:static flex flex-col
        `}
      >
        {/* Botón móvil para cerrar */}
        <div className="md:hidden flex justify-end p-2">
          <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100">
            <X size={24}/>
          </button>
        </div>

        {/* Logo y título */}
        <div className="flex flex-col items-center p-4 space-y-2">
          <img
            src="https://res.cloudinary.com/da84etlav/image/upload/v1753883605/ChatGPT_Image_30_jul_2025_07_53_06_a.m._w1pd0i.png"
            alt="Logo Municipalidad Santa Cruz"
            className="h-28 w-28 rounded-full bg-white p-1 object-contain"
          />
          <h2 className="text-lg font-bold text-center">Municipalidad Santa Cruz</h2>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
            Departamento de Inspecciones
          </span>
        </div>

        {/* Navegación */}
        <nav className="mt-4 flex-1 overflow-y-auto">
          {menuItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 space-x-3 hover:bg-gray-100 transition-colors
                 ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`
              }
              onClick={() => setOpen(false)}
            >
              {icon}
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Perfil y cierre */}
        <div className="p-4 border-t border-gray-200">
          {user && (
            <button
              onClick={() => { navigate('/admin/profile'); setOpen(false) }}
              className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 rounded hover:bg-gray-100 mb-2"
            >
              <User size={20}/>
              <span>Perfil</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 rounded hover:bg-red-50"
          >
            <LogOut size={20}/>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}
