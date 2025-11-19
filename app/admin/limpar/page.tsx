'use client'

import { useState } from 'react'
import { Button } from '@/app/components/Button'
import { Card } from '@/app/components/Card'
import { AlertTriangle, Trash2, CheckCircle } from 'lucide-react'

export default function LimparDadosPage() {
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [confirmacao, setConfirmacao] = useState('')

  const handleLimpar = async () => {
    if (confirmacao !== 'LIMPAR TUDO') {
      alert('❌ Digite "LIMPAR TUDO" para confirmar')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/limpar-dados', {
        method: 'POST'
      })
      
      const data = await res.json()
      setResultado(data)
      
      if (res.ok) {
        alert('✅ Banco de dados limpo com sucesso!')
        setConfirmacao('')
      } else {
        alert('❌ Erro: ' + data.error)
      }
    } catch (error) {
      alert('❌ Erro ao limpar banco de dados')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gray-800/50 backdrop-blur border-red-500/50">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <h1 className="text-2xl font-bold text-white">⚠️ Limpar Banco de Dados</h1>
            </div>

            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-200 font-semibold mb-2">⛔ ATENÇÃO - AÇÃO IRREVERSÍVEL!</p>
              <p className="text-red-300 text-sm mb-3">
                Esta ação irá deletar PERMANENTEMENTE:
              </p>
              <ul className="text-red-300 text-sm space-y-1 ml-4">
                <li>• Todos os pedidos (teste e produção)</li>
                <li>• Todos os itens dos pedidos</li>
                <li>• Todas as participações de carrys</li>
                <li>• Todos os clientes cadastrados</li>
                <li>• Resetará o total ganho dos jogadores</li>
              </ul>
            </div>

            <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 mb-6">
              <p className="text-yellow-200 font-semibold mb-2">✅ O que NÃO será deletado:</p>
              <ul className="text-yellow-300 text-sm space-y-1 ml-4">
                <li>• Usuários (admins)</li>
                <li>• Jogadores cadastrados</li>
                <li>• Bosses</li>
                <li>• Configurações do sistema</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Digite <span className="font-bold text-red-400">LIMPAR TUDO</span> para confirmar:
                </label>
                <input
                  type="text"
                  value={confirmacao}
                  onChange={(e) => setConfirmacao(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder="LIMPAR TUDO"
                />
              </div>

              <Button
                variant="danger"
                onClick={handleLimpar}
                disabled={loading || confirmacao !== 'LIMPAR TUDO'}
                className="w-full"
              >
                {loading ? (
                  <>🔄 Limpando...</>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar Banco de Dados
                  </>
                )}
              </Button>
            </div>

            {resultado && resultado.success && (
              <div className="mt-6 bg-green-900/30 border border-green-500/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <p className="text-green-200 font-semibold">✅ Limpeza Concluída!</p>
                </div>
                <div className="text-green-300 text-sm space-y-1">
                  <p>• {resultado.deleted.pedidos} pedidos deletados</p>
                  <p>• {resultado.deleted.itens} itens deletados</p>
                  <p>• {resultado.deleted.participacoes} participações deletadas</p>
                  <p>• {resultado.deleted.clientes} clientes deletados</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

