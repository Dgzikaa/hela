'use client'

import { useState } from 'react'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { 
  Sword, 
  Wand2, 
  ArrowLeft,
  Calculator,
  Info,
  Zap,
  Shield,
  Target,
  Flame,
  Droplets,
  Wind,
  Mountain,
  Skull,
  Heart,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { ToolsLayout } from '../components/ToolsLayout'

// Tipos de dano
type TipoDano = 'fisico' | 'magico'

// Elementos
const ELEMENTOS = [
  { id: 'neutro', nome: 'Neutro', cor: 'slate', icon: Target },
  { id: 'fogo', nome: 'Fogo', cor: 'red', icon: Flame },
  { id: 'agua', nome: 'Água', cor: 'blue', icon: Droplets },
  { id: 'vento', nome: 'Vento', cor: 'emerald', icon: Wind },
  { id: 'terra', nome: 'Terra', cor: 'amber', icon: Mountain },
  { id: 'sombrio', nome: 'Sombrio', cor: 'purple', icon: Skull },
  { id: 'sagrado', nome: 'Sagrado', cor: 'yellow', icon: Sparkles },
  { id: 'fantasma', nome: 'Fantasma', cor: 'indigo', icon: Wand2 },
  { id: 'veneno', nome: 'Veneno', cor: 'lime', icon: Droplets },
  { id: 'maldito', nome: 'Maldito', cor: 'pink', icon: Heart },
]

// Raças
const RACAS = [
  { id: 'humano', nome: 'Humano' },
  { id: 'anjo', nome: 'Anjo' },
  { id: 'bruto', nome: 'Bruto' },
  { id: 'demonio', nome: 'Demônio' },
  { id: 'dragao', nome: 'Dragão' },
  { id: 'peixe', nome: 'Peixe' },
  { id: 'formless', nome: 'Formless' },
  { id: 'inseto', nome: 'Inseto' },
  { id: 'planta', nome: 'Planta' },
  { id: 'morto-vivo', nome: 'Morto-Vivo' },
]

// Tamanhos
const TAMANHOS = [
  { id: 'pequeno', nome: 'Pequeno' },
  { id: 'medio', nome: 'Médio' },
  { id: 'grande', nome: 'Grande' },
]

export default function CalculadoraDanoPage() {
  const [tipoDano, setTipoDano] = useState<TipoDano>('fisico')
  
  // Atributos
  const [str, setStr] = useState(100)
  const [agi, setAgi] = useState(100)
  const [dex, setDex] = useState(100)
  const [int, setInt] = useState(100)
  const [luk, setLuk] = useState(100)
  
  // Stats de equipamento
  const [atk, setAtk] = useState(500)
  const [matk, setMatk] = useState(500)
  const [refinamento, setRefinamento] = useState(15)
  
  // Modificadores
  const [bonusDano, setBonusDano] = useState(0) // %
  const [bonusElemento, setBonusElemento] = useState(0) // %
  const [bonusRaca, setBonusRaca] = useState(0) // %
  const [bonusTamanho, setBonusTamanho] = useState(0) // %
  const [bonusCritico, setBonusCritico] = useState(0) // %
  
  // Alvo
  const [defAlvo, setDefAlvo] = useState(100)
  const [mdefAlvo, setMdefAlvo] = useState(100)
  const [elementoAlvo, setElementoAlvo] = useState('neutro')
  const [racaAlvo, setRacaAlvo] = useState('humano')
  const [tamanhoAlvo, setTamanhoAlvo] = useState('medio')
  
  // Skill
  const [skillMultiplier, setSkillMultiplier] = useState(1000) // % da skill
  
  /**
   * NOTA: As fórmulas abaixo são APROXIMAÇÕES baseadas no RO original.
   * O RagnaTales pode ter fórmulas diferentes!
   * 
   * Quando tivermos acesso à calculadora real ou à fórmula exata,
   * podemos ajustar os cálculos aqui.
   */
  
  // Cálculo de dano físico (aproximado)
  const calcularDanoFisico = () => {
    // ATK base
    const atkBase = atk + (str * 1) + (dex * 0.2)
    
    // Skill damage
    const danoSkill = atkBase * (skillMultiplier / 100)
    
    // Redução por DEF (simplificado)
    const reducaoDef = Math.max(0.1, 1 - (defAlvo / 1000))
    
    // Modificadores
    const modTotal = 1 + 
      (bonusDano / 100) + 
      (bonusElemento / 100) + 
      (bonusRaca / 100) + 
      (bonusTamanho / 100)
    
    // Dano final
    const danoFinal = Math.round(danoSkill * reducaoDef * modTotal)
    
    // Dano crítico
    const danoCritico = Math.round(danoFinal * (1.4 + bonusCritico / 100))
    
    return {
      atkBase: Math.round(atkBase),
      danoSkill: Math.round(danoSkill),
      danoFinal,
      danoCritico,
      reducaoDef: Math.round((1 - reducaoDef) * 100)
    }
  }
  
  // Cálculo de dano mágico (aproximado)
  const calcularDanoMagico = () => {
    // MATK base
    const matkBase = matk + (int * 1.5) + (dex * 0.1)
    
    // Skill damage
    const danoSkill = matkBase * (skillMultiplier / 100)
    
    // Redução por MDEF (simplificado)
    const reducaoMdef = Math.max(0.1, 1 - (mdefAlvo / 1000))
    
    // Modificadores
    const modTotal = 1 + 
      (bonusDano / 100) + 
      (bonusElemento / 100) + 
      (bonusRaca / 100)
    
    // Dano final
    const danoFinal = Math.round(danoSkill * reducaoMdef * modTotal)
    
    return {
      matkBase: Math.round(matkBase),
      danoSkill: Math.round(danoSkill),
      danoFinal,
      reducaoMdef: Math.round((1 - reducaoMdef) * 100)
    }
  }
  
  const resultadoFisico = calcularDanoFisico()
  const resultadoMagico = calcularDanoMagico()
  const resultado = tipoDano === 'fisico' ? resultadoFisico : resultadoMagico
  
  const formatNumber = (n: number) => n.toLocaleString('pt-BR')

  return (
    <ToolsLayout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3 text-gray-900">
              <Sword className="w-8 h-8 text-purple-600" />
              Calculadora de Dano
            </h1>
            <p className="text-gray-500 mt-1">Estime seu dano físico e mágico</p>
          </div>
        
        {/* Aviso */}
        <Card className="p-4 bg-amber-50 border-amber-200 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-amber-800 font-medium">⚠️ Versão Beta</p>
              <p className="text-sm text-amber-700">
                Esta calculadora usa fórmulas aproximadas baseadas no RO original. 
                O RagnaTales pode ter fórmulas diferentes. Quando tivermos acesso às fórmulas exatas, atualizaremos!
              </p>
            </div>
          </div>
        </Card>
        
        {/* Tabs Físico/Mágico */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTipoDano('fisico')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              tipoDano === 'fisico' 
                ? 'bg-gradient-to-r from-red-500 to-orange-600 text-gray-900 shadow-lg shadow-red-500/25' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Sword className="w-5 h-5" />
            Dano Físico
          </button>
          <button
            onClick={() => setTipoDano('magico')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              tipoDano === 'magico' 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-gray-900 shadow-lg shadow-blue-500/25' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Wand2 className="w-5 h-5" />
            Dano Mágico
          </button>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Coluna 1: Stats */}
          <Card className="p-4 bg-white border-gray-200 shadow-sm/50">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Atributos
            </h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">STR</label>
                <Input
                  type="number"
                  value={str}
                  onChange={(e) => setStr(parseInt(e.target.value) || 0)}
                  className="bg-slate-800"
                />
              </div>
              
              {tipoDano === 'magico' && (
                <div>
                  <label className="text-xs text-gray-500">INT</label>
                  <Input
                    type="number"
                    value={int}
                    onChange={(e) => setInt(parseInt(e.target.value) || 0)}
                    className="bg-slate-800"
                  />
                </div>
              )}
              
              <div>
                <label className="text-xs text-gray-500">DEX</label>
                <Input
                  type="number"
                  value={dex}
                  onChange={(e) => setDex(parseInt(e.target.value) || 0)}
                  className="bg-slate-800"
                />
              </div>
              
              {tipoDano === 'fisico' && (
                <div>
                  <label className="text-xs text-gray-500">LUK</label>
                  <Input
                    type="number"
                    value={luk}
                    onChange={(e) => setLuk(parseInt(e.target.value) || 0)}
                    className="bg-slate-800"
                  />
                </div>
              )}
              
              <div className="pt-2 border-t border-slate-700">
                <label className="text-xs text-gray-500">
                  {tipoDano === 'fisico' ? 'ATK (equipamento)' : 'MATK (equipamento)'}
                </label>
                <Input
                  type="number"
                  value={tipoDano === 'fisico' ? atk : matk}
                  onChange={(e) => tipoDano === 'fisico' 
                    ? setAtk(parseInt(e.target.value) || 0)
                    : setMatk(parseInt(e.target.value) || 0)
                  }
                  className="bg-slate-800"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-500">Multiplicador da Skill (%)</label>
                <Input
                  type="number"
                  value={skillMultiplier}
                  onChange={(e) => setSkillMultiplier(parseInt(e.target.value) || 0)}
                  className="bg-slate-800"
                />
                <p className="text-xs text-gray-400 mt-1">Ex: 1000% = 10x o dano base</p>
              </div>
            </div>
          </Card>
          
          {/* Coluna 2: Modificadores */}
          <Card className="p-4 bg-white border-gray-200 shadow-sm/50">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Modificadores (%)
            </h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Bônus de Dano Geral</label>
                <Input
                  type="number"
                  value={bonusDano}
                  onChange={(e) => setBonusDano(parseInt(e.target.value) || 0)}
                  className="bg-slate-800"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-500">Bônus vs Elemento</label>
                <Input
                  type="number"
                  value={bonusElemento}
                  onChange={(e) => setBonusElemento(parseInt(e.target.value) || 0)}
                  className="bg-slate-800"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-500">Bônus vs Raça</label>
                <Input
                  type="number"
                  value={bonusRaca}
                  onChange={(e) => setBonusRaca(parseInt(e.target.value) || 0)}
                  className="bg-slate-800"
                />
              </div>
              
              {tipoDano === 'fisico' && (
                <>
                  <div>
                    <label className="text-xs text-gray-500">Bônus vs Tamanho</label>
                    <Input
                      type="number"
                      value={bonusTamanho}
                      onChange={(e) => setBonusTamanho(parseInt(e.target.value) || 0)}
                      className="bg-slate-800"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500">Bônus Crítico</label>
                    <Input
                      type="number"
                      value={bonusCritico}
                      onChange={(e) => setBonusCritico(parseInt(e.target.value) || 0)}
                      className="bg-slate-800"
                    />
                  </div>
                </>
              )}
            </div>
            
            <h2 className="font-bold text-gray-900 mt-6 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Alvo
            </h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">
                  {tipoDano === 'fisico' ? 'DEF do Alvo' : 'MDEF do Alvo'}
                </label>
                <Input
                  type="number"
                  value={tipoDano === 'fisico' ? defAlvo : mdefAlvo}
                  onChange={(e) => tipoDano === 'fisico'
                    ? setDefAlvo(parseInt(e.target.value) || 0)
                    : setMdefAlvo(parseInt(e.target.value) || 0)
                  }
                  className="bg-slate-800"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-500">Elemento</label>
                <select
                  value={elementoAlvo}
                  onChange={(e) => setElementoAlvo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-900"
                >
                  {ELEMENTOS.map(el => (
                    <option key={el.id} value={el.id}>{el.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-xs text-gray-500">Raça</label>
                <select
                  value={racaAlvo}
                  onChange={(e) => setRacaAlvo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-900"
                >
                  {RACAS.map(r => (
                    <option key={r.id} value={r.id}>{r.nome}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
          
          {/* Coluna 3: Resultado */}
          <Card className={`p-6 ${
            tipoDano === 'fisico' 
              ? 'bg-gradient-to-br from-red-900/30 to-slate-900/50 border-red-500/30' 
              : 'bg-gradient-to-br from-blue-900/30 to-slate-900/50 border-blue-500/30'
          }`}>
            <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-xl">
              <Calculator className="w-6 h-6" />
              Resultado
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-sm text-gray-500">
                  {tipoDano === 'fisico' ? 'ATK Base' : 'MATK Base'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(tipoDano === 'fisico' ? resultadoFisico.atkBase : resultadoMagico.matkBase)}
                </p>
              </div>
              
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-sm text-gray-500">Dano da Skill ({skillMultiplier}%)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(resultado.danoSkill)}
                </p>
              </div>
              
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-sm text-gray-500">
                  Redução por {tipoDano === 'fisico' ? 'DEF' : 'MDEF'}
                </p>
                <p className="text-lg font-bold text-red-400">
                  -{tipoDano === 'fisico' ? resultadoFisico.reducaoDef : resultadoMagico.reducaoMdef}%
                </p>
              </div>
              
              <div className={`p-4 rounded-lg ${
                tipoDano === 'fisico' ? 'bg-red-500/20 border border-red-500/30' : 'bg-blue-500/20 border border-blue-500/30'
              }`}>
                <p className="text-sm text-gray-600">Dano Final</p>
                <p className={`text-4xl font-bold ${tipoDano === 'fisico' ? 'text-red-400' : 'text-blue-400'}`}>
                  {formatNumber(resultado.danoFinal)}
                </p>
              </div>
              
              {tipoDano === 'fisico' && (
                <div className="p-4 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                  <p className="text-sm text-gray-600">Dano Crítico</p>
                  <p className="text-3xl font-bold text-amber-400">
                    {formatNumber(resultadoFisico.danoCritico)}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
        
          {/* Footer */}
          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>⚠️ Valores aproximados - fórmulas podem diferir do jogo real</p>
            <p>Contribua com as fórmulas corretas do RagnaTales!</p>
          </div>
        </div>
      </div>
    </ToolsLayout>
  )
}

