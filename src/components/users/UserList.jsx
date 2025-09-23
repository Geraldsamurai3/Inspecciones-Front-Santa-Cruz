import React, { Suspense } from "react"
import { Search } from "lucide-react"
const Pagination = React.lazy(() => import("@/components/ui/pagination"))

export default function UserList({
  users,
  roles, statuses,
  searchTerm, onSearch,
  filterRole, onFilterRole,
  filterStatus, onFilterStatus,
  currentPage, totalPages, onPageChange,
  onToggleBlock, onDelete,
}) {
  return (
    <div className="space-y-4">
      {/* filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={e => onSearch(e.target.value)}
            className="w-full pl-10 border rounded px-3 py-2"
          />
        </div>
        <select
          value={filterRole}
          onChange={e => onFilterRole(e.target.value)}
          className="border rounded px-3 py-2"
        >
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => onFilterStatus(e.target.value)}
          className="border rounded px-3 py-2"
        >
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* tabla */}
      <div className="overflow-x-auto bg-white border rounded shadow">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Rol</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2">{u.firstName} {u.lastName}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.role}</td>
                <td className="px-4 py-2">
                  {u.isBlocked ? "Suspendido" : "Activo"}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => onToggleBlock(u)}
                    className="px-2 py-1 text-sm border rounded"
                  >
                    {u.isBlocked ? "Activar" : "SUSPENDER"}
                  </button>
                  <button
                    onClick={() => onDelete(u.id)}
                    className="px-2 py-1 text-sm border rounded text-red-600"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                  No hay usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* paginación */}
      {totalPages > 1 && (
        <Suspense fallback={<div className="flex justify-center text-sm text-gray-500">Cargando paginación…</div>}>
          <Pagination
            page={currentPage}
            pageCount={totalPages}
            onPageChange={onPageChange}
          />
        </Suspense>
      )}
    </div>
)
}
