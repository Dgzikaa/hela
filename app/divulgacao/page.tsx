'use client'

export default function DivulgacaoCarry() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        {/* Banner Compacto */}
        <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border-4 border-yellow-500 shadow-2xl">
          
          {/* Layout em Grid */}
          <div className="grid grid-cols-2 gap-0">
            
            {/* LADO ESQUERDO - Hela Grande */}
            <div className="flex items-center justify-center p-8 bg-gradient-to-br from-purple-900/30 to-transparent">
              <img 
                src="https://api.ragnatales.com.br/database/mob/image?mob_id=28221"
                alt="Hela"
                className="w-full max-w-xs h-auto object-contain drop-shadow-2xl"
                onError={(e) => {
                  // Se não carregar, mostrar placeholder
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23333" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23666" font-size="20"%3EHELA%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>

            {/* LADO DIREITO - Texto + Bosses */}
            <div className="p-8 flex flex-col justify-between">
              
              {/* Texto Principal */}
              <div className="text-center mb-6">
                <h1 className="text-5xl font-black text-yellow-400 mb-3 leading-tight" style={{textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000'}}>
                  CARRY TORMENTA<br/>DEUSA HELA
                </h1>
                <p className="text-2xl font-black text-white mb-2" style={{textShadow: '2px 2px 0px #000'}}>
                  GODLY + FORÇA HERÓICA
                </p>
                <p className="text-xl font-black text-yellow-300" style={{textShadow: '2px 2px 0px #000'}}>
                  + VISUAL EXCLUSIVO!!
                </p>
              </div>

              {/* Grid de Bosses 3x2 */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { mobId: 21857, nome: 'Freylith' },
                  { mobId: 20431, nome: 'Tyrgrim' },
                  { mobId: 28292, nome: 'Skollgrim' },
                  { mobId: 21856, nome: 'Baldira' },
                  { mobId: 20433, nome: 'Thorvald' },
                  { mobId: 21858, nome: 'Glacius' }
                ].map((boss, idx) => (
                  <div key={idx} className="bg-gray-700/50 rounded-lg p-2 border-2 border-gray-600 hover:border-yellow-500 transition-colors">
                    <img 
                      src={`https://api.ragnatales.com.br/database/mob/image?mob_id=${boss.mobId}`}
                      alt={boss.nome}
                      className="w-full h-16 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23444" width="64" height="64"/%3E%3C/svg%3E';
                      }}
                    />
                    <p className="text-white text-xs text-center font-bold mt-1">{boss.nome}</p>
                  </div>
                ))}
              </div>

              {/* CTA Bot */}
              <div className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-center border-2 border-blue-400">
                <p className="text-white font-black text-xl mb-1">
                  🤖 COMPRE COM NOSSO BOT
                </p>
                <p className="text-yellow-300 font-bold">
                  Digite: <span className="bg-black/30 px-2 py-1 rounded">!carry</span>
                </p>
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div className="bg-black/50 py-2 px-4 text-center border-t-2 border-yellow-500">
            <p className="text-yellow-400 font-bold text-sm">
              ⚡ TIME PROFISSIONAL • SEGURANÇA GARANTIDA • VAGAS LIMITADAS ⚡
            </p>
          </div>
        </div>

        {/* Instrução */}
        <div className="text-center mt-4">
          <p className="text-gray-400 text-sm">
            📸 Pressione <kbd className="bg-gray-700 px-2 py-1 rounded text-white">Win+Shift+S</kbd> para capturar
          </p>
        </div>
      </div>
    </div>
  )
}
