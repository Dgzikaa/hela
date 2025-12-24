'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card } from '@/app/components/Card'
import { Badge } from '@/app/components/Badge'
import {
  Database,
  Download,
  Upload,
  AlertTriangle,
  Check,
  Clock,
  FileJson,
  Shield,
  RefreshCw
} from 'lucide-react'

interface BackupInfo {
  version: string
  timestamp: string
  metadata: {
    totalJogadores: number
    totalClientes: number
    totalBosses: number
    totalPedidos: number
    totalPrecos: number
  }
}

export default function BackupPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [backupHistory, setBackupHistory] = useState<BackupInfo[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      loadBackupHistory()
    }
  }, [status, router])

  const loadBackupHistory = () => {
    const stored = localStorage.getItem('backup_history')
    if (stored) {
      try {
        setBackupHistory(JSON.parse(stored))
      } catch (error) {
        console.error('Erro ao carregar histórico:', error)
      }
    }
  }

  const saveBackupToHistory = (backup: any) => {
    const history = [{
      version: backup.version,
      timestamp: backup.timestamp,
      metadata: backup.metadata
    }, ...backupHistory.slice(0, 9)] // Manter últimos 10

    setBackupHistory(history)
    localStorage.setItem('backup_history', JSON.stringify(history))
  }

  const handleExport = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/backup/export')
      if (!res.ok) throw new Error('Erro ao gerar backup')

      const backup = await res.json()
      
      // Salvar no histórico
      saveBackupToHistory(backup)

      // Download do arquivo
      const dataStr = JSON.stringify(backup, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `hela-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setMessage({
        type: 'success',
        text: 'Backup exportado com sucesso!'
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Erro ao exportar backup'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadProgress(true)
    setMessage(null)

    try {
      const text = await file.text()
      const backup = JSON.parse(text)

      // Validar estrutura
      if (!backup.version || !backup.data) {
        throw new Error('Arquivo de backup inválido')
      }

      // Confirmar com usuário
      const confirmed = window.confirm(
        `⚠️ ATENÇÃO: Esta ação irá restaurar os dados do backup.\n\n` +
        `Versão: ${backup.version}\n` +
        `Data: ${new Date(backup.timestamp).toLocaleString('pt-BR')}\n` +
        `Jogadores: ${backup.metadata.totalJogadores}\n` +
        `Pedidos: ${backup.metadata.totalPedidos}\n\n` +
        `Deseja continuar?`
      )

      if (!confirmed) {
        setUploadProgress(false)
        return
      }

      const res = await fetch('/api/backup/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backup)
      })

      if (!res.ok) throw new Error('Erro ao importar backup')

      const result = await res.json()

      setMessage({
        type: 'success',
        text: `Backup restaurado! ${result.results.jogadores} jogadores, ${result.results.clientes} clientes restaurados.`
      })

      // Recarregar após 2 segundos
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Erro ao importar backup'
      })
    } finally {
      setUploadProgress(false)
      event.target.value = '' // Reset input
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Backup & Restore
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Exporte e restaure seus dados com segurança
              </p>
            </div>
          </div>
        </div>

        {/* Mensagem */}
        {message && (
          <div className={`
            mb-6 p-4 rounded-lg border-2 flex items-center gap-3
            ${message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300'
            }
          `}>
            {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Exportar */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Exportar Backup
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Faça download de todos os dados em formato JSON
                </p>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={loading}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Exportar Agora
                </>
              )}
            </button>
          </Card>

          {/* Importar */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Upload className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Importar Backup
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Restaure dados de um arquivo de backup anterior
                </p>
              </div>
            </div>

            <label className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer">
              {uploadProgress ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Restaurando...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Selecionar Arquivo
                </>
              )}
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={uploadProgress}
                className="hidden"
              />
            </label>
          </Card>
        </div>

        {/* Aviso de Segurança */}
        <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                ⚠️ Aviso Importante
              </h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• <strong>Backup Regular:</strong> Faça backups regularmente para prevenir perda de dados</li>
                <li>• <strong>Restauração:</strong> A importação irá sobrescrever dados existentes</li>
                <li>• <strong>Teste:</strong> Sempre teste backups em ambiente seguro antes de usar</li>
                <li>• <strong>Segurança:</strong> Armazene arquivos de backup em local seguro</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Histórico de Backups */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Histórico de Backups Locais
            </h2>
          </div>

          {backupHistory.length === 0 ? (
            <div className="text-center py-8">
              <FileJson className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum backup exportado ainda
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {backupHistory.map((backup, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileJson className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {new Date(backup.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <Badge variant="info">v{backup.version}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span>{backup.metadata.totalJogadores} jogadores</span>
                    <span>{backup.metadata.totalClientes} clientes</span>
                    <span>{backup.metadata.totalBosses} bosses</span>
                    <span>{backup.metadata.totalPedidos} pedidos</span>
                    <span>{backup.metadata.totalPrecos} preços</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

