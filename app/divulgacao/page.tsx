'use client'

import { Crown, Zap, Shield, Sword, TrendingUp, Star, Check } from 'lucide-react'

export default function DivulgacaoCarry() {
  const itensGodly = [
    { id: 17200, nome: 'Símbolo do Deus-Sol', chance: '100%' },
    { id: 17201, nome: 'Foice da Deusa do Submundo', chance: '100%' },
    { id: 17202, nome: 'Ombreiras do Velgaruth', chance: '3%' },
    { id: 17203, nome: 'Conquista 100pts Força Heróica', chance: '100%' }
  ]

  const bosses = [
    { nome: 'Freylith', preco: 70, numero: 1 },
    { nome: 'Tyrgrim', preco: 100, numero: 2 },
    { nome: 'Skollgrim', preco: 130, numero: 3 },
    { nome: 'Baldira', preco: 150, numero: 4 },
    { nome: 'Thorvald', preco: 230, numero: 5 },
    { nome: 'Glacius', preco: 300, numero: 6 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Banner Principal */}
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl overflow-hidden shadow-2xl border-4 border-yellow-400 mb-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>

          <div className="relative z-10 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <Star className="w-12 h-12 text-yellow-400 animate-pulse" />
                <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400">
                  CARRY HELA
                </h1>
                <Star className="w-12 h-12 text-yellow-400 animate-pulse" />
              </div>
              <p className="text-2xl font-bold text-white mb-2">
                🎯 VAGAS DISPONÍVEIS - ITENS GODLY GARANTIDOS!
              </p>
              <div className="flex items-center justify-center gap-4 text-yellow-400 text-lg">
                <span className="flex items-center gap-2">
                  <Check className="w-5 h-5" /> 100% SEGURO
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-5 h-5" /> DROPS GARANTIDOS
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-5 h-5" /> TIME PROFISSIONAL
                </span>
              </div>
            </div>

            {/* Itens Godly Grid */}
            <div className="mb-8">
              <h2 className="text-3xl font-black text-yellow-400 text-center mb-6 flex items-center justify-center gap-3">
                <Crown className="w-8 h-8" />
                ITENS GODLY - 6B CADA
                <Crown className="w-8 h-8" />
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[17200, 17201, 17202, 17203, 17204, 17206, 17208].map((itemId) => (
                  <div key={itemId} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border-2 border-yellow-400 hover:scale-105 transition-transform">
                      <img 
                        src={`https://api.ragnatales.com.br/database/item/collection?nameid=${itemId}`}
                        alt={`Godly Item ${itemId}`}
                        className="w-full h-32 object-contain drop-shadow-2xl"
                      />
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        6B
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-2 border-yellow-400 rounded-xl p-4 text-center">
                <p className="text-white text-lg font-bold">
                  💎 Drops de ingredientes + Crafting no Ferreiro Angra = <span className="text-yellow-400">GODLY EQUIPADO!</span>
                </p>
              </div>
            </div>

            {/* Preços e Bosses */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Bosses Individuais */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-yellow-400">
                <h3 className="text-2xl font-black text-yellow-400 mb-4 flex items-center gap-2">
                  <Sword className="w-6 h-6" />
                  BOSSES INDIVIDUAIS
                </h3>
                <div className="space-y-2">
                  {bosses.map((boss) => (
                    <div key={boss.numero} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://api.ragnatales.com.br/database/mob/image?mob_id=${
                            boss.numero === 1 ? 21857 : 
                            boss.numero === 2 ? 20431 : 
                            boss.numero === 3 ? 28292 : 
                            boss.numero === 4 ? 21856 : 
                            boss.numero === 5 ? 20433 : 21858
                          }`}
                          alt={boss.nome}
                          className="w-12 h-12 object-contain"
                        />
                        <span className="text-white font-bold">{boss.nome}</span>
                      </div>
                      <span className="text-yellow-400 font-black text-xl">{boss.preco}KK</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pacotes */}
              <div className="space-y-4">
                {/* Pacote 1-6 */}
                <div className="relative bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-6 border-4 border-green-400 shadow-2xl">
                  <div className="absolute -top-3 -right-3 bg-red-600 text-white text-xs font-black px-4 py-2 rounded-full rotate-12 shadow-lg">
                    ECONOMIA DE 480KK!
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-7 h-7" />
                    PACOTE COMPLETO 1-6
                  </h3>
                  <div className="text-center mb-4">
                    <p className="text-white text-xl mb-2">De <span className="line-through">980KK</span> por:</p>
                    <p className="text-6xl font-black text-yellow-300 mb-2">500KK</p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 space-y-2">
                    <p className="text-white font-bold flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-300" /> Todos os 6 bosses
                    </p>
                    <p className="text-white font-bold flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-300" /> Conquista Sem Morrer GRÁTIS
                    </p>
                    <p className="text-white font-bold flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-300" /> TODOS os ingredientes
                    </p>
                  </div>
                </div>

                {/* Hela */}
                <div className="relative bg-gradient-to-br from-purple-600 to-purple-900 rounded-2xl p-6 border-4 border-purple-400 shadow-2xl">
                  <div className="absolute -top-3 -left-3 bg-yellow-400 text-black text-xs font-black px-4 py-2 rounded-full shadow-lg">
                    🔥 BOSS ESPECIAL
                  </div>
                  <h3 className="text-3xl font-black text-white mb-3 flex items-center gap-2">
                    <Crown className="w-8 h-8 text-yellow-300" />
                    HELA - DEUSA DA MORTE
                  </h3>
                  <div className="flex items-center justify-between">
                    <img 
                      src="https://api.ragnatales.com.br/database/mob/image?mob_id=28221"
                      alt="Hela"
                      className="w-32 h-32 object-contain drop-shadow-2xl"
                    />
                    <div className="text-right">
                      <p className="text-yellow-300 text-4xl font-black">CONSULTAR</p>
                      <p className="text-white text-sm mt-2">Garanta seu Símbolo do Deus-Sol!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-center shadow-2xl">
              <h2 className="text-4xl font-black text-gray-900 mb-4">
                🚀 GARANTA SUA VAGA AGORA!
              </h2>
              <p className="text-gray-900 text-xl font-bold mb-4">
                Time profissional • Segurança garantida • Drops confirmados
              </p>
              <div className="flex items-center justify-center gap-4 text-lg font-bold text-gray-900">
                <span>📱 Discord: @vanIm</span>
                <span>•</span>
                <span>⏰ Carrys nas Sextas-feiras</span>
              </div>
              <p className="text-red-700 font-black text-2xl mt-4 animate-pulse">
                ⚡ VAGAS LIMITADAS! NÃO PERCA ESSA OPORTUNIDADE!
              </p>
            </div>
          </div>
        </div>

        {/* Botão para Download */}
        <div className="text-center">
          <button
            onClick={() => {
              window.print();
            }}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-black text-xl rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            📸 SALVAR IMAGEM (Print Screen)
          </button>
          <p className="text-white mt-2 text-sm">Use Win+Shift+S para capturar a arte</p>
        </div>
      </div>
    </div>
  )
}

