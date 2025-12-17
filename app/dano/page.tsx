'use client'

import { useState, useMemo } from 'react'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { 
  Sword, 
  Shield,
  Target,
  Flame,
  Zap,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
  Crosshair,
  Timer,
  Percent
} from 'lucide-react'
import { ToolsLayout } from '../components/ToolsLayout'

// ============================================
// CONSTANTES E TABELAS DO RAGNAROK
// ============================================

// Tipos de arma e seus modificadores de tamanho
const WEAPON_TYPES = {
  fist: { name: 'Punho (Sem arma)', level: 0, sizeModifiers: { small: 100, medium: 100, large: 100 }, btba: 1.0 },
  dagger: { name: 'Adaga', level: 1, sizeModifiers: { small: 100, medium: 75, large: 50 }, btba: 0.65 },
  sword1h: { name: 'Espada 1H', level: 3, sizeModifiers: { small: 75, medium: 100, large: 75 }, btba: 0.7 },
  sword2h: { name: 'Espada 2H', level: 3, sizeModifiers: { small: 75, medium: 75, large: 100 }, btba: 1.0 },
  spear1h: { name: 'Lança 1H', level: 3, sizeModifiers: { small: 75, medium: 75, large: 100 }, btba: 0.85 },
  spear2h: { name: 'Lança 2H', level: 3, sizeModifiers: { small: 75, medium: 75, large: 100 }, btba: 1.0 },
  axe1h: { name: 'Machado 1H', level: 3, sizeModifiers: { small: 50, medium: 75, large: 100 }, btba: 0.8 },
  axe2h: { name: 'Machado 2H', level: 3, sizeModifiers: { small: 50, medium: 75, large: 100 }, btba: 1.4 },
  mace: { name: 'Maça', level: 3, sizeModifiers: { small: 75, medium: 100, large: 100 }, btba: 0.7 },
  rod: { name: 'Cajado', level: 2, sizeModifiers: { small: 100, medium: 100, large: 100 }, btba: 0.65 },
  bow: { name: 'Arco', level: 3, sizeModifiers: { small: 100, medium: 100, large: 75 }, btba: 1.0 },
  katar: { name: 'Katar', level: 3, sizeModifiers: { small: 75, medium: 100, large: 75 }, btba: 0.8 },
  book: { name: 'Livro', level: 3, sizeModifiers: { small: 100, medium: 100, large: 50 }, btba: 0.65 },
  knuckle: { name: 'Soqueira', level: 3, sizeModifiers: { small: 100, medium: 75, large: 50 }, btba: 0.7 },
  instrument: { name: 'Instrumento Musical', level: 3, sizeModifiers: { small: 75, medium: 100, large: 75 }, btba: 0.9 },
  whip: { name: 'Chicote', level: 3, sizeModifiers: { small: 75, medium: 100, large: 50 }, btba: 0.9 },
  gun: { name: 'Pistola', level: 3, sizeModifiers: { small: 100, medium: 100, large: 100 }, btba: 0.7 },
  rifle: { name: 'Rifle', level: 3, sizeModifiers: { small: 100, medium: 100, large: 100 }, btba: 1.1 },
  gatling: { name: 'Metralhadora', level: 3, sizeModifiers: { small: 100, medium: 100, large: 100 }, btba: 0.6 },
  shotgun: { name: 'Shotgun', level: 3, sizeModifiers: { small: 100, medium: 100, large: 100 }, btba: 1.2 },
  grenade: { name: 'Granada', level: 3, sizeModifiers: { small: 100, medium: 100, large: 100 }, btba: 1.6 },
  huuma: { name: 'Huuma Shuriken', level: 4, sizeModifiers: { small: 75, medium: 75, large: 100 }, btba: 1.1 },
}

