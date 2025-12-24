'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import { Card } from '@/app/components/Card'
import { Input } from '@/app/components/Input'
import { Button } from '@/app/components/Button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔐 Iniciando login...', { email })
    setLoading(true)
    setError('')

    try {
      console.log('📡 Chamando signIn...')
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      console.log('📥 Resultado do signIn:', result)

      if (result?.error) {
        console.error('❌ Erro no login:', result.error)
        setError('Email ou senha inválidos')
      } else if (result?.ok) {
        console.log('✅ Login bem-sucedido! Redirecionando...')
        router.push('/home')
        router.refresh()
      } else {
        console.error('⚠️ Resultado inesperado:', result)
        setError('Erro inesperado ao fazer login')
      }
    } catch (err) {
      console.error('💥 Erro na requisição:', err)
      setError('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Hela Carrys
          </h1>
          <p className="text-slate-600">Faça login para acessar o sistema</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />

          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Sistema de gerenciamento de carrys - RagnaTales
        </p>
      </Card>
    </div>
  )
}

