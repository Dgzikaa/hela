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

        {/* Informações de Contato */}
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            💬 Como Comprar?
          </h3>
          <div className="text-center space-y-3">
            <p className="text-slate-300">
              Para consultar valores e fazer seu pedido, entre em contato via Discord:
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a 
                href="https://discord.com/users/614167750457163796"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-700/50 px-6 py-3 rounded-xl border border-slate-600 hover:bg-slate-600/50 hover:border-blue-500 transition-all cursor-pointer"
              >
                <p className="text-white font-bold">@supaturk</p>
              </a>
              <div className="text-slate-500 hidden sm:block">ou</div>
              <a 
                href="https://discord.com/users/116981167101575171"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-700/50 px-6 py-3 rounded-xl border border-slate-600 hover:bg-slate-600/50 hover:border-blue-500 transition-all cursor-pointer"
              >
                <p className="text-white font-bold">@godinho_</p>
              </a>
            </div>
            <p className="text-sm text-slate-400 mt-4">
              🔒 Preços exclusivos • Atendimento personalizado • Segurança garantida
            </p>
            <p className="text-xs text-slate-500">
              💡 Clique nos nomes para abrir conversa no Discord
            </p>
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
