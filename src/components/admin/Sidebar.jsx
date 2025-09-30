// src/AdministrativePage/components/Sidebar.jsx
"use client"

import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
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
  ChevronDown,
  ChevronRight,
  Plus,
  List,
  BarChart3,
} from 'lucide-react'

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const [inspectionsOpen, setInspectionsOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const role = (user?.role || user?.rol || '').toString().trim().toLowerCase()

  // Mantener abierto el desplegable si estamos en una página de inspecciones
  useEffect(() => {
    const inspectionRoutes = ['/admin/inspectionsform', '/admin/inspections', '/admin/inspections-management']
    if (inspectionRoutes.some(route => location.pathname === route)) {
      setInspectionsOpen(true)
    }
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  const allItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <Home size={20}/>, roles: ['admin','inspector'] },
    { 
      to: null, 
      label: 'Inspecciones-Trámite', 
      icon: <ClipboardList size={20}/>, 
      roles: ['admin','inspector'],
      isDropdown: true,
      subItems: [
        { to: '/admin/inspectionsform', label: 'Nuevo Trámite', icon: <Plus size={18}/>, roles: ['admin','inspector'] },
        { to: '/admin/inspections-management', label: 'Gestión de Trámites', icon: <List size={18}/>, roles: ['admin'] },
      ]
    },
    { to: '/admin/stats', label: 'Estadísticas', icon: <BarChart3 size={20}/>, roles: ['admin'] },
    { to: '/admin/users', label: 'Usuarios', icon: <Users size={20}/>, roles: ['admin'] },
    { to: '/admin/settings', label: 'Ajustes', icon: <Settings size={20}/>, roles: ['admin'] },
  ]
  const menuItems = allItems.filter(item => {
    if (role === 'admin') return true
    if (role === 'inspector') {
      if (item.isDropdown) {
        // Para dropdowns, filtramos los subelementos
        const filteredSubItems = item.subItems?.filter(subItem => 
          subItem.roles?.includes('inspector')
        )
        return filteredSubItems && filteredSubItems.length > 0
      }
      return item.roles?.includes('inspector')
    }
    // por defecto, mostrar solo lo mínimo para inspectores
    return item.roles?.includes('inspector')
  }).map(item => {
    if (item.isDropdown && role !== 'admin') {
      // Para inspectores, filtrar subelementos
      return {
        ...item,
        subItems: item.subItems?.filter(subItem => 
          subItem.roles?.includes('inspector')
        )
      }
    }
    return item
  })

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
          {menuItems.map((item) => {
            if (item.isDropdown) {
              return (
                <div key={item.label}>
                  {/* Elemento principal del dropdown */}
                  <button
                    onClick={() => setInspectionsOpen(!inspectionsOpen)}
                    className="w-full flex items-center justify-between px-4 py-2 space-x-3 hover:bg-gray-100 transition-colors text-gray-700"
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {inspectionsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {/* Subelementos */}
                  {inspectionsOpen && (
                    <div className="ml-4 border-l border-gray-200">
                      {item.subItems?.map((subItem) => (
                        <NavLink
                          key={subItem.to}
                          to={subItem.to}
                          className={({ isActive }) =>
                            `flex items-center pl-6 pr-4 py-2 space-x-3 hover:bg-gray-100 transition-colors
                             ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`
                          }
                          onClick={() => setOpen(false)}
                        >
                          {subItem.icon}
                          <span className="font-medium text-sm">{subItem.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )
            } else {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 space-x-3 hover:bg-gray-100 transition-colors
                     ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`
                  }
                  onClick={() => setOpen(false)}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              )
            }
          })}
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
