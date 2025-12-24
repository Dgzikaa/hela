'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card } from '../Card'

interface CarrysChartProps {
  data: Array<{
    mes: string
    carrys: number
    receita: number
  }>
}

export function CarrysChart({ data }: CarrysChartProps) {
  return (
    <Card>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Evolução de Carrys e Receita</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="mes" 
            stroke="#888"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            yAxisId="left"
            stroke="#888"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#888"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="carrys" 
            stroke="#9333ea" 
            strokeWidth={3}
            name="Carrys"
            dot={{ fill: '#9333ea', r: 4 }}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="receita" 
            stroke="#10b981" 
            strokeWidth={3}
            name="Receita (b)"
            dot={{ fill: '#10b981', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}

