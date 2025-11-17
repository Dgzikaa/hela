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
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 rounded-3xl mb-6 shadow-2xl backdrop-blur-sm">
            <img 
              src="/images/bosses/hela.gif" 
              alt="Hela"
              className="w-20 h-20 object-contain"
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

        {/* O que Oferecemos */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Godly + Força Heróica */}
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-500/20 rounded-xl mb-3">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Godly + Força Heróica
              </h3>
              <p className="text-sm text-slate-400">
                Ingredientes para craftar os itens mais raros do jogo
              </p>
            </div>
          </Card>

          {/* Conquistas */}
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-xl mb-3">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Conquistas
              </h3>
              <p className="text-sm text-slate-400">
                Sem Morrer e pacote completo 1-6 com benefícios especiais
              </p>
            </div>
          </Card>

          {/* Visual Exclusivo */}
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-xl mb-3">
                <ShoppingCart className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Visual Exclusivo
              </h3>
              <p className="text-sm text-slate-400">
                Pets e montarias únicas para se destacar no jogo
              </p>
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
