"use client"

import { useState } from "react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import {
  ClipboardList,
  Clock,
  CheckCircle,
  Users as UsersIcon,
  PieChart as PieIcon,
} from "lucide-react"

// **UI Primitives**

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow p-4 ${className}`}>{children}</div>
)

const CardHeader = ({ title, subtitle }) => (
  <div className="mb-2">
    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
  </div>
)

const StatGrid = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{children}</div>
)

const StatItem = ({ icon: Icon, label, value }) => (
  <Card className="flex items-center space-x-4">
    <Icon className="h-6 w-6 text-blue-600" />
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </Card>
)

// **DashboardPage**

export default function DashboardPage() {
  // métricas falsas de inspecciones
  const [stats] = useState({
    totalInspections: 312,
    pendingInspections: 27,
    completedInspections: 285,
    inspectors: 12,
  })

  // datos de tendencia (últimos 7 días)
  const trendData = [
    { day: "24 Jul", inspects: 40 },
    { day: "25 Jul", inspects: 45 },
    { day: "26 Jul", inspects: 42 },
    { day: "27 Jul", inspects: 50 },
    { day: "28 Jul", inspects: 55 },
    { day: "29 Jul", inspects: 48 },
    { day: "30 Jul", inspects: 32 },
  ]

  // tipos de inspección
  const typeData = [
    { name: "Edificios", value: 120, color: "#3b82f6" },
    { name: "Comercios", value: 80,  color: "#2563eb" },
    { name: "Viviendas", value: 70,  color: "#60a5fa" },
    { name: "Calles",    value: 42,  color: "#93c5fd" },
  ]

  // inspecciones semanales por inspector
  const weeklyData = [
    { name: "Inspector A", count: 60 },
    { name: "Inspector B", count: 55 },
    { name: "Inspector C", count: 50 },
    { name: "Inspector D", count: 48 },
  ]

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Inspecciones</h1>
          <p className="text-gray-600">Visión general del departamento de inspecciones</p>
        </div>
      </div>

      {/* Estadísticas principales */}
      <StatGrid>
        <StatItem
          icon={ClipboardList}
          label="Total Inspecciones"
          value={stats.totalInspections}
        />
        <StatItem
          icon={Clock}
          label="Pendientes"
          value={stats.pendingInspections}
        />
        <StatItem
          icon={CheckCircle}
          label="Completadas"
          value={stats.completedInspections}
        />
        <StatItem
          icon={UsersIcon}
          label="Inspectores"
          value={stats.inspectors}
        />
      </StatGrid>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia de inspecciones */}
        <Card>
          <CardHeader
            title="Tendencia Semanal"
            subtitle="Inspecciones por día (últimos 7 días)"
          />
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <ReTooltip />
              <Line
                type="monotone"
                dataKey="inspects"
                stroke="#3b82f6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Tipos de inspección */}
        <Card>
          <CardHeader
            title="Tipos de Inspección"
            subtitle="Distribución por categoría"
          />
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={typeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {typeData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <ReTooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Inspecciones por inspector */}
      <Card>
        <CardHeader
          title="Inspecciones por Inspector"
          subtitle="Resumen semanal"
        />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <ReTooltip />
            <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