// Tabela elemental (atacante x defensor) - valores em %
// Rows: Neutral, Water, Earth, Fire, Wind, Poison, Holy, Shadow, Ghost, Undead
// Cols: Neutral1-4, Water1-4, Earth1-4, Fire1-4, Wind1-4, Poison1-4, Holy1-4, Shadow1-4, Ghost1-4, Undead1-4
const ELEMENTAL_TABLE: Record<string, Record<string, number[]>> = {
  neutral: {
    neutral: [100, 100, 100, 100],
    water: [100, 100, 100, 100],
    earth: [100, 100, 100, 100],
    fire: [100, 100, 100, 100],
    wind: [100, 100, 100, 100],
    poison: [100, 100, 100, 100],
    holy: [100, 100, 100, 100],
    shadow: [100, 100, 100, 100],
    ghost: [25, 25, 25, 25],
    undead: [100, 100, 100, 100],
  },
  water: {
    neutral: [100, 100, 100, 100],
    water: [25, 0, -25, -50],
    earth: [100, 100, 100, 100],
    fire: [150, 175, 200, 200],
    wind: [90, 80, 70, 60],
    poison: [100, 75, 50, 25],
    holy: [100, 100, 100, 100],
    shadow: [100, 100, 100, 100],
    ghost: [100, 100, 100, 100],
    undead: [100, 100, 100, 100],
  },
  earth: {
    neutral: [100, 100, 100, 100],
    water: [100, 100, 100, 100],
    earth: [100, 50, 0, -25],
    fire: [90, 80, 70, 60],
    wind: [150, 175, 200, 200],
    poison: [125, 150, 175, 200],
    holy: [100, 100, 100, 100],
    shadow: [100, 100, 100, 100],
    ghost: [100, 100, 100, 100],
    undead: [100, 100, 100, 100],
  },
  fire: {
    neutral: [100, 100, 100, 100],
    water: [90, 80, 70, 60],
    earth: [150, 175, 200, 200],
    fire: [25, 0, -25, -50],
    wind: [100, 100, 100, 100],
    poison: [100, 75, 50, 25],
    holy: [100, 100, 100, 100],
    shadow: [100, 100, 100, 100],
    ghost: [100, 100, 100, 100],
    undead: [125, 150, 175, 200],
  },
  wind: {
    neutral: [100, 100, 100, 100],
    water: [150, 175, 200, 200],
    earth: [90, 80, 70, 60],
    fire: [100, 100, 100, 100],
    wind: [25, 0, -25, -50],
    poison: [100, 75, 50, 25],
    holy: [100, 100, 100, 100],
    shadow: [100, 100, 100, 100],
    ghost: [100, 100, 100, 100],
    undead: [100, 100, 100, 100],
  },
  poison: {
    neutral: [100, 100, 100, 100],
    water: [100, 100, 100, 100],
    earth: [100, 100, 100, 100],
    fire: [100, 100, 100, 100],
    wind: [100, 100, 100, 100],
    poison: [0, 0, 0, -25],
    holy: [100, 75, 50, 25],
    shadow: [50, 25, 0, -25],
    ghost: [100, 100, 100, 100],
    undead: [-25, -50, -75, -100],
  },
  holy: {
    neutral: [100, 100, 100, 100],
    water: [100, 100, 100, 100],
    earth: [100, 100, 100, 100],
    fire: [100, 100, 100, 100],
    wind: [100, 100, 100, 100],
    poison: [100, 75, 50, 25],
    holy: [0, -25, -50, -75],
    shadow: [125, 150, 175, 200],
    ghost: [100, 100, 100, 100],
    undead: [125, 150, 175, 200],
  },
  shadow: {
    neutral: [100, 100, 100, 100],
    water: [100, 100, 100, 100],
    earth: [100, 100, 100, 100],
    fire: [100, 100, 100, 100],
    wind: [100, 100, 100, 100],
    poison: [50, 25, 0, -25],
    holy: [125, 150, 175, 200],
    shadow: [0, -25, -50, -75],
    ghost: [100, 100, 100, 100],
    undead: [-25, -50, -75, -100],
  },
  ghost: {
    neutral: [100, 100, 100, 100],
    water: [100, 100, 100, 100],
    earth: [100, 100, 100, 100],
    fire: [100, 100, 100, 100],
    wind: [100, 100, 100, 100],
    poison: [100, 100, 100, 100],
    holy: [100, 100, 100, 100],
    shadow: [100, 100, 100, 100],
    ghost: [125, 150, 175, 200],
    undead: [100, 100, 100, 100],
  },
  undead: {
    neutral: [100, 100, 100, 100],
    water: [100, 100, 100, 100],
    earth: [100, 100, 100, 100],
    fire: [125, 150, 175, 200],
    wind: [100, 100, 100, 100],
    poison: [-25, -50, -75, -100],
    holy: [150, 175, 200, 200],
    shadow: [0, -25, -50, -75],
    ghost: [100, 100, 100, 100],
    undead: [0, -25, -50, -75],
  },
}

const ELEMENTS = [
  { id: 'neutral', name: 'Neutro', color: 'slate' },
  { id: 'water', name: 'Água', color: 'blue' },
  { id: 'earth', name: 'Terra', color: 'amber' },
  { id: 'fire', name: 'Fogo', color: 'red' },
  { id: 'wind', name: 'Vento', color: 'emerald' },
  { id: 'poison', name: 'Veneno', color: 'lime' },
  { id: 'holy', name: 'Sagrado', color: 'yellow' },
  { id: 'shadow', name: 'Sombrio', color: 'purple' },
  { id: 'ghost', name: 'Fantasma', color: 'indigo' },
  { id: 'undead', name: 'Morto-Vivo', color: 'zinc' },
]

const SIZES = [
  { id: 'small', name: 'Pequeno' },
  { id: 'medium', name: 'Médio' },
  { id: 'large', name: 'Grande' },
]

const RACES = [
  { id: 'formless', name: 'Amorfo' },
  { id: 'undead', name: 'Morto-Vivo' },
  { id: 'brute', name: 'Bruto' },
  { id: 'plant', name: 'Planta' },
  { id: 'insect', name: 'Inseto' },
  { id: 'fish', name: 'Peixe' },
  { id: 'demon', name: 'Demônio' },
  { id: 'demi-human', name: 'Demi-Humano' },
  { id: 'angel', name: 'Anjo' },
  { id: 'dragon', name: 'Dragão' },
]

