// src/pages/UsersPage.jsx
"use client"

import React, { useState, useMemo } from "react"
import Swal from "sweetalert2"
import {
  Plus,
  Users as UsersIcon,
  UserCheck,
  Shield,
  Edit2,
  Trash2,
  Search as SearchIcon,
} from "lucide-react"
import { useUsers } from "../hooks/useUsers"
import { useAuth } from "../hooks/useAuth"
import UserForm from "../components/users/UserForm"
import EditUserForm from "../components/users/EditUserForm" // <--- tu nuevo componente

// ——— UI Primitives ———
const Container = ({ children }) => (
  <div className="p-4 sm:p-6 bg-gray-50 min-h-screen space-y-6">{children}</div>
)

const Header = ({ onNew }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
      <p className="text-gray-600">Administrar usuarios del sistema de inspecciones</p>
    </div>
    <button
      onClick={onNew}
      className="mt-2 sm:mt-0 inline-flex items-center bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700"
    >
      <Plus className="h-5 w-5 mr-2" /> Nuevo Usuario
    </button>
  </div>
)

const StatsGrid = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {stats.map(s => (
      <div
        key={s.label}
        className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm"
      >
        <div>
          <p className="text-sm text-gray-500">{s.label}</p>
          <p className="text-xl md:text-2xl font-semibold text-gray-800">{s.value}</p>
        </div>
        <s.icon className={`h-6 w-6 ${s.color}`} />
      </div>
    ))}
  </div>
)

const FilterBar = ({ search, onSearch, role, onRole, roles }) => (
  <div className="bg-white rounded-lg p-4 flex flex-col md:flex-row items-stretch md:items-center gap-4 shadow-sm">
    <div className="relative flex-1 w-full">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Buscar por nombre, usuario, email o cédula…"
        value={search}
        onChange={e => onSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <select
      value={role}
      onChange={e => onRole(e.target.value)}
      className="w-full md:w-60 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {roles.map(r => (
        <option key={r} value={r}>
          {r === "Todos" ? "Todos los roles" : r}
        </option>
      ))}
    </select>
  </div>
)

const ListHeader = ({ count }) => (
  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
    Lista de Usuarios ({count})
  </h2>
)

const UserItem = ({ u, onToggle, onDelete, formatDate, onEdit }) => {
  const roleRaw = u.role ?? u.rol ?? "Inspector"
  const role = roleRaw.charAt(0).toUpperCase() + roleRaw.slice(1).toLowerCase()
  const isBlocked = !!u.isBlocked

  const handleToggle = async () => {
    await onToggle(u.id)
    await Swal.fire({
      icon: "success",
      title: isBlocked ? "Usuario activado" : "Usuario suspendido",
      timer: 1200,
      showConfirmButton: false,
    })
  }

  const handleDelete = async () => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Eliminar usuario?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
    })
    if (!isConfirmed) return
    await onDelete(u.id)
    await Swal.fire({
      icon: "success",
      title: "Usuario eliminado",
      timer: 1200,
      showConfirmButton: false,
    })
  }

  return (
    <div className="bg-white rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center border border-gray-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 flex-1 w-full">
        <div
          className={`w-10 h-10 rounded-full ${
            role === "Admin" ? "bg-blue-100" : "bg-purple-100"
          } flex items-center justify-center flex-shrink-0`}
        >
          {role === "Admin" ? (
            <Shield className="h-5 w-5 text-blue-500" />
          ) : (
            <UsersIcon className="h-5 w-5 text-purple-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {u.firstName} {u.lastName} {u.secondLastName}
          </p>
          <p className="text-sm text-gray-500 truncate">
            • {u.email} • Cédula: {u.cedula} • Creado: {formatDate(u.createdAt)}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span
              className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                role === "Admin"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {role}
            </span>
            <span
              className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                isBlocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
              }`}
            >
              {isBlocked ? "Inactivo" : "Activo"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 md:mt-0 flex gap-2">
        <button
          onClick={handleToggle}
          className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-100"
        >
          {isBlocked ? "Activar" : "Desactivar"}
        </button>
        <button
          onClick={() => onEdit(u)}
          className="p-2 rounded text-gray-700 hover:bg-gray-100"
        >
          <Edit2 className="h-5 w-5" />
        </button>
        <button
          onClick={handleDelete}
          className="p-2 rounded text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const {
    users,
    loading,
    error,
    toggleBlockUser,
    deleteUser,
    updateUser,
  } = useUsers()
  const { register } = useAuth()

  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("Todos")
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  // Title-case roles
  const enriched = users
    .map(u => ({ ...u, roleRaw: (u.role ?? u.rol) || "Inspector" }))
    .map(u => ({
      ...u,
      role: u.roleRaw.charAt(0).toUpperCase() + u.roleRaw.slice(1).toLowerCase(),
    }))

  const roles = useMemo(() => ["Todos", ...new Set(enriched.map(u => u.role))], [enriched])

  const filtered = useMemo(
    () =>
      enriched.filter(u => {
        const txt = `${u.firstName} ${u.lastName} ${u.email} ${u.cedula}`.toLowerCase()
        return (
          (!search || txt.includes(search.toLowerCase())) &&
          (roleFilter === "Todos" || u.role === roleFilter)
        )
      }),
    [enriched, search, roleFilter]
  )

  const stats = [
    { label: "Total Usuarios", value: enriched.length, icon: UsersIcon, color: "text-gray-400" },
    {
      label: "Activos",
      value: enriched.filter(u => !u.isBlocked).length,
      icon: UserCheck,
      color: "text-green-500",
    },
    {
      label: "Administradores",
      value: enriched.filter(u => u.role === "Admin").length,
      icon: Shield,
      color: "text-blue-500",
    },
    {
      label: "Inspectores",
      value: enriched.filter(u => u.role === "Inspector").length,
      icon: UsersIcon,
      color: "text-purple-500",
    },
  ]

  const fmtDate = iso =>
    new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })

  const handleNew = () => {
    setEditing(null)
    setShowForm(true)
  }
  const handleEdit = u => {
    setEditing(u)
    setShowForm(true)
  }

  if (loading) return <p className="p-6 text-center">Cargando usuarios…</p>
  if (error) return <p className="p-6 text-center text-red-600">{error.message}</p>

  return (
    <Container>
      <Header onNew={handleNew} />

      <StatsGrid stats={stats} />
      <FilterBar
        search={search}
        onSearch={setSearch}
        role={roleFilter}
        onRole={setRoleFilter}
        roles={roles}
      />

      <ListHeader count={filtered.length} />
      <div className="space-y-2 mt-2">
        {filtered.map(u => (
          <UserItem
            key={u.id}
            u={u}
            onToggle={toggleBlockUser}
            onDelete={deleteUser}
            formatDate={fmtDate}
            onEdit={handleEdit}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">No se encontraron usuarios.</p>
        )}
      </div>

      {/* Modal Crear / Editar */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          {editing ? (
            <EditUserForm
              user={editing}
              onSubmit={async data => {
                await updateUser(editing.id, data)
                await Swal.fire({
                  icon: "success",
                  title: "Usuario actualizado",
                  timer: 1200,
                  showConfirmButton: false,
                })
                setShowForm(false)
                window.location.reload()
              }}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <UserForm
              onSubmit={async data => {
                await register(data)
                await Swal.fire({
                  icon: "success",
                  title: "Usuario creado",
                  timer: 1200,
                  showConfirmButton: false,
                })
                setShowForm(false)
                window.location.reload()
              }}
              onCancel={() => setShowForm(false)}
            />
          )}
        </div>
      )}
    </Container>
  )
}
