'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Calculator, 
  TrendingUp, 
  Flame, 
  Sword, 
  Gift, 
  Dices,
  Calendar,
  Clock,
  ArrowRight,
  BarChart3,
  Wallet
} from 'lucide-react'
import { Card } from './components/Card'
import { ToolsLayout } from './components/ToolsLayout'

// Supabase config
const SUPABASE_URL = 'https://mqovddsgksbyuptnketl.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xb3ZkZHNna3NieXVwdG5rZXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzU5NTksImV4cCI6MjA3ODk1MTk1OX0.wkx2__g4rFmEoiBiF-S85txtaQXK1RTDztgC3vSexp4'

const formatZeny = (value: number): string => {
  if (value >= 1000000000) return (value / 1000000000).toFixed(2) + 'B'
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return Math.round(value / 1000) + 'K'
  return value.toLocaleString('pt-BR')
}

interface MarketPrice {
  item_key: string
  item_name: string
  price: number
  updated_at: string
}

// Ferramentas disponíveis
const FERRAMENTAS = [
  {
    id: 'calculadora',
    nome: 'Calculadora Tigrinho',
    descricao: 'Simule tiradas de Expedição e Somatologia',
    icone: Dices,
    href: '/calculadora',
    cor: 'purple'
  },
  {
    id: 'farm',
    nome: 'Calculadora de Farm',
    descricao: 'Compare lucro/hora dos conteúdos',
    icone: Flame,
    href: '/farm',
    cor: 'emerald'
  },
  {
    id: 'agenda',
    nome: 'Agenda de Farm',
    descricao: 'Registre e acompanhe seu farm diário',
    icone: Calendar,
    href: '/agenda',
    cor: 'blue'
  },
  {
    id: 'precos',
    nome: 'Preços do Mercado',
    descricao: 'Preços atualizados do RagnaTales',
    icone: TrendingUp,
    href: '/precos',
    cor: 'cyan'
  },
  {
    id: 'dano',
    nome: 'Calculadora de Dano',
    descricao: 'Estime seu dano físico e mágico',
    icone: Sword,
    href: '/dano',
    cor: 'red'
  },
  {
    id: 'carry',
    nome: 'Carry Grátis',
    descricao: 'Participe do sorteio semanal',
    icone: Gift,
    href: '/carry-gratis',
    cor: 'amber'
  },
]

const getCorClasse = (cor: string) => {
  const cores: Record<string, string> = {
    purple: 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
    emerald: 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
    blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
    cyan: 'bg-cyan-100 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white',
    red: 'bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white',
    amber: 'bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
  }
  return cores[cor] || cores.purple
}

export default function HomePage() {
  const [prices, setPrices] = useState<MarketPrice[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrices()
  }, [])

  const fetchPrices = async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/market_prices?select=item_key,item_name,price,updated_at&order=updated_at.desc&limit=6`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setPrices(data)
        if (data.length > 0) {
          setLastUpdate(new Date(data[0].updated_at))
        }
      }
    } catch (err) {
      console.error('Erro ao buscar preços:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ToolsLayout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Hela Tools
            </h1>
            <p className="text-gray-500 mt-1">Ferramentas para RagnaTales</p>
          </div>

          {/* Resumo rápido */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 bg-white border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Última atualização</p>
                  <p className="font-medium text-gray-900">
                    {lastUpdate ? lastUpdate.toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Carregando...'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Itens monitorados</p>
                  <p className="font-medium text-gray-900">
                    {loading ? '...' : `${prices.length}+ itens`}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Wallet className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Agenda de Farm</p>
                  <p className="font-medium text-gray-900">
                    Em breve
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Ferramentas */}
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ferramentas</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {FERRAMENTAS.map((ferramenta) => {
              const Icon = ferramenta.icone
              return (
                <Link key={ferramenta.id} href={ferramenta.href}>
                  <Card className="p-4 bg-white border-gray-200 shadow-sm hover:shadow-md transition-all group cursor-pointer h-full">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl transition-colors ${getCorClasse(ferramenta.cor)}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {ferramenta.nome}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {ferramenta.descricao}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>

          {/* Preços recentes */}
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Preços Recentes</h2>
          <Card className="p-4 bg-white border-gray-200 shadow-sm">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Carregando preços...</div>
            ) : prices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum preço disponível. Clique em "Atualizar" na Calculadora Tigrinho.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {prices.slice(0, 6).map((item) => (
                  <div key={item.item_key} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 truncate" title={item.item_name}>
                      {item.item_name.replace('Pó de Meteorita ', '').replace('Pó ', '')}
                    </p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {formatZeny(item.price)}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <Link 
                href="/precos" 
                className="text-sm text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-1"
              >
                Ver todos os preços <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-400">
            <p>Hela Tools • RagnaTales</p>
          </div>
        </div>
      </div>
    </ToolsLayout>
  )
}
