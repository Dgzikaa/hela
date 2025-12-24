'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card } from '@/app/components/Card'
import { Badge } from '@/app/components/Badge'
import {
  Shield,
  Smartphone,
  Check,
  X,
  Key,
  AlertTriangle,
  Copy,
  RefreshCw
} from 'lucide-react'

export default function TwoFactorAuthPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [setupMode, setSetupMode] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      // Verificar se 2FA já está ativado (localStorage para demo)
      const enabled = localStorage.getItem('2fa_enabled') === 'true'
      setTwoFAEnabled(enabled)
      if (enabled) {
        const codes = localStorage.getItem('2fa_backup_codes')
        if (codes) setBackupCodes(JSON.parse(codes))
      }
    }
  }, [status, router])

  const generateBackupCodes = () => {
    const codes: string[] = []
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      codes.push(code)
    }
    return codes
  }

  const handleEnable2FA = () => {
    // Simular geração de QR Code e secret
    // Em produção, usar biblioteca como 'speakeasy' e 'qrcode'
    const mockSecret = 'JBSWY3DPEHPK3PXP'
    const mockQR = `otpauth://totp/HelaCarrys:${session?.user?.name}?secret=${mockSecret}&issuer=HelaCarrys`
    
    setSecret(mockSecret)
    setQrCode(mockQR)
    setSetupMode(true)
    
    // Gerar códigos de backup
    const codes = generateBackupCodes()
    setBackupCodes(codes)
  }

  const handleVerify = () => {
    // Em produção, validar o código TOTP no servidor
    if (verificationCode.length === 6) {
      setTwoFAEnabled(true)
      setSetupMode(false)
      localStorage.setItem('2fa_enabled', 'true')
      localStorage.setItem('2fa_backup_codes', JSON.stringify(backupCodes))
      setVerificationCode('')
    }
  }

  const handleDisable2FA = () => {
    if (window.confirm('⚠️ Tem certeza que deseja desativar a autenticação de dois fatores?')) {
      setTwoFAEnabled(false)
      setSetupMode(false)
      localStorage.removeItem('2fa_enabled')
      localStorage.removeItem('2fa_backup_codes')
      setBackupCodes([])
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Autenticação de Dois Fatores
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Adicione uma camada extra de segurança à sua conta
              </p>
            </div>
          </div>
        </div>

        {/* Status Atual */}
        <Card className={`p-6 mb-6 ${twoFAEnabled ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500' : 'bg-gray-50 dark:bg-gray-800'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${twoFAEnabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-200 dark:bg-gray-700'}`}>
                {twoFAEnabled ? (
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  2FA {twoFAEnabled ? 'Ativado' : 'Desativado'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {twoFAEnabled 
                    ? 'Sua conta está protegida com autenticação de dois fatores'
                    : 'Ative 2FA para maior segurança'
                  }
                </p>
              </div>
            </div>
            {twoFAEnabled && (
              <Badge variant="success" className="text-lg px-4 py-2">
                <Shield className="w-5 h-5 mr-2" />
                Protegido
              </Badge>
            )}
          </div>
        </Card>

        {!twoFAEnabled && !setupMode && (
          <Card className="p-8">
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ativar Autenticação de Dois Fatores
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Use um aplicativo autenticador no seu smartphone (Google Authenticator, Authy, etc) 
                para gerar códigos de verificação toda vez que fizer login.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  ✨ Benefícios do 2FA:
                </h4>
                <ul className="text-left text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li>✓ Protege contra acesso não autorizado</li>
                  <li>✓ Segurança mesmo se sua senha vazar</li>
                  <li>✓ Códigos de backup para emergências</li>
                  <li>✓ Conformidade com melhores práticas de segurança</li>
                </ul>
              </div>

              <button
                onClick={handleEnable2FA}
                className="w-full max-w-md px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold text-lg shadow-lg"
              >
                <Shield className="w-6 h-6 inline-block mr-2" />
                Ativar 2FA Agora
              </button>
            </div>
          </Card>
        )}

        {setupMode && (
          <div className="space-y-6">
            {/* Passo 1: Escanear QR Code */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Escaneie o QR Code
                </h3>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="bg-white p-6 rounded-lg border-4 border-gray-200">
                  {/* Simular QR Code */}
                  <div className="w-48 h-48 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Key className="w-16 h-16 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">QR Code</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Abra seu aplicativo autenticador (Google Authenticator, Authy, 1Password, etc) 
                    e escaneie este QR Code.
                  </p>
                  
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Ou insira manualmente:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white dark:bg-gray-900 px-3 py-2 rounded text-sm font-mono">
                        {secret}
                      </code>
                      <button
                        onClick={() => copyToClipboard(secret)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Passo 2: Verificar Código */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Verifique o Código
                </h3>
              </div>
              
              <div className="max-w-md">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Digite o código de 6 dígitos mostrado no seu aplicativo:
                </p>
                
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full px-6 py-4 text-center text-2xl font-mono border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30"
                />
                
                <button
                  onClick={handleVerify}
                  disabled={verificationCode.length !== 6}
                  className="w-full mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  Verificar e Ativar
                </button>
              </div>
            </Card>

            {/* Passo 3: Códigos de Backup */}
            <Card className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-400 font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Códigos de Backup
                </h3>
              </div>
              
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Importante:</strong> Guarde estes códigos em local seguro. 
                  Você pode usá-los para acessar sua conta se perder acesso ao aplicativo autenticador.
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-white dark:bg-gray-900 p-4 rounded-lg">
                {backupCodes.map((code, idx) => (
                  <code key={idx} className="text-center py-2 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm">
                    {code}
                  </code>
                ))}
              </div>
              
              <button
                onClick={() => copyToClipboard(backupCodes.join('\n'))}
                className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar Todos os Códigos
              </button>
            </Card>
          </div>
        )}

        {twoFAEnabled && !setupMode && (
          <div className="space-y-6">
            {/* Códigos de Backup */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                📋 Códigos de Backup
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Use estes códigos caso perca acesso ao seu aplicativo autenticador.
                Cada código pode ser usado apenas uma vez.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                {backupCodes.map((code, idx) => (
                  <code key={idx} className="text-center py-2 bg-white dark:bg-gray-900 rounded font-mono text-sm">
                    {code}
                  </code>
                ))}
              </div>
              
              <button
                onClick={() => copyToClipboard(backupCodes.join('\n'))}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar Códigos
              </button>
            </Card>

            {/* Desativar 2FA */}
            <Card className="p-6 border-2 border-red-200 dark:border-red-800">
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                Desativar 2FA
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Desativar a autenticação de dois fatores reduzirá a segurança da sua conta.
              </p>
              <button
                onClick={handleDisable2FA}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Desativar 2FA
              </button>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