// ============================================
// FUNÇÕES DE CÁLCULO
// ============================================

// Arredonda para baixo (floor)
const floor = Math.floor

// Gera número aleatório entre min e max (inclusive)
const rnd = (min: number, max: number) => min + Math.random() * (max - min)

// Bônus de refino por nível de arma
function getRefineBonus(weaponLevel: number, refine: number): number {
  const bonusPerRefine = [0, 2, 3, 5, 7] // Level 0, 1, 2, 3, 4
  return (bonusPerRefine[weaponLevel] || 0) * refine
}

// ATK de refino "Over-upgrade" (acima do seguro)
function getOverRefineAtk(weaponLevel: number, refine: number): { min: number, max: number } {
  const safeRefine = [0, 7, 6, 5, 4] // Refino seguro por nível
  const overAtkPerRefine = [0, 3, 5, 8, 14] // ATK extra por over-refine
  
  const safe = safeRefine[weaponLevel] || 0
  const overRefines = Math.max(0, refine - safe)
  const overAtk = (overAtkPerRefine[weaponLevel] || 0) * overRefines
  
  return { min: 0, max: overAtk }
}

// Calcula Base ATK (Status ATK)
function calculateBaseAtk(
  str: number,
  dex: number,
  luk: number,
  isRanged: boolean
): number {
  if (isRanged) {
    // BaseATK for missile weapons = DEX + [DEX/10]^2 + [STR/5] + [LUK/5]
    return dex + Math.pow(floor(dex / 10), 2) + floor(str / 5) + floor(luk / 5)
  } else {
    // BaseATK for melee weapons = STR + [STR/10]^2 + [DEX/5] + [LUK/5]
    return str + Math.pow(floor(str / 10), 2) + floor(dex / 5) + floor(luk / 5)
  }
}

// Calcula Weapon ATK range
function calculateWeaponAtk(
  weaponAtk: number,
  dex: number,
  weaponLevel: number,
  isCritical: boolean,
  isRanged: boolean,
  arrowAtk: number = 0
): { min: number, max: number, avg: number } {
  if (isCritical) {
    // Critical = sempre ATK máximo
    if (isRanged) {
      return { min: weaponAtk + arrowAtk, max: weaponAtk + arrowAtk, avg: weaponAtk + arrowAtk }
    }
    return { min: weaponAtk, max: weaponAtk, avg: weaponAtk }
  }
  
  if (isRanged) {
    // Bow formula (simplificada)
    const minAtk = floor(weaponAtk * 0.5) + arrowAtk
    const maxAtk = weaponAtk + arrowAtk
    return { min: minAtk, max: maxAtk, avg: (minAtk + maxAtk) / 2 }
  }
  
  // Melee: rnd(min(DEX*(0.8+0.2*WeaponLevel), ATK), ATK)
  const dexFactor = 0.8 + 0.2 * weaponLevel
  const minAtk = Math.min(floor(dex * dexFactor), weaponAtk)
  return { min: minAtk, max: weaponAtk, avg: (minAtk + weaponAtk) / 2 }
}

// Calcula Soft DEF do alvo
function calculateSoftDef(vit: number): { min: number, max: number, avg: number } {
  // Soft DEF = [VIT*0.5] + rnd([VIT*0.3], max([VIT*0.3], [VIT^2/150]-1))
  const base = floor(vit * 0.5)
  const minRnd = floor(vit * 0.3)
  const maxRnd = Math.max(floor(vit * 0.3), floor(Math.pow(vit, 2) / 150) - 1)
  
  return {
    min: base + minRnd,
    max: base + Math.max(minRnd, maxRnd),
    avg: base + (minRnd + Math.max(minRnd, maxRnd)) / 2
  }
}

