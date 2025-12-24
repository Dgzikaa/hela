'use client'

import { useState } from 'react'
import { Card } from '@/app/components/Card'
import { Button } from '@/app/components/Button'
import { useToast } from '@/app/hooks/useToast'
import { Trash2, Upload, Users, CheckCircle } from 'lucide-react'

export default function GerenciarTimePage() {
  const [loading, setLoading] = useState(false)
  const { success, error: showError } = useToast()

  const timePrincipal = [
    'supaturk',
    'isami',
    'dickharper',
    'Follone',
    'God',
    'Bibico',
    'Bera',
    'Haise',
    'Lazo',
    'Mills',
    'Pablo'
  ]

  const jogadoresParaExcluir = ['bidao', 'DGzik4']

  // Agendamentos para importar (CORRIGIDO: Dezembro de 2025, Janeiro de 2026, Fevereiro de 2026)
  const agendamentos = [
    { data: '2025-12-24', clientes: ['bmbel', 'jake'], sinal: 'sinal OK' },
    { data: '2025-12-25', clientes: ['Bento', 'kadu'], sinal: 'pago todo' },
    { data: '2025-12-26', clientes: ['bob o aprendiz', 'SerathEstelward'], sinal: 'sinal OK' },
    { data: '2025-12-27', clientes: ['KuganTV', 'CEARENSE SOVIÉTICA', 'DESILUSIONAL DAMAGE'], sinal: 'sinal OK' },
    { data: '2025-12-28', clientes: ['arthursmyuu', 'homanoo'], sinal: 'sinal OK' },
    { data: '2025-12-29', clientes: ['WillGuns', 'goukii'], sinal: 'sinal OK' },
    { data: '2025-12-30', clientes: ['juninho', 'bolzanii'], sinal: 'sinal OK' },
    { data: '2025-12-31', clientes: ['Drakka', 'Chessuis'], sinal: 'sinal OK' },
    { data: '2026-01-01', clientes: ['halloweengod', 'Alera'], sinal: 'sinal OK' },
    { data: '2026-01-02', clientes: ['inx', 'ErickMxFlamejante'], sinal: 'sinal OK' },
    { data: '2026-01-03', clientes: ['Kowalski', 'zlixx'], sinal: 'pago tudo' },
    { data: '2026-01-04', clientes: ['FoxGauthier', 'PREFIROCAIRDEMOTO'], sinal: 'sinal OK' },
    { data: '2026-01-05', clientes: ['Verdiinho', 'slackzera'], sinal: 'sinal OK' },
    { data: '2026-01-06', clientes: ['.raphao', 'Avaraquela'], sinal: 'sinal OK' },
    { data: '2026-01-07', clientes: ['defeiticeira ex biscate', 'Fredyn'], sinal: 'sinal OK' },
    { data: '2026-01-08', clientes: ['Sanci', 'Droppganger'], sinal: 'sinal OK' },
    { data: '2026-01-09', clientes: ['bento 2'], sinal: 'aguardando sinal' },
    { data: '2026-01-11', clientes: ['SoulBurner'], sinal: 'sinal OK' },
    { data: '2026-01-12', clientes: ['Balbs'], sinal: 'sinal OK' },
    { data: '2026-01-15', clientes: ['azvini'], sinal: 'sinal OK' },
    { data: '2026-01-17', clientes: ['w4nted'], sinal: 'sinal OK' },
    { data: '2026-01-19', clientes: ['Gakotali'], sinal: 'sinal OK' },
    { data: '2026-01-20', clientes: ['Dibis'], sinal: 'sinal OK' },
    { data: '2026-01-21', clientes: ['MKTCACETE'], sinal: 'pago tudo' },
    { data: '2026-01-22', clientes: ['ilovenat'], sinal: 'sinal OK' },
    { data: '2026-01-25', clientes: ['Tortoise'], sinal: 'sinal OK' },
    { data: '2026-01-26', clientes: ['RDGW'], sinal: 'sinal OK' },
    { data: '2026-01-27', clientes: ['japanakaz'], sinal: 'sinal OK' },
    { data: '2026-02-06', clientes: ['Lucas'], sinal: 'aguardando' }
  ]

  const limparJogadores = async () => {
    if (!confirm('Tem certeza que deseja remover bidao e dgzika do time?\n\nSe tiverem participações em carrys, serão apenas desativados (histórico mantido).')) {
      return
    }

    setLoading(true)
    try {
      // Buscar todos os jogadores
      const response = await fetch('/api/jogadores')
      const jogadores = await response.json()

      let mensagens: string[] = []

      // Excluir/desativar bidao e dgzika
      for (const nome of jogadoresParaExcluir) {
        const jogador = jogadores.find((j: any) => 
          j.nick.toLowerCase() === nome.toLowerCase()
        )

        if (jogador) {
          const deleteResponse = await fetch(`/api/jogadores/${jogador.id}`, {
            method: 'DELETE'
          })

          if (deleteResponse.ok) {
            const result = await deleteResponse.json()
            if (result.desativado) {
              mensagens.push(`${nome}: desativado (tem histórico)`)
              console.log(`✅ ${nome} desativado`)
            } else {
              mensagens.push(`${nome}: excluído`)
              console.log(`✅ ${nome} excluído`)
            }
          } else {
            const errorData = await deleteResponse.json()
            mensagens.push(`${nome}: erro (${errorData.details || 'desconhecido'})`)
            console.error(`❌ Erro ao excluir ${nome}:`, errorData)
          }
        } else {
          mensagens.push(`${nome}: não encontrado`)
          console.log(`⚠️ ${nome} não encontrado no banco`)
        }
      }

      success(`Concluído!\n${mensagens.join('\n')}`)
    } catch (err) {
      console.error('Erro ao limpar jogadores:', err)
      showError('Erro ao limpar jogadores')
    } finally {
      setLoading(false)
    }
  }

  const marcarTimeEssencial = async () => {
    if (!confirm('Tem certeza que deseja marcar o time principal como essencial?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/jogadores')
      const jogadores = await response.json()

      for (const nome of timePrincipal) {
        const jogador = jogadores.find((j: any) => 
          j.nick.toLowerCase() === nome.toLowerCase()
        )

        if (jogador) {
          // Pablo não é essencial (pode sair quando tiver 2 carrys)
          const essencial = nome.toLowerCase() !== 'pablo'

          await fetch(`/api/jogadores/${jogador.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...jogador,
              essencial,
              categorias: 'HELA,CARRYS'
            })
          })

          console.log(`✅ ${nome} marcado como ${essencial ? 'essencial' : 'rotativo'}`)
        }
      }

      success('Time principal configurado!')
    } catch (err) {
      console.error('Erro ao configurar time:', err)
      showError('Erro ao configurar time')
    } finally {
      setLoading(false)
    }
  }

  const importarAgendamentos = async () => {
    if (!confirm(`Tem certeza que deseja importar ${agendamentos.length} agendamentos?`)) {
      return
    }

    setLoading(true)
    try {
      console.log('🚀 Iniciando importação de', agendamentos.length, 'agendamentos...')
      
      const response = await fetch('/api/agendamentos/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agendamentos })
      })

      console.log('📡 Resposta da API:', response.status, response.statusText)

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Resultado:', result)
        success(`✅ ${result.message}\n\nDetalhes:\n${result.resultados?.slice(0, 5).map((r: any) => `${r.cliente} (${r.data})`).join('\n')}`)
      } else {
        const errorData = await response.json()
        console.error('❌ Erro da API:', errorData)
        showError(`Erro ao importar: ${errorData.error || 'Desconhecido'}`)
      }
    } catch (err) {
      console.error('❌ Erro ao importar agendamentos:', err)
      showError(`Erro de rede: ${err instanceof Error ? err.message : 'Desconhecido'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🛠️ Gerenciar Time & Agendamentos
          </h1>
          <p className="text-gray-600">
            Ferramentas administrativas para configuração inicial
          </p>
        </div>

        {/* Limpar Jogadores */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                1. Remover Jogadores
              </h2>
              <p className="text-sm text-gray-600">
                Remover do time: bidao, dgzika
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Jogadores a remover:</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {jogadoresParaExcluir.map(nome => (
                <li key={nome}>{nome}</li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 mt-3">
              💡 Se tiverem histórico de carrys, serão apenas <strong>desativados</strong> (dados mantidos)
            </p>
          </div>

          <Button
            onClick={limparJogadores}
            disabled={loading}
            variant="danger"
            className="w-full"
          >
            {loading ? 'Removendo...' : 'Remover Jogadores'}
          </Button>
        </Card>

        {/* Configurar Time Principal */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                2. Configurar Time Principal
              </h2>
              <p className="text-sm text-gray-600">
                Marcar os 11 jogadores principais (10 essenciais + Pablo rotativo)
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Time Principal (11 jogadores):</strong>
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
              {timePrincipal.map(nome => (
                <div key={nome} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{nome}</span>
                  {nome.toLowerCase() === 'pablo' && (
                    <span className="text-xs text-orange-500">(rotativo)</span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              💡 Pablo será removido da divisão quando tiverem 2 carrys no mesmo dia
            </p>
          </div>

          <Button
            onClick={marcarTimeEssencial}
            disabled={loading}
            variant="primary"
            className="w-full"
          >
            {loading ? 'Configurando...' : 'Configurar Time'}
          </Button>
        </Card>

        {/* Importar Agendamentos */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                3. Importar Agendamentos
              </h2>
              <p className="text-sm text-gray-600">
                {agendamentos.length} agendamentos de Dez/2024 a Fev/2025
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Agendamentos a importar:</strong>
            </p>
            <div className="space-y-1 text-xs text-gray-600">
              {agendamentos.map((ag, i) => (
                <div key={i} className="flex justify-between border-b border-gray-200 pb-1">
                  <span>{new Date(ag.data).toLocaleDateString('pt-BR')}</span>
                  <span className="text-purple-600 font-medium">
                    {ag.clientes.length} carry{ag.clientes.length > 1 ? 's' : ''}
                  </span>
                  <span className={`
                    px-2 py-0.5 rounded text-xs
                    ${ag.sinal.includes('pago') ? 'bg-green-100 text-green-700' : 
                      ag.sinal.includes('sinal OK') ? 'bg-blue-100 text-blue-700' : 
                      'bg-yellow-100 text-yellow-700'}
                  `}>
                    {ag.sinal}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={importarAgendamentos}
            disabled={loading}
            variant="primary"
            className="w-full"
          >
            {loading ? 'Importando...' : `Importar ${agendamentos.length} Agendamentos`}
          </Button>
        </Card>
      </div>
    </div>
  )
}

