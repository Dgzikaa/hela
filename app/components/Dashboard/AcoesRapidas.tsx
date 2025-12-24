'use client'

import { useRouter } from 'next/navigation'
import { Plus, Calendar, Users, Settings, TrendingUp, Gift } from 'lucide-react'
import { Card } from '../Card'

export function AcoesRapidas() {
  const router = useRouter()

  const acoes = [
    {
      id: 'novo-carry',
      titulo: 'Novo Carry',
      descricao: 'Agendar novo pedido',
      icone: Plus,
      cor: 'purple',
      rota: '/carrys/agendamento'
    },
    {
      id: 'calendario',
      titulo: 'Calendário',
      descricao: 'Ver agenda completa',
      icone: Calendar,
      cor: 'blue',
      rota: '/carrys/calendario'
    },
    {
      id: 'jogadores',
      titulo: 'Membros',
      descricao: 'Gerenciar time',
      icone: Users,
      cor: 'green',
      rota: '/configuracoes/membros'
    },
    {
      id: 'resumo',
      titulo: 'Resumo',
      descricao: 'Ver projeção de ganhos',
      icone: TrendingUp,
      cor: 'orange',
      rota: '/carrys/resumo'
    },
    {
      id: 'carry-gratis',
      titulo: 'Carry Grátis',
      descricao: 'Sorteio semanal',
      icone: Gift,
      cor: 'amber',
      rota: '/carrys/carry-gratis'
    },
    {
      id: 'config',
      titulo: 'Configurações',
      descricao: 'Ajustar sistema',
      icone: Settings,
      cor: 'gray',
      rota: '/configuracoes/geral'
    },
  ]

  const getCorClasses = (cor: string) => {
    const cores: Record<string, string> = {
      purple: 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
      blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
      green: 'bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white',
      orange: 'bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white',
      amber: 'bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
      gray: 'bg-gray-100 text-gray-600 group-hover:bg-gray-600 group-hover:text-white',
    }
    return cores[cor] || cores.gray
  }

  return (
    <Card>
      <h3 className="text-lg font-bold text-gray-900 mb-4">⚡ Ações Rápidas</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {acoes.map((acao) => {
          const Icon = acao.icone
          return (
            <button
              key={acao.id}
              onClick={() => router.push(acao.rota)}
              className="group p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all text-left"
            >
              <div className={`p-3 rounded-lg w-fit mb-3 transition-colors ${getCorClasses(acao.cor)}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                {acao.titulo}
              </p>
              <p className="text-xs text-gray-600 mt-1">{acao.descricao}</p>
            </button>
          )
        })}
      </div>
    </Card>
  )
}

