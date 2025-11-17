'use client'

import { useRouter } from 'next/navigation'
import { ShoppingCart, Shield, Star } from 'lucide-react'
import { Card } from './components/Card'
import { Button } from './components/Button'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Logo/Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl mb-6 shadow-2xl">
            <img 
              src="https://api.ragnatales.com.br/database/mob/image?mob_id=28221" 
              alt="Hela"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            Hela Carrys
          </h1>
          <p className="text-xl text-slate-300 mb-2">
            Sistema Profissional de Venda de Carrys
          </p>
          <p className="text-slate-400">
            Conquiste Hela e todos os bosses com segurança
          </p>
        </div>

        {/* Cards de Ação */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Comprar Carry */}
          <Card 
            className="p-8 hover:scale-105 transition-transform cursor-pointer bg-white"
            onClick={() => router.push('/comprar')}
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-4">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Comprar Carry
              </h2>
              <p className="text-slate-600 mb-4">
                Escolha os bosses e faça seu pedido
              </p>
              <Button fullWidth size="lg">
                Começar Agora
              </Button>
            </div>
          </Card>

          {/* Admin */}
          <Card 
            className="p-8 hover:scale-105 transition-transform cursor-pointer bg-slate-900 border-slate-700"
            onClick={() => router.push('/admin')}
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4">
                <Shield className="w-8 h-8 text-slate-900" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Painel Admin
              </h2>
              <p className="text-slate-300 mb-4">
                Gerenciar pedidos e jogadores
              </p>
              <Button fullWidth size="lg" variant="secondary">
                Fazer Login
              </Button>
            </div>
          </Card>
        </div>

        {/* Informações dos Bosses */}
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            💎 Preços dos Carrys
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-slate-400">Freylith</p>
              <p className="text-lg font-bold text-white">70KK</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Tyrgrim</p>
              <p className="text-lg font-bold text-white">100KK</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Skollgrim</p>
              <p className="text-lg font-bold text-white">130KK</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Baldira</p>
              <p className="text-lg font-bold text-white">150KK</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Thorvald</p>
              <p className="text-lg font-bold text-white">230KK</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Glacius</p>
              <p className="text-lg font-bold text-white">300KK</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-slate-400">Pacote 1-6</p>
              <p className="text-lg font-bold text-green-400">500KK 🎁</p>
              <p className="text-xs text-slate-500">+ Sem Morrer Grátis!</p>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-400 text-sm">
          <p>Ragnatales © 2024 - Sistema de Carrys Profissional</p>
        </div>
      </div>
    </div>
  )
}
