'use client'

export default function DivulgacaoCarry() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        {/* Banner Compacto */}
        <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border-4 border-yellow-500 shadow-2xl">
          
          {/* Layout em Grid */}
          <div className="grid grid-cols-2 gap-0">
            
            {/* LADO ESQUERDO - Hela Grande + Itens Godly */}
            <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-900/30 to-transparent">
              <img 
                src="/images/bosses/hela.gif"
                alt="Hela"
                className="w-full max-w-xs h-auto object-contain drop-shadow-2xl mb-4"
                onError={(e) => {
                  e.currentTarget.src = 'https://api.ragnatales.com.br/database/mob/image?mob_id=28221';
                }}
              />
              
              {/* Itens Godly Pequenos */}
              <div className="w-full">
                <p className="text-yellow-400 font-bold text-xs text-center mb-2">💎 ITENS GODLY</p>
                <div className="grid grid-cols-4 gap-1">
                  {[17200, 17201, 17202, 17203].map((itemId) => (
                    <div key={itemId} className="bg-gray-800/50 rounded border border-yellow-600/30 p-1">
                      <img 
                        src={`https://api.ragnatales.com.br/database/item/collection?nameid=${itemId}`}
                        alt={`Godly ${itemId}`}
                        className="w-full h-8 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  {[17204, 17206, 17208].map((itemId) => (
                    <div key={itemId} className="bg-gray-800/50 rounded border border-yellow-600/30 p-1">
                      <img 
                        src={`https://api.ragnatales.com.br/database/item/collection?nameid=${itemId}`}
                        alt={`Godly ${itemId}`}
                        className="w-full h-8 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* LADO DIREITO - Texto + Bosses */}
            <div className="p-8 flex flex-col justify-center">
              
              {/* Texto Principal */}
              <div className="text-center mb-8">
                <h1 className="text-5xl font-black text-yellow-400 mb-3 leading-tight" style={{textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000'}}>
                  CARRY TORMENTA<br/>DEUSA HELA
                </h1>
                <p className="text-2xl font-black text-white mb-2" style={{textShadow: '2px 2px 0px #000'}}>
                  GODLY + FORÇA HERÓICA
                </p>
                <p className="text-xl font-black text-yellow-300 mb-4" style={{textShadow: '2px 2px 0px #000'}}>
                  + VISUAL EXCLUSIVO!!
                </p>
                <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-xl border-2 border-blue-400">
                  <p className="text-white font-black text-2xl">
                    🛒 COMPRE CONOSCO
                  </p>
                </div>
              </div>

              {/* Grid de Bosses 3x2 */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { mobId: 21857, nome: 'Freylith', img: 'freylith.gif' },
                  { mobId: 20431, nome: 'Tyrgrim', img: 'tyrgrim.gif' },
                  { mobId: 28292, nome: 'Skollgrim', img: 'skollgrim.gif' },
                  { mobId: 21856, nome: 'Baldira', img: 'baldira.gif' },
                  { mobId: 20433, nome: 'Thorvald', img: 'thorvald.gif' },
                  { mobId: 21858, nome: 'Glacius', img: 'glacius.gif' }
                ].map((boss, idx) => (
                  <div key={idx} className="bg-gray-700/50 rounded-lg p-2 border-2 border-gray-600 hover:border-yellow-500 transition-colors">
                    <img 
                      src={`/images/bosses/${boss.img}`}
                      alt={boss.nome}
                      className="w-full h-16 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = `https://api.ragnatales.com.br/database/mob/image?mob_id=${boss.mobId}`;
                      }}
                    />
                    <p className="text-white text-xs text-center font-bold mt-1">{boss.nome}</p>
                  </div>
                ))}
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