// Calcula ASPD
function calculateAspd(
  weaponDelay: number,
  agi: number,
  dex: number,
  speedModifiers: number
): number {
  // ASPD = 200 - (WD - ([WD*AGI/25] + [WD*DEX/100])/10) * (1-SM)
  const wd = 50 * weaponDelay
  const agiBonus = floor(wd * agi / 25)
  const dexBonus = floor(wd * dex / 100)
  const aspd = 200 - (wd - (agiBonus + dexBonus) / 10) * (1 - speedModifiers)
  return Math.min(190, Math.max(0, aspd))
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function CalculadoraFisicoPage() {
  // ===== STATS DO PERSONAGEM =====
  const [str, setStr] = useState(120)
  const [agi, setAgi] = useState(100)
  const [vit, setVit] = useState(80)
  const [dex, setDex] = useState(100)
  const [luk, setLuk] = useState(50)
  
  // ===== ARMA =====
  const [weaponType, setWeaponType] = useState<keyof typeof WEAPON_TYPES>('sword2h')
  const [weaponAtk, setWeaponAtk] = useState(200)
  const [weaponLevel, setWeaponLevel] = useState(4)
  const [refine, setRefine] = useState(15)
  const [arrowAtk, setArrowAtk] = useState(50)
  
  // ===== ATK EXTRAS =====
  const [atkFromCards, setAtkFromCards] = useState(0)
  const [atkFromEquips, setAtkFromEquips] = useState(0)
  const [impositioManus, setImpositioManus] = useState(0)
  
  // ===== BUFFS E SKILLS =====
  const [powerThrust, setPowerThrust] = useState(0) // 0, 5, 10, 15, 20, 25%
  const [provoke, setProvoke] = useState(0) // -12 a +32%
  const [skillModifier, setSkillModifier] = useState(100) // % da skill
  
  // ===== MODIFICADORES DE DANO =====
  const [isCritical, setIsCritical] = useState(false)
  const [bonusSize, setBonusSize] = useState(0)
  const [bonusRace, setBonusRace] = useState(0)
  const [bonusElement, setBonusElement] = useState(0)
  
  // ===== ALVO =====
  const [targetHardDef, setTargetHardDef] = useState(50)
  const [targetVit, setTargetVit] = useState(100)
  const [targetElement, setTargetElement] = useState('neutral')
  const [targetElementLevel, setTargetElementLevel] = useState(1)
  const [targetSize, setTargetSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [targetRace, setTargetRace] = useState('demi-human')
  
  // ===== ELEMENTO DO ATAQUE =====
  const [attackElement, setAttackElement] = useState('neutral')
  
  // ===== ASPD =====
  const [speedModifiers, setSpeedModifiers] = useState(0)
  
  // ===== UI =====
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    stats: true,
    weapon: true,
    buffs: true,
    target: true,
    aspd: false,
    elemental: false,
  })
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }
  
  // ===== CÁLCULOS =====
  const weapon = WEAPON_TYPES[weaponType]
  const isRanged = ['bow', 'gun', 'rifle', 'gatling', 'shotgun', 'grenade'].includes(weaponType)
  
  const calculations = useMemo(() => {
    // 1. Base ATK (Status ATK)
    const baseAtk = calculateBaseAtk(str, dex, luk, isRanged)
    
    // 2. Upgrade Bonus (Refine ATK)
    const refineBonus = getRefineBonus(weaponLevel, refine)
    
    // 3. Over-refine ATK
    const overRefine = getOverRefineAtk(weaponLevel, refine)
    
    // 4. ATK de Cards + Equips + Impositio
    const bonusAtk = atkFromCards + atkFromEquips + impositioManus
    
    // 5. Weapon ATK range
    const weaponAtkResult = calculateWeaponAtk(
      weaponAtk,
      dex,
      weaponLevel,
      isCritical,
      isRanged,
      isRanged ? arrowAtk : 0
    )
    
    // 6. Size Modifier
    const sizeModifier = weapon.sizeModifiers[targetSize] / 100
    
    // 7. Total ATK antes de multiplicadores
    // BaseATK + RefineBonus + BonusATK + WeaponATK * SizeModifier
    const totalAtkMin = baseAtk + refineBonus + bonusAtk + floor(weaponAtkResult.min * sizeModifier) + overRefine.min
    const totalAtkMax = baseAtk + refineBonus + bonusAtk + floor(weaponAtkResult.max * sizeModifier) + overRefine.max
    const totalAtkAvg = (totalAtkMin + totalAtkMax) / 2
    
    // 8. Skill Modifiers (Power Thrust + Provoke + Skill%)
    const totalSkillMod = (100 + powerThrust + provoke + (skillModifier - 100)) / 100
    
    // 9. Aplicar skill modifiers
    const afterSkillMin = floor(totalAtkMin * totalSkillMod)
    const afterSkillMax = floor(totalAtkMax * totalSkillMod)
    
    // 10. Hard DEF reduction
    const hardDefReduction = 1 - targetHardDef / 100
    const afterHardDefMin = floor(afterSkillMin * (isCritical ? 1 : hardDefReduction))
    const afterHardDefMax = floor(afterSkillMax * (isCritical ? 1 : hardDefReduction))
    
    // 11. Soft DEF (VIT DEF)
    const softDef = calculateSoftDef(targetVit)
    const effectiveSoftDef = isCritical ? 0 : softDef.avg
    const afterSoftDefMin = Math.max(1, afterHardDefMin - effectiveSoftDef)
    const afterSoftDefMax = Math.max(1, afterHardDefMax - effectiveSoftDef)
    
    // 12. Elemental Modifier
    const elementalMod = ELEMENTAL_TABLE[attackElement]?.[targetElement]?.[targetElementLevel - 1] ?? 100
    const afterElementalMin = floor(afterSoftDefMin * elementalMod / 100)
    const afterElementalMax = floor(afterSoftDefMax * elementalMod / 100)
    
    // 13. Damage Bonuses (multiplicativos entre tipos diferentes)
    const sizeBonusMod = 1 + bonusSize / 100
    const raceBonusMod = 1 + bonusRace / 100
    const elementBonusMod = 1 + bonusElement / 100
    const totalBonusMod = sizeBonusMod * raceBonusMod * elementBonusMod
    
    const finalDamageMin = Math.max(1, floor(afterElementalMin * totalBonusMod))
    const finalDamageMax = Math.max(1, floor(afterElementalMax * totalBonusMod))
    const finalDamageAvg = (finalDamageMin + finalDamageMax) / 2
    
    // ASPD
    const aspd = calculateAspd(weapon.btba, agi, dex, speedModifiers / 100)
    const attacksPerSecond = 50 / (200 - aspd)
    const dps = finalDamageAvg * attacksPerSecond
    
    return {
      baseAtk,
      refineBonus,
      overRefine,
      bonusAtk,
      weaponAtkResult,
      sizeModifier: sizeModifier * 100,
      totalAtkMin,
      totalAtkMax,
      totalAtkAvg,
      totalSkillMod: totalSkillMod * 100,
      afterSkillMin,
      afterSkillMax,
      hardDefReduction: (1 - hardDefReduction) * 100,
      afterHardDefMin,
      afterHardDefMax,
      softDef,
      afterSoftDefMin,
      afterSoftDefMax,
      elementalMod,
      afterElementalMin,
      afterElementalMax,
      sizeBonusMod: sizeBonusMod * 100,
      raceBonusMod: raceBonusMod * 100,
      elementBonusMod: elementBonusMod * 100,
      finalDamageMin,
      finalDamageMax,
      finalDamageAvg,
      aspd,
      attacksPerSecond,
      dps,
    }
  }, [
    str, agi, vit, dex, luk,
    weaponType, weaponAtk, weaponLevel, refine, arrowAtk,
    atkFromCards, atkFromEquips, impositioManus,
    powerThrust, provoke, skillModifier,
    isCritical, bonusSize, bonusRace, bonusElement,
    targetHardDef, targetVit, targetElement, targetElementLevel, targetSize,
    attackElement, speedModifiers, weapon, isRanged
  ])
  
  const formatNumber = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
  const formatDecimal = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
  
  // ===== COMPONENTE DE SEÇÃO COLAPSÁVEL =====
  const Section = ({ 
    id, 
    title, 
    icon: Icon, 
    children,
    color = 'slate'
  }: { 
    id: string
    title: string
    icon: React.ElementType
    children: React.ReactNode
    color?: string
  }) => (
    <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => toggleSection(id)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 text-${color}-500`} />
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        {expandedSections[id] ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {expandedSections[id] && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </Card>
  )

  return (
    <ToolsLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3 text-gray-900">
              <Sword className="w-8 h-8 text-red-500" />
              Calculadora de Dano Físico
            </h1>
            <p className="text-gray-500 mt-1">Fórmulas precisas do Ragnarok Online</p>
          </div>
          
          {/* Info box */}
          <Card className="p-4 bg-blue-50 border-blue-200 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Fórmulas baseadas na documentação oficial do iRO/kRO</p>
                <p className="text-blue-600 mt-1">
                  Esta calculadora implementa as fórmulas completas: BaseATK, WeaponATK, Size Modifiers, 
                  Skill Modifiers, Hard DEF, Soft DEF (VIT), Elemental Modifiers e Damage Bonuses.
                </p>
              </div>
            </div>
          </Card>
          
          <div className="grid lg:grid-cols-12 gap-6">
            {/* COLUNA ESQUERDA - INPUTS */}
            <div className="lg:col-span-5 space-y-4">
              {/* STATS */}
              <Section id="stats" title="Atributos" icon={Zap} color="yellow">
                <div className="grid grid-cols-5 gap-3 mt-4">
                  {[
                    { label: 'STR', value: str, setter: setStr, color: 'red' },
                    { label: 'AGI', value: agi, setter: setAgi, color: 'green' },
                    { label: 'VIT', value: vit, setter: setVit, color: 'amber' },
                    { label: 'DEX', value: dex, setter: setDex, color: 'blue' },
                    { label: 'LUK', value: luk, setter: setLuk, color: 'purple' },
                  ].map(stat => (
                    <div key={stat.label}>
                      <label className={`text-xs font-medium text-${stat.color}-600 block mb-1`}>
                        {stat.label}
                      </label>
                      <Input
                        type="number"
                        value={stat.value}
                        onChange={(e) => stat.setter(parseInt(e.target.value) || 0)}
                        className="text-center"
                      />
                    </div>
                  ))}
                </div>
              </Section>
              
              {/* ARMA */}
              <Section id="weapon" title="Arma" icon={Sword} color="red">
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Tipo de Arma</label>
                    <select
                      value={weaponType}
                      onChange={(e) => setWeaponType(e.target.value as keyof typeof WEAPON_TYPES)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500"
                    >
                      {Object.entries(WEAPON_TYPES).map(([key, w]) => (
                        <option key={key} value={key}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">ATK da Arma</label>
                      <Input
                        type="number"
                        value={weaponAtk}
                        onChange={(e) => setWeaponAtk(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Nível</label>
                      <select
                        value={weaponLevel}
                        onChange={(e) => setWeaponLevel(parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                      >
                        {[1, 2, 3, 4].map(l => (
                          <option key={l} value={l}>Nível {l}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Refino</label>
                      <Input
                        type="number"
                        value={refine}
                        onChange={(e) => setRefine(Math.min(20, Math.max(0, parseInt(e.target.value) || 0)))}
                        min={0}
                        max={20}
                      />
                    </div>
                  </div>
                  
                  {isRanged && (
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">ATK da Munição</label>
                      <Input
                        type="number"
                        value={arrowAtk}
                        onChange={(e) => setArrowAtk(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  )}
                  
                  <div className="pt-3 border-t border-gray-100">
                    <label className="text-xs text-gray-500 block mb-2">ATK Extras</label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-400">Cards</label>
                        <Input
                          type="number"
                          value={atkFromCards}
                          onChange={(e) => setAtkFromCards(parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Equips</label>
                        <Input
                          type="number"
                          value={atkFromEquips}
                          onChange={(e) => setAtkFromEquips(parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Impositio</label>
                        <Input
                          type="number"
                          value={impositioManus}
                          onChange={(e) => setImpositioManus(parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Section>
              
              {/* BUFFS E SKILLS */}
              <Section id="buffs" title="Buffs & Skills" icon={Sparkles} color="purple">
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Power Thrust (%)</label>
                      <select
                        value={powerThrust}
                        onChange={(e) => setPowerThrust(parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                      >
                        <option value={0}>Sem buff</option>
                        <option value={5}>Nv.1 (+5%)</option>
                        <option value={10}>Nv.2 (+10%)</option>
                        <option value={15}>Nv.3 (+15%)</option>
                        <option value={20}>Nv.4 (+20%)</option>
                        <option value={25}>Nv.5 (+25%)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Provoke (%)</label>
                      <Input
                        type="number"
                        value={provoke}
                        onChange={(e) => setProvoke(parseInt(e.target.value) || 0)}
                        placeholder="-12 a +32"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Multiplicador da Skill (%)</label>
                    <Input
                      type="number"
                      value={skillModifier}
                      onChange={(e) => setSkillModifier(parseInt(e.target.value) || 100)}
                    />
                    <p className="text-xs text-gray-400 mt-1">100% = ataque normal, 500% = 5x dano</p>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Elemento do Ataque</label>
                    <select
                      value={attackElement}
                      onChange={(e) => setAttackElement(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                    >
                      {ELEMENTS.map(el => (
                        <option key={el.id} value={el.id}>{el.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCritical}
                        onChange={(e) => setIsCritical(e.target.checked)}
                        className="w-4 h-4 text-red-500 rounded border-gray-300 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">Ataque Crítico</span>
                    </label>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-100">
                    <label className="text-xs text-gray-500 block mb-2">Bônus de Dano (%)</label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-400">vs Tamanho</label>
                        <Input
                          type="number"
                          value={bonusSize}
                          onChange={(e) => setBonusSize(parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">vs Raça</label>
                        <Input
                          type="number"
                          value={bonusRace}
                          onChange={(e) => setBonusRace(parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">vs Elemento</label>
                        <Input
                          type="number"
                          value={bonusElement}
                          onChange={(e) => setBonusElement(parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Section>
              
              {/* ALVO */}
              <Section id="target" title="Alvo" icon={Target} color="orange">
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Hard DEF</label>
                      <Input
                        type="number"
                        value={targetHardDef}
                        onChange={(e) => setTargetHardDef(Math.min(100, parseInt(e.target.value) || 0))}
                        max={100}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">VIT (Soft DEF)</label>
                      <Input
                        type="number"
                        value={targetVit}
                        onChange={(e) => setTargetVit(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Elemento</label>
                      <select
                        value={targetElement}
                        onChange={(e) => setTargetElement(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                      >
                        {ELEMENTS.map(el => (
                          <option key={el.id} value={el.id}>{el.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Nível Elemento</label>
                      <select
                        value={targetElementLevel}
                        onChange={(e) => setTargetElementLevel(parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                      >
                        {[1, 2, 3, 4].map(l => (
                          <option key={l} value={l}>Nível {l}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Tamanho</label>
                      <select
                        value={targetSize}
                        onChange={(e) => setTargetSize(e.target.value as 'small' | 'medium' | 'large')}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                      >
                        {SIZES.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Raça</label>
                      <select
                        value={targetRace}
                        onChange={(e) => setTargetRace(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                      >
                        {RACES.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </Section>
              
              {/* ASPD */}
              <Section id="aspd" title="ASPD" icon={Timer} color="emerald">
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Speed Modifiers (%)</label>
                    <Input
                      type="number"
                      value={speedModifiers}
                      onChange={(e) => setSpeedModifiers(parseInt(e.target.value) || 0)}
                      placeholder="Ex: 30 para Berserk Pot"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Awakening: 15% | Berserk Pot: 20% | 2H Quicken: 30%
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <div className="text-xs text-emerald-600">ASPD</div>
                      <div className="text-xl font-bold text-emerald-700">{formatDecimal(calculations.aspd)}</div>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <div className="text-xs text-emerald-600">Ataques/seg</div>
                      <div className="text-xl font-bold text-emerald-700">{formatDecimal(calculations.attacksPerSecond)}</div>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <div className="text-xs text-emerald-600">DPS Médio</div>
                      <div className="text-xl font-bold text-emerald-700">{formatNumber(calculations.dps)}</div>
                    </div>
                  </div>
                </div>
              </Section>
            </div>
            
            {/* COLUNA DIREITA - RESULTADOS */}
            <div className="lg:col-span-7 space-y-4">
              {/* RESULTADO PRINCIPAL */}
              <Card className="bg-gradient-to-br from-red-500 to-orange-600 border-0 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Crosshair className="w-6 h-6" />
                    Dano Final
                  </h2>
                  {isCritical && (
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      ⚡ CRÍTICO
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-white/70 text-sm">Mínimo</div>
                    <div className="text-3xl font-bold">{formatNumber(calculations.finalDamageMin)}</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 scale-105 shadow-lg">
                    <div className="text-white/70 text-sm">Médio</div>
                    <div className="text-4xl font-bold">{formatNumber(calculations.finalDamageAvg)}</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-white/70 text-sm">Máximo</div>
                    <div className="text-3xl font-bold">{formatNumber(calculations.finalDamageMax)}</div>
                  </div>
                </div>
              </Card>
              
              {/* BREAKDOWN */}
              <Card className="bg-white border-gray-200 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Percent className="w-5 h-5 text-blue-500" />
                  Breakdown do Cálculo
                </h3>
                
                <div className="space-y-3 text-sm">
                  {/* Base ATK */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <span className="text-gray-700">Base ATK (Status)</span>
                      <p className="text-xs text-gray-400">
                        {isRanged 
                          ? `DEX + [DEX/10]² + [STR/5] + [LUK/5]`
                          : `STR + [STR/10]² + [DEX/5] + [LUK/5]`
                        }
                      </p>
                    </div>
                    <span className="font-mono text-gray-900 font-medium">{formatNumber(calculations.baseAtk)}</span>
                  </div>
                  
                  {/* Refine Bonus */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <span className="text-gray-700">Refine ATK (+{refine})</span>
                      <p className="text-xs text-gray-400">
                        {[0, 2, 3, 5, 7][weaponLevel]}×{refine} = {calculations.refineBonus}
                      </p>
                    </div>
                    <span className="font-mono text-emerald-600 font-medium">+{formatNumber(calculations.refineBonus)}</span>
                  </div>
                  
                  {/* Over-refine */}
                  {calculations.overRefine.max > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <span className="text-gray-700">Over-refine ATK</span>
                        <p className="text-xs text-gray-400">Bônus de refino acima do seguro</p>
                      </div>
                      <span className="font-mono text-amber-600 font-medium">+0~{formatNumber(calculations.overRefine.max)}</span>
                    </div>
                  )}
                  
                  {/* Bonus ATK */}
                  {calculations.bonusAtk > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <span className="text-gray-700">ATK Extras</span>
                        <p className="text-xs text-gray-400">Cards + Equips + Impositio</p>
                      </div>
                      <span className="font-mono text-blue-600 font-medium">+{formatNumber(calculations.bonusAtk)}</span>
                    </div>
                  )}
                  
                  {/* Weapon ATK */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <span className="text-gray-700">Weapon ATK</span>
                      <p className="text-xs text-gray-400">
                        {isCritical ? 'Crítico = ATK máximo' : `rnd(${formatNumber(calculations.weaponAtkResult.min)}, ${formatNumber(calculations.weaponAtkResult.max)})`}
                      </p>
                    </div>
                    <span className="font-mono text-gray-900 font-medium">
                      {formatNumber(calculations.weaponAtkResult.min)}~{formatNumber(calculations.weaponAtkResult.max)}
                    </span>
                  </div>
                  
                  {/* Size Modifier */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <span className="text-gray-700">Size Modifier ({weapon.name})</span>
                      <p className="text-xs text-gray-400">
                        vs {targetSize === 'small' ? 'Pequeno' : targetSize === 'medium' ? 'Médio' : 'Grande'}
                      </p>
                    </div>
                    <span className={`font-mono font-medium ${calculations.sizeModifier < 100 ? 'text-red-600' : calculations.sizeModifier > 100 ? 'text-emerald-600' : 'text-gray-900'}`}>
                      ×{calculations.sizeModifier}%
                    </span>
                  </div>
                  
                  {/* Total ATK */}
                  <div className="flex justify-between items-center py-2 bg-gray-50 rounded-lg px-3">
                    <span className="text-gray-900 font-medium">Total ATK</span>
                    <span className="font-mono text-gray-900 font-bold">
                      {formatNumber(calculations.totalAtkMin)}~{formatNumber(calculations.totalAtkMax)}
                    </span>
                  </div>
                  
                  {/* Skill Modifier */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <span className="text-gray-700">Skill Modifier</span>
                      <p className="text-xs text-gray-400">
                        (100 + {powerThrust} + {provoke} + {skillModifier - 100})%
                      </p>
                    </div>
                    <span className="font-mono text-purple-600 font-medium">×{formatDecimal(calculations.totalSkillMod)}%</span>
                  </div>
                  
                  {/* Hard DEF */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <span className="text-gray-700">Hard DEF Reduction</span>
                      <p className="text-xs text-gray-400">
                        {isCritical ? 'Crítico ignora Hard DEF' : `(1 - ${targetHardDef}/100)`}
                      </p>
                    </div>
                    <span className={`font-mono font-medium ${isCritical ? 'text-gray-400' : 'text-red-600'}`}>
                      {isCritical ? 'IGNORADO' : `-${formatNumber(calculations.hardDefReduction)}%`}
                    </span>
                  </div>
                  
                  {/* Soft DEF */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <span className="text-gray-700">Soft DEF (VIT)</span>
                      <p className="text-xs text-gray-400">
                        {isCritical ? 'Crítico ignora Soft DEF' : `[VIT×0.5] + rnd(${formatNumber(calculations.softDef.min - floor(targetVit * 0.5))}, ${formatNumber(calculations.softDef.max - floor(targetVit * 0.5))})`}
                      </p>
                    </div>
                    <span className={`font-mono font-medium ${isCritical ? 'text-gray-400' : 'text-red-600'}`}>
                      {isCritical ? 'IGNORADO' : `-${formatNumber(calculations.softDef.min)}~${formatNumber(calculations.softDef.max)}`}
                    </span>
                  </div>
                  
                  {/* Elemental Modifier */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <span className="text-gray-700">Elemental Modifier</span>
                      <p className="text-xs text-gray-400">
                        {ELEMENTS.find(e => e.id === attackElement)?.name} vs {ELEMENTS.find(e => e.id === targetElement)?.name} Lv{targetElementLevel}
                      </p>
                    </div>
                    <span className={`font-mono font-medium ${calculations.elementalMod < 100 ? 'text-red-600' : calculations.elementalMod > 100 ? 'text-emerald-600' : 'text-gray-900'}`}>
                      ×{calculations.elementalMod}%
                    </span>
                  </div>
                  
                  {/* Damage Bonuses */}
                  {(bonusSize !== 0 || bonusRace !== 0 || bonusElement !== 0) && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <span className="text-gray-700">Damage Bonuses</span>
                        <p className="text-xs text-gray-400">
                          Size×Race×Element = {formatDecimal(calculations.sizeBonusMod)}×{formatDecimal(calculations.raceBonusMod)}×{formatDecimal(calculations.elementBonusMod)}%
                        </p>
                      </div>
                      <span className="font-mono text-emerald-600 font-medium">
                        ×{formatDecimal((calculations.sizeBonusMod * calculations.raceBonusMod * calculations.elementBonusMod) / 10000)}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
              
              {/* TABELA ELEMENTAL */}
              <Section id="elemental" title="Tabela Elemental" icon={Flame} color="orange">
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-2 text-left text-gray-600">ATK ↓ / DEF →</th>
                        {ELEMENTS.slice(0, 5).map(el => (
                          <th key={el.id} className="p-2 text-center text-gray-600">{el.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ELEMENTS.slice(0, 5).map(atkEl => (
                        <tr key={atkEl.id} className="border-t border-gray-100">
                          <td className="p-2 font-medium text-gray-700">{atkEl.name}</td>
                          {ELEMENTS.slice(0, 5).map(defEl => {
                            const val = ELEMENTAL_TABLE[atkEl.id]?.[defEl.id]?.[0] ?? 100
                            return (
                              <td 
                                key={defEl.id} 
                                className={`p-2 text-center font-mono ${
                                  val > 100 ? 'text-emerald-600 bg-emerald-50' :
                                  val < 100 ? 'text-red-600 bg-red-50' :
                                  'text-gray-600'
                                }`}
                              >
                                {val}%
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-gray-400 mt-2">* Valores para Elemento Nível 1 do defensor</p>
                </div>
              </Section>
              
              {/* FÓRMULA COMPLETA */}
              <Card className="bg-slate-900 border-slate-800 p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-400" />
                  Fórmula Completa (Melee)
                </h3>
                <div className="font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap">
                  <code>
{`Dano = [[((BaseATK + RefineATK + BonusATK + WeaponATK×SizeModifier) 
         × SkillModifier × (1 - HardDEF/100)) - SoftDEF] 
         × ElementalModifier] × SizeDmg × RaceDmg × ElementDmg

Onde:
• BaseATK = STR + [STR/10]² + [DEX/5] + [LUK/5]
• WeaponATK = rnd(min(DEX×(0.8+0.2×WepLv), ATK), ATK)
• SoftDEF = [VIT×0.5] + rnd([VIT×0.3], max([VIT×0.3], [VIT²/150]-1))
• Crítico: ignora HardDEF, SoftDEF e sempre usa ATK máximo`}
                  </code>
                </div>
              </Card>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>📖 Fórmulas baseadas na documentação do iRO Wiki</p>
            <p className="text-xs mt-1">Alguns valores podem diferir dependendo das customizações do servidor</p>
          </div>
        </div>
      </div>
    </ToolsLayout>
  )
}
