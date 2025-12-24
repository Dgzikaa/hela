'use client'

import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, Target } from 'lucide-react'
import { Card } from '../Card'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: any
  color: 'purple' | 'blue' | 'green' | 'orange'
}

export function MetricCard({ title, value, change, icon: Icon, color }: MetricCardProps) {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  const changeColor = change && change > 0 ? 'text-green-600' : 'text-red-600'
  const TrendIcon = change && change > 0 ? TrendingUp : TrendingDown

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${changeColor}`}>
              <TrendIcon className="w-4 h-4" />
              <span>{Math.abs(change)}%</span>
              <span className="text-gray-500 font-normal">vs. mês passado</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  )
}

interface DashboardMetricsProps {
  totalCarrys: number
  totalReceita: number
  jogadoresAtivos: number
  proximosCarrys: number
  changes?: {
    carrys: number
    receita: number
    jogadores: number
  }
}

export function DashboardMetrics({ 
  totalCarrys, 
  totalReceita, 
  jogadoresAtivos, 
  proximosCarrys,
  changes 
}: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total de Carrys"
        value={totalCarrys}
        change={changes?.carrys}
        icon={Target}
        color="purple"
      />
      <MetricCard
        title="Receita Total"
        value={`${(totalReceita / 1000).toFixed(1)}b`}
        change={changes?.receita}
        icon={DollarSign}
        color="green"
      />
      <MetricCard
        title="Jogadores Ativos"
        value={jogadoresAtivos}
        change={changes?.jogadores}
        icon={Users}
        color="blue"
      />
      <MetricCard
        title="Carrys Agendados"
        value={proximosCarrys}
        icon={Calendar}
        color="orange"
      />
    </div>
  )
}

