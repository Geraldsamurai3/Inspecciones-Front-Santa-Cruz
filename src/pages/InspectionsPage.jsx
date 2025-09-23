// src/AdministrativePage/pages/InspectionsPage.jsx
"use client"

import React, { useState, useMemo } from "react"
import {
  Search,
  MapPin,
  Clock,
  CheckCircle,
  MoreHorizontal,
  Eye,
  Play,
  Archive,
} from "lucide-react"

// --- UI Primitives ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow p-6 ${className}`}>{children}</div>
)
const Button = ({ children, onClick, variant = "solid", size = "sm", className = "" }) => {
  const sizes = { sm: "px-3 py-1 text-sm", md: "px-4 py-2 text-base" }
  const variants = {
    solid: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
  }
  return (
    <button
      onClick={onClick}
      className={`${sizes[size]} ${variants[variant]} rounded ${className}`}
    >
      {children}
    </button>
  )
}
const Input = ({ ...props }) => (
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    <input
      {...props}
      className="w-full pl-10 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
)
const Badge = ({ children, color }) => {
  const colors = {
    Pendiente: "bg-yellow-100 text-yellow-800",
    "En curso": "bg-blue-100 text-blue-800",
    Revisada: "bg-green-100 text-green-800",
    Archivada: "bg-gray-100 text-gray-800",
  }
  return (
    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${colors[color] || colors.Pendiente}`}>
      {children}
    </span>
  )
}

// --- Demo Page ---
export default function InspectionsPage() {
  // fake data
  const inspections = [
    { id: 1, address: "Av. Central #123", date: "28 Jul 2025 • 10:00", status: "Pendiente", inspector: "Juana Pérez" },
    { id: 2, address: "Calle 5 #45",     date: "28 Jul 2025 • 09:30", status: "En curso", inspector: "Carlos Vega" },
    { id: 3, address: "Barrio El Roble",  date: "27 Jul 2025 • 16:15", status: "Revisada", inspector: "Ana Gómez" },
    { id: 4, address: "Urb. Los Álamos", date: "27 Jul 2025 • 14:20", status: "Pendiente", inspector: "Luis Herrera" },
    { id: 5, address: "Sector La Loma",  date: "26 Jul 2025 • 11:45", status: "En curso", inspector: "María Díaz" },
    { id: 6, address: "Col. San José",   date: "26 Jul 2025 • 10:10", status: "Revisada", inspector: "Pedro Mora" },
  ]

  const [search, setSearch]     = useState("")
  const [filterStatus, setFilterStatus] = useState("Todos")
  const [page, setPage]         = useState(1)
  const ITEMS_PER_PAGE = 12

  const statuses = ["Todos", "Pendiente", "En curso", "Revisada"]

  const filtered = useMemo(() => {
    return inspections.filter(i => {
      if (search && !`${i.address} ${i.inspector}`.toLowerCase().includes(search.toLowerCase())) return false
      if (filterStatus !== "Todos" && i.status !== filterStatus) return false
      return true
    })
  }, [inspections, search, filterStatus])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const slice = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  // Reusable Pagination component
  const Pagination = React.lazy(() => import("@/components/ui/pagination"))

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inspecciones</h1>
          <p className="text-gray-600">Lista de inspecciones recibidas y su estado</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Input
            placeholder="Buscar dirección o inspector..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slice.map(item => (
          <Card key={item.id} className="relative hover:shadow-lg transition-shadow">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{item.address}</h3>
                <p className="mt-1 text-sm text-gray-500">{item.date}</p>
                <div className="mt-2 flex items-center text-sm text-gray-700 space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{item.inspector}</span>
                </div>
              </div>
              <Badge color={item.status}>{item.status}</Badge>
            </div>
            <div className="absolute top-4 right-4">
              <button className="p-1 rounded hover:bg-gray-100">
                <MoreHorizontal className="h-5 w-5 text-gray-500" />
              </button>
              {/* Dropdown logic omitted for demo */}
            </div>
            <div className="mt-4 flex">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" /> Ver más
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <React.Suspense fallback={<div className="flex justify-center text-sm text-gray-500">Cargando paginación…</div>}>
          <Pagination
            page={page}
            total={filtered.length}
            pageSize={ITEMS_PER_PAGE}
            onPageChange={setPage}
          />
        </React.Suspense>
      )}
    </div>
  )
}
