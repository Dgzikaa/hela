'use client'

import { Star, Zap } from 'lucide-react'

export default function DivulgacaoCarry() {
  // Itens Godly
  const itensGodly = [
    { id: 17200, nome: 'Símbolo do Deus-Sol' },
    { id: 17201, nome: 'Foice da Deusa' },
    { id: 17202, nome: 'Ombreiras do Velgaruth' },
    { id: 17203, nome: 'Conquista 100pts' },
    { id: 17204, nome: 'Item Godly' },
    { id: 17206, nome: 'Item Godly' },
    { id: 17208, nome: 'Item Godly' }
  ]

  // Bosses
  const bosses = [
    { nome: 'Freylith', mobId: 21857, numero: 1 },
    { nome: 'Tyrgrim', mobId: 20431, numero: 2 },
    { nome: 'Skollgrim', mobId: 28292, numero: 3 },
    { nome: 'Baldira', mobId: 21856, numero: 4 },
    { nome: 'Thorvald', mobId: 20433, numero: 5 },
    { nome: 'Glacius', mobId: 21858, numero: 6 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 p-4 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        {/* Card Principal */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl overflow-hidden shadow-2xl border-4 border-yellow-400">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>

          <div className="relative z-10 p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Star className="w-10 h-10 text-yellow-400 animate-pulse" />
                <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400">
                  CARRY HELA
                </h1>
                <Star className="w-10 h-10 text-yellow-400 animate-pulse" />
              </div>
              <p className="text-3xl font-black text-white mb-3">
                ⚔️ COMPRE SEU CARRY ⚔️
              </p>
              <div className="inline-block bg-red-600 text-white px-6 py-2 rounded-full text-xl font-black animate-pulse">
                🔥 VAGAS DISPONÍVEIS 🔥
              </div>
            </div>

            {/* Itens Godly */}
            <div className="mb-6">
              <h2 className="text-3xl font-black text-yellow-400 text-center mb-4 flex items-center justify-center gap-3">
                <Zap className="w-8 h-8" />
                ITENS GODLY
                <Zap className="w-8 h-8" />
              </h2>
              
              <div className="grid grid-cols-4 gap-3 mb-4">
                {itensGodly.slice(0, 4).map((item) => (
                  <div key={item.id} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl blur opacity-40 group-hover:opacity-70 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-3 border-2 border-yellow-400 aspect-square flex items-center justify-center">
                      <img 
                        src={`https://api.ragnatales.com.br/database/item/collection?nameid=${item.id}`}
                        alt={item.nome}
                        className="w-full h-full object-contain drop-shadow-2xl"
                        onError={(e) => {
                          // Fallback se API falhar
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {itensGodly.slice(4).map((item) => (
                  <div key={item.id} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl blur opacity-40 group-hover:opacity-70 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-3 border-2 border-yellow-400 aspect-square flex items-center justify-center">
                      <img 
                        src={`https://api.ragnatales.com.br/database/item/collection?nameid=${item.id}`}
                        alt={item.nome}
                        className="w-full h-full object-contain drop-shadow-2xl"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bosses */}
            <div className="mb-6">
              <h2 className="text-3xl font-black text-yellow-400 text-center mb-4">
                ⚔️ BOSSES DISPONÍVEIS ⚔️
              </h2>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                {bosses.slice(0, 3).map((boss) => (
                  <div key={boss.numero} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-3 border-2 border-yellow-400 text-center">
                    <img 
                      src={`https://api.ragnatales.com.br/database/mob/image?mob_id=${boss.mobId}`}
                      alt={boss.nome}
                      className="w-20 h-20 mx-auto object-contain mb-2"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <p className="text-white font-bold text-sm">{boss.nome}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {bosses.slice(3).map((boss) => (
                  <div key={boss.numero} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-3 border-2 border-yellow-400 text-center">
                    <img 
                      src={`https://api.ragnatales.com.br/database/mob/image?mob_id=${boss.mobId}`}
                      alt={boss.nome}
                      className="w-20 h-20 mx-auto object-contain mb-2"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <p className="text-white font-bold text-sm">{boss.nome}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hela Destaque */}
            <div className="mb-6 bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-6 border-4 border-purple-400 text-center">
              <div className="flex items-center justify-center gap-4">
                <img 
                  src="https://api.ragnatales.com.br/database/mob/image?mob_id=28221"
                  alt="Hela"
                  className="w-24 h-24 object-contain drop-shadow-2xl"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="text-left">
                  <h3 className="text-3xl font-black text-yellow-300 mb-1">HELA</h3>
                  <p className="text-white text-lg font-bold">Deusa da Morte</p>
                  <p className="text-yellow-400 text-sm">Boss Especial</p>
                </div>
              </div>
            </div>

            {/* CTA - Discord Bot */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-center border-4 border-blue-400">
              <h2 className="text-3xl font-black text-white mb-3">
                🤖 ENTRE EM CONTATO COM NOSSO BOT
              </h2>
              <p className="text-white text-xl font-bold mb-3">
                Digite <span className="bg-yellow-400 text-black px-3 py-1 rounded font-black">!carry</span> no chat
              </p>
              <div className="bg-white/20 rounded-xl p-3">
                <p className="text-yellow-300 font-black text-lg">
                  ⚡ Atendimento Rápido • Segurança Garantida • Time Profissional
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-yellow-400 text-sm font-bold">
                Carrys realizados nas Sextas-feiras • Vagas Limitadas
              </p>
            </div>
          </div>
        </div>

        {/* Botão Print */}
        <div className="text-center mt-4">
          <p className="text-white font-bold mb-2">
            📸 Use Win+Shift+S para capturar e postar no Discord
          </p>
        </div>
      </div>
    </div>
  )
}
