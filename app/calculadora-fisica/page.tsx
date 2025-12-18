'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { ChevronDown, ChevronUp, Swords, Info, X, Search, Plus } from 'lucide-react'
import { ToolsLayout } from '../components/ToolsLayout'

// ============================================
// TIPOS
// ============================================

interface Monster {
  id: number
  name: string
  element: string
  elementLevel: number
  race: string
  type: string
  size: string
  category: string
  def: number
  mdef: number
  hp: number
  reduction: number
}

interface Equipment {
  id: string | number
  nameid?: number
  name: string
  slot: string
  cardSlots: number
  icon?: string
  image?: string
  effects: EffectGroup[] | any[]
  weaponAttack?: number
  level?: number
  weaponLevel?: number
  category?: string
  type?: string
  attack?: number
  slots?: number
  description?: string
  defense?: number
  requiredLevel?: number
}

interface Card {
  id: string
  name: string
  compatibleSlots: string[]
  effects: EffectGroup[]
  icon?: string
  image?: string
}

interface EffectGroup {
  effects: Effect[]
  condition?: Condition
}

interface Effect {
  type: string
  stat?: string
  value?: number
  modifier?: string
  subType?: string
  category?: string
  target?: string
  scalingSource?: string
  scalingFactor?: number
  scalingLimit?: number
  skillName?: string
}

interface Condition {
  operator: string
  conditions: ConditionItem[]
}

interface ConditionItem {
  type: string
  value?: number
  operator?: string
  class?: string[]
  equipmentIds?: string[]
  name?: string
  stat?: string
  stats?: string[]
}

interface EquippedItem {
  equipment: Equipment | null
  refine: number
  cards: (Card | null)[]
}

// ============================================
// CLASSES FÍSICAS DO RAGNAROK
// ============================================

const PHYSICAL_CLASSES = [
  // Classes Transclasse
  { id: 'lorde', name: 'Lorde', sprite: 'Lordessprite.png' },
  { id: 'paladino', name: 'Paladino', sprite: 'Paladinossprite.png' },
  { id: 'algoz', name: 'Algoz', sprite: 'Algoz.png' },
  { id: 'desordeiro', name: 'Desordeiro', sprite: 'Desordeirossprite.png' },
  { id: 'atirador', name: 'Atirador de Elite', sprite: 'Atirador_de_Elite.png' },
  { id: 'menestrel', name: 'Menestrel', sprite: 'Clowngypsy.png' },
  { id: 'cigana', name: 'Cigana', sprite: 'Clowngypsy.png' },
  { id: 'mestre-ferreiro', name: 'Mestre-Ferreiro', sprite: 'MestresFerreirossprite.png' },
  { id: 'criador', name: 'Criador', sprite: 'Criadoressprite.png' },
  { id: 'mestre', name: 'Mestre', sprite: 'Mestressprite.png' },
  { id: 'mestre-taekwon', name: 'Mestre Taekwon', sprite: 'Mestres_Taekwonssprite.png' },
  { id: 'ninja', name: 'Ninja', sprite: 'Ninjassprite.png' },
  { id: 'justiceiro', name: 'Justiceiro', sprite: 'Justiceirossprite.png' },
  { id: 'super-aprendiz', name: 'Super Aprendiz', sprite: 'Superaprendizessprite.png' },
  // Classes 3rd Job
  { id: 'rune-knight', name: 'Rune Knight', sprite: 'Rune_Knight.png' },
  { id: 'royal-guard', name: 'Royal Guard', sprite: 'Royal_Guard.png' },
  { id: 'ranger', name: 'Ranger', sprite: 'Ranger.png' },
  { id: 'mecanico', name: 'Mecânico', sprite: 'Mechanic.png' },
  { id: 'doram', name: 'Doram', sprite: 'Doram.png' },
]

// ============================================
// SKILLS FÍSICAS
// ============================================

const PHYSICAL_SKILLS = [
  { id: 'ataque-normal', name: 'Ataque Normal', classes: ['lorde', 'paladino', 'algoz', 'desordeiro', 'atirador', 'menestrel', 'cigana', 'mestre-ferreiro', 'criador', 'mestre', 'mestre-taekwon', 'ninja', 'justiceiro', 'super-aprendiz'], element: 'weapon', hits: 1, multiplier: 100, formula: 'atk' },
  // Lorde / Paladino
  { id: 'bash', name: 'Golpe Fulminante', classes: ['lorde', 'paladino'], element: 'weapon', hits: 1, multiplier: 400, formula: 'atk' },
  { id: 'magnum-break', name: 'Impacto Explosivo', classes: ['lorde', 'paladino'], element: 'fogo', hits: 1, multiplier: 300, formula: 'atk' },
  { id: 'bowling-bash', name: 'Ataque Arrasador', classes: ['lorde'], element: 'weapon', hits: 2, multiplier: 500, formula: 'atk' },
  { id: 'spiral-pierce', name: 'Perfuração Espiral', classes: ['lorde'], element: 'weapon', hits: 5, multiplier: 450, formula: 'atk+weight' },
  { id: 'shield-chain', name: 'Corrente de Escudo', classes: ['paladino'], element: 'weapon', hits: 5, multiplier: 500, formula: 'atk' },
  { id: 'shield-boomerang', name: 'Escudo Bumerangue', classes: ['paladino'], element: 'weapon', hits: 1, multiplier: 350, formula: 'atk' },
  { id: 'gloria-domini', name: 'Glória Domini', classes: ['paladino'], element: 'sagrado', hits: 1, multiplier: 600, formula: 'atk' },
  // Algoz / Desordeiro
  { id: 'sonic-blow', name: 'Golpe Sônico', classes: ['algoz'], element: 'weapon', hits: 8, multiplier: 700, formula: 'atk', maxLevel: 10, levelMultipliers: [0, 200, 260, 320, 380, 440, 500, 560, 620, 680, 700], canCrit: false },
  { id: 'meteor-assault', name: 'Ataque Meteoro', classes: ['algoz'], element: 'weapon', hits: 1, multiplier: 400, formula: 'atk', maxLevel: 10, levelMultipliers: [0, 80, 120, 160, 200, 240, 280, 320, 360, 400, 400] },
  { id: 'soul-destroyer', name: 'Destruidor de Almas', classes: ['algoz'], element: 'weapon', hits: 1, multiplier: 1000, formula: 'atk+matk', maxLevel: 10, levelMultipliers: [0, 400, 500, 600, 700, 800, 850, 900, 950, 1000, 1000] },
  { id: 'rolling-cutter', name: 'Lâminas de Loki', classes: ['algoz', 'desordeiro'], element: 'weapon', hits: 1, multiplier: 235, formula: 'atk*baselv', maxLevel: 5, levelMultipliers: [0, 120, 140, 160, 200, 235], canCrit: true, note: 'Fórmula: ATK × BaseLv / 100' },
  { id: 'cross-ripper', name: 'Dilacerador Cruzado', classes: ['algoz', 'desordeiro'], element: 'weapon', hits: 1, multiplier: 1400, formula: 'atk*rotation', maxLevel: 5, levelMultipliers: [0, 600, 800, 1000, 1200, 1400], note: 'Dano aumenta com pontos de rotação' },
  { id: 'cross-impact', name: 'Impacto Cruzado', classes: ['desordeiro'], element: 'weapon', hits: 7, multiplier: 1900, formula: 'atk', maxLevel: 5, levelMultipliers: [0, 1100, 1300, 1500, 1700, 1900] },
  // Atirador / Menestrel / Cigana
  { id: 'double-strafe', name: 'Disparo Duplo', classes: ['atirador', 'menestrel', 'cigana'], element: 'weapon', hits: 2, multiplier: 380, formula: 'atk' },
  { id: 'arrow-shower', name: 'Chuva de Flechas', classes: ['atirador', 'menestrel', 'cigana'], element: 'weapon', hits: 1, multiplier: 200, formula: 'atk' },
  { id: 'sharp-shooting', name: 'Tiro Preciso', classes: ['atirador'], element: 'weapon', hits: 1, multiplier: 1500, formula: 'atk' },
  { id: 'arrow-storm', name: 'Tempestade de Flechas', classes: ['atirador'], element: 'weapon', hits: 1, multiplier: 2000, formula: 'atk' },
  { id: 'severe-rainstorm', name: 'Temporal de Mil Flechas', classes: ['menestrel', 'cigana'], element: 'weapon', hits: 12, multiplier: 600, formula: 'atk' },
  { id: 'arrow-vulcan', name: 'Vulcão de Flechas', classes: ['menestrel', 'cigana'], element: 'weapon', hits: 9, multiplier: 1200, formula: 'atk' },
  { id: 'reverberation', name: 'Ressonância', classes: ['menestrel', 'cigana'], element: 'weapon', hits: 1, multiplier: 900, formula: 'atk+matk' },
  // Mestre-Ferreiro / Criador
  { id: 'cart-revolution', name: 'Golpe de Carrinho', classes: ['mestre-ferreiro', 'criador'], element: 'weapon', hits: 1, multiplier: 250, formula: 'atk', maxLevel: 1 },
  { id: 'cart-termination', name: 'Choque de Carrinho', classes: ['mestre-ferreiro'], element: 'weapon', hits: 1, multiplier: 1500, formula: 'atk', maxLevel: 1 },
  { id: 'cart-tornado', name: 'Tornado de Carrinho', classes: ['criador'], element: 'weapon', hits: 1, multiplier: 1250, formula: 'atk', maxLevel: 10, levelMultipliers: [0, 110, 240, 365, 490, 620, 745, 870, 1000, 1130, 1250] },
  { id: 'cart-cannon', name: 'Canhão de Carrinho', classes: ['criador'], element: 'weapon', hits: 1, multiplier: 1500, formula: 'atk', maxLevel: 5, levelMultipliers: [0, 700, 850, 1000, 1200, 1500] },
  { id: 'acid-demonstration', name: 'Terror Ácido', classes: ['criador'], element: 'weapon', hits: 10, multiplier: 700, formula: 'atk*vit', maxLevel: 10, levelMultipliers: [0, 70, 140, 210, 280, 350, 420, 490, 560, 630, 700] },
  { id: 'spore-explosion', name: 'Esporo Explosivo', classes: ['criador'], element: 'weapon', hits: 1, multiplier: 900, formula: 'atk', maxLevel: 5, levelMultipliers: [0, 300, 450, 600, 750, 900] },
  { id: 'crazy-weed', name: 'Erva Daninha', classes: ['criador'], element: 'terra', hits: 1, multiplier: 1200, formula: 'atk', maxLevel: 10, levelMultipliers: [0, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200] },
  // Mestre / Mestre Taekwon
  { id: 'asura-strike', name: 'Punho Supremo', classes: ['mestre'], element: 'weapon', hits: 1, multiplier: 1500, formula: 'atk+sp' },
  { id: 'tiger-cannon', name: 'Impacto de Tigre', classes: ['mestre'], element: 'weapon', hits: 1, multiplier: 1800, formula: 'atk+hp' },
  { id: 'chain-combo', name: 'Combo de Corrente', classes: ['mestre'], element: 'weapon', hits: 4, multiplier: 600, formula: 'atk' },
  { id: 'flying-kick', name: 'Chute Voador', classes: ['mestre-taekwon'], element: 'weapon', hits: 1, multiplier: 500, formula: 'atk' },
  // Ninja / Kagerou / Oboro
  { id: 'throw-kunai', name: 'Lançar Kunai', classes: ['ninja'], element: 'weapon', hits: 1, multiplier: 300, formula: 'atk', maxLevel: 5, levelMultipliers: [0, 140, 180, 220, 260, 300] },
  { id: 'throw-huuma', name: 'Lançar Huuma', classes: ['ninja'], element: 'weapon', hits: 5, multiplier: 500, formula: 'atk', maxLevel: 5, levelMultipliers: [0, 180, 260, 340, 420, 500] },
  { id: 'cross-slash', name: 'Corte Cruzado', classes: ['ninja'], element: 'weapon', hits: 1, multiplier: 700, formula: 'atk', maxLevel: 10, levelMultipliers: [0, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700] },
  { id: 'swirling-petal', name: 'Pétalas Rodopiantes', classes: ['ninja'], element: 'weapon', hits: 1, multiplier: 800, formula: 'atk', maxLevel: 10, levelMultipliers: [0, 300, 350, 400, 450, 500, 550, 600, 650, 700, 800] },
  // Justiceiro / Rebelde
  { id: 'desperado', name: 'Desperado', classes: ['justiceiro'], element: 'weapon', hits: 1, multiplier: 6750, formula: 'atk', maxLevel: 10, levelMultipliers: [0, 675, 1350, 2025, 2700, 3375, 4050, 4725, 5400, 6075, 6750], note: '1 hit único de dano massivo (RagnaTales)' },
  { id: 'round-trip', name: 'Viagem de Ida e Volta', classes: ['justiceiro'], element: 'weapon', hits: 1, multiplier: 1000, formula: 'atk', maxLevel: 5, levelMultipliers: [0, 400, 550, 700, 850, 1000] },
  { id: 'quick-draw-shot', name: 'Disparo Rápido', classes: ['justiceiro'], element: 'weapon', hits: 1, multiplier: 600, formula: 'atk', maxLevel: 1 },
  { id: 'fire-rain', name: 'Chuva de Balas', classes: ['justiceiro'], element: 'weapon', hits: 5, multiplier: 1500, formula: 'atk', maxLevel: 5, levelMultipliers: [0, 600, 800, 1000, 1250, 1500] },
  { id: 'slug-shot', name: 'Tiro de Carabina', classes: ['justiceiro'], element: 'weapon', hits: 1, multiplier: 1800, formula: 'atk', maxLevel: 5, levelMultipliers: [0, 600, 900, 1200, 1500, 1800] },
  // Super Aprendiz
  { id: 'cart-boost', name: 'Aceleração de Carrinho', classes: ['super-aprendiz'], element: 'weapon', hits: 1, multiplier: 300, formula: 'atk' },
  // Doram (Gato)
  { id: 'picky-peck', name: 'Bicada Ágil', classes: ['doram'], element: 'weapon', hits: 5, multiplier: 600, formula: 'atk', maxLevel: 5, levelMultipliers: [0, 200, 300, 400, 500, 600] },
  { id: 'lunatic-carrot', name: 'Cenoura Lunática', classes: ['doram'], element: 'weapon', hits: 1, multiplier: 800, formula: 'atk', maxLevel: 5, levelMultipliers: [0, 400, 500, 600, 700, 800] },
  // Rune Knight
  { id: 'ignition-break', name: 'Ruptura de Ignição', classes: ['rune-knight'], element: 'fogo', hits: 1, multiplier: 2000, formula: 'atk', maxLevel: 5, levelMultipliers: [0, 800, 1100, 1400, 1700, 2000] },
  { id: 'sonic-wave', name: 'Onda Sônica', classes: ['rune-knight'], element: 'weapon', hits: 1, multiplier: 1200, formula: 'atk', maxLevel: 5, levelMultipliers: [0, 600, 750, 900, 1050, 1200] },
  { id: 'hundred-spear', name: 'Lança das Cem Batalhas', classes: ['rune-knight'], element: 'weapon', hits: 5, multiplier: 1500, formula: 'atk', maxLevel: 10, levelMultipliers: [0, 400, 550, 700, 850, 1000, 1100, 1200, 1300, 1400, 1500] },
  { id: 'dragon-breath', name: 'Sopro de Dragão', classes: ['rune-knight'], element: 'fogo', hits: 1, multiplier: 1800, formula: 'atk+hp', maxLevel: 10, levelMultipliers: [0, 600, 750, 900, 1050, 1200, 1350, 1500, 1600, 1700, 1800] },
  // Royal Guard
  { id: 'overbrand', name: 'Marca Suprema', classes: ['royal-guard'], element: 'weapon', hits: 2, multiplier: 1400, formula: 'atk', maxLevel: 5, levelMultipliers: [0, 600, 800, 1000, 1200, 1400] },
  { id: 'banishing-point', name: 'Ponto de Banimento', classes: ['royal-guard'], element: 'weapon', hits: 1, multiplier: 1100, formula: 'atk', maxLevel: 10, levelMultipliers: [0, 300, 400, 500, 600, 700, 800, 900, 950, 1000, 1100] },
  { id: 'cannon-spear', name: 'Lança Canhão', classes: ['royal-guard'], element: 'weapon', hits: 1, multiplier: 1300, formula: 'atk', maxLevel: 5, levelMultipliers: [0, 500, 700, 900, 1100, 1300] },
  // Ranger
  { id: 'aimed-bolt', name: 'Flecha Certeira', classes: ['ranger'], element: 'weapon', hits: 5, multiplier: 1200, formula: 'atk', maxLevel: 10, levelMultipliers: [0, 300, 420, 540, 660, 780, 900, 1000, 1050, 1100, 1200] },
  { id: 'arrow-storm', name: 'Tempestade de Flechas', classes: ['ranger', 'atirador'], element: 'weapon', hits: 1, multiplier: 2000, formula: 'atk', maxLevel: 10, levelMultipliers: [0, 600, 800, 1000, 1200, 1400, 1550, 1700, 1850, 1950, 2000] },
  { id: 'cluster-bomb', name: 'Bomba de Fragmentação', classes: ['ranger'], element: 'weapon', hits: 1, multiplier: 900, formula: 'atk', maxLevel: 5, levelMultipliers: [0, 300, 450, 600, 750, 900] },
  // Mechanic
  { id: 'arm-cannon', name: 'Canhão de Braço', classes: ['mecanico'], element: 'weapon', hits: 1, multiplier: 2000, formula: 'atk', maxLevel: 5, levelMultipliers: [0, 800, 1100, 1400, 1700, 2000] },
  { id: 'knuckle-boost', name: 'Soco Propulsor', classes: ['mecanico'], element: 'weapon', hits: 1, multiplier: 1000, formula: 'atk', maxLevel: 5, levelMultipliers: [0, 400, 550, 700, 850, 1000] },
  { id: 'axe-tornado', name: 'Tornado de Machado', classes: ['mecanico'], element: 'weapon', hits: 1, multiplier: 1400, formula: 'atk', maxLevel: 5, levelMultipliers: [0, 600, 800, 1000, 1200, 1400] },
]

// ============================================
// TABELA ELEMENTAL
// ============================================

const ELEMENT_TABLE: Record<string, Record<string, number>> = {
  neutro: { neutro: 100, água: 100, terra: 100, fogo: 100, vento: 100, veneno: 100, sagrado: 100, sombrio: 100, fantasma: 25, maldito: 100 },
  água: { neutro: 100, água: 25, terra: 100, fogo: 150, vento: 90, veneno: 100, sagrado: 75, sombrio: 100, fantasma: 100, maldito: 100 },
  terra: { neutro: 100, água: 90, terra: 25, fogo: 100, vento: 150, veneno: 100, sagrado: 75, sombrio: 100, fantasma: 100, maldito: 100 },
  fogo: { neutro: 100, água: 150, terra: 90, fogo: 25, vento: 100, veneno: 100, sagrado: 75, sombrio: 100, fantasma: 100, maldito: 125 },
  vento: { neutro: 100, água: 100, terra: 150, fogo: 90, vento: 25, veneno: 100, sagrado: 75, sombrio: 100, fantasma: 100, maldito: 100 },
  veneno: { neutro: 100, água: 100, terra: 100, fogo: 100, vento: 100, veneno: 0, sagrado: 100, sombrio: 50, fantasma: 100, maldito: 50 },
  sagrado: { neutro: 100, água: 75, terra: 75, fogo: 75, vento: 75, veneno: 100, sagrado: 0, sombrio: 150, fantasma: 100, maldito: 125 },
  sombrio: { neutro: 100, água: 100, terra: 100, fogo: 100, vento: 100, veneno: 50, sagrado: 150, sombrio: 0, fantasma: 100, maldito: -25 },
  fantasma: { neutro: 25, água: 100, terra: 100, fogo: 100, vento: 100, veneno: 100, sagrado: 100, sombrio: 100, fantasma: 175, maldito: 100 },
  maldito: { neutro: 100, água: 100, terra: 100, fogo: 100, vento: 100, veneno: 50, sagrado: 150, sombrio: 0, fantasma: 100, maldito: 0 },
}

// ============================================
// WEAPON SIZE MODIFIERS
// ============================================

const WEAPON_SIZE_MODIFIERS: Record<string, { small: number, medium: number, large: number }> = {
  'Adaga': { small: 100, medium: 75, large: 50 },
  'Espada': { small: 75, medium: 100, large: 75 },
  'Espada 2H': { small: 75, medium: 75, large: 100 },
  'Lança': { small: 75, medium: 75, large: 100 },
  'Lança 2H': { small: 75, medium: 75, large: 100 },
  'Machado': { small: 50, medium: 75, large: 100 },
  'Machado 2H': { small: 50, medium: 75, large: 100 },
  'Maça': { small: 75, medium: 100, large: 100 },
  'Maça 2H': { small: 75, medium: 100, large: 100 },
  'Bastão': { small: 100, medium: 100, large: 100 },
  'Cajado': { small: 100, medium: 100, large: 100 },
  'Arco': { small: 100, medium: 100, large: 75 },
  'Katar': { small: 75, medium: 100, large: 75 },
  'Livro': { small: 100, medium: 100, large: 50 },
  'Soqueira': { small: 100, medium: 75, large: 50 },
  'Instrumento': { small: 75, medium: 100, large: 75 },
  'Chicote': { small: 75, medium: 100, large: 50 },
  'Pistola': { small: 100, medium: 100, large: 100 },
  'Rifle': { small: 100, medium: 100, large: 100 },
  'Escopeta': { small: 100, medium: 100, large: 100 },
  'Metralhadora': { small: 100, medium: 100, large: 100 },
  'Lança-Granadas': { small: 100, medium: 100, large: 100 },
  'Huuma Shuriken': { small: 100, medium: 100, large: 100 },
}

// Mapeamento de slots para português
const SLOT_MAP: Record<string, string> = {
  'Topo': 'topo',
  'Meio': 'meio', 
  'Baixo': 'baixo',
  'Armadura': 'armadura',
  'Arma': 'arma',
  'Mão Direita': 'arma',
  'Mão Esquerda': 'escudo',
  'Capa': 'capa',
  'Sapato': 'sapato',
  'Acessório': 'acessorio',
  'Acessório Esquerdo': 'acessorio2',
  'Acessório Direito': 'acessorio1',
}

// ============================================
// EQUIPMENT SLOTS CONFIG
// ============================================

const EQUIPMENT_SLOTS = [
  { id: 'topo', name: 'Topo', slotName: 'Topo' },
  { id: 'meio', name: 'Meio', slotName: 'Meio' },
  { id: 'baixo', name: 'Baixo', slotName: 'Baixo' },
  { id: 'armadura', name: 'Armadura', slotName: 'Armadura' },
  { id: 'arma', name: 'Mão Direita', slotName: 'Arma' },
  { id: 'escudo', name: 'Mão Esquerda', slotName: 'Mão Esquerda' },
  { id: 'capa', name: 'Capa', slotName: 'Capa' },
  { id: 'sapato', name: 'Bota', slotName: 'Sapato' },
  { id: 'acessorio1', name: 'Acc R', slotName: 'Acessório' },
  { id: 'acessorio2', name: 'Acc L', slotName: 'Acessório' },
]

// ============================================
// COMPONENT - Equipment Slot
// ============================================

function EquipmentSlotComponent({ 
  slot, 
  equipped, 
  onClick,
  onCardClick,
  position
}: { 
  slot: typeof EQUIPMENT_SLOTS[0]
  equipped: EquippedItem
  onClick: () => void
  onCardClick: (cardIndex: number) => void
  position: string
}) {
  const hasEquipment = equipped.equipment !== null
  const cardSlots = equipped.equipment?.cardSlots || 0

  return (
    <div className={`flex flex-col items-center ${position} pb-2`}>
      <span className="text-[10px] text-gray-500 mb-0.5">{slot.name}</span>
      <div className="relative overflow-visible">
        <button
          onClick={onClick}
          className={`w-11 h-11 rounded-lg border-2 transition-all relative group
            ${hasEquipment 
              ? 'border-blue-400 bg-blue-50 hover:border-blue-500 hover:shadow-md' 
              : 'border-dashed border-gray-300 bg-gray-50/50 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
        >
          {hasEquipment ? (
            <>
              <img
                src={equipped.equipment!.image || equipped.equipment!.icon}
                alt={equipped.equipment!.name}
                className="w-full h-full object-contain p-0.5"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  const itemId = equipped.equipment!.nameid || equipped.equipment!.id;
                  // Tenta Divine Pride como fallback
                  if (!img.src.includes('divine-pride')) {
                    img.src = `https://static.divine-pride.net/images/items/item/${itemId}.png`;
                  } else {
                    // Se Divine Pride também falhar, usa placeholder
                    img.src = '/images/placeholder-item.png';
                  }
                }}
              />
              {equipped.refine > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  +{equipped.refine}
                </span>
              )}
            </>
          ) : (
            <Plus className="w-4 h-4 text-gray-400 mx-auto" />
          )}
        </button>
        
        {/* Card slots */}
        {hasEquipment && cardSlots > 0 && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {Array.from({ length: cardSlots }).map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation()
                  onCardClick(idx)
                }}
                className={`w-4 h-4 rounded border-2 transition-all cursor-pointer hover:scale-125
                  ${equipped.cards[idx] 
                    ? 'bg-purple-500 border-purple-600 shadow-md' 
                    : 'bg-white border-gray-400 hover:bg-purple-200 hover:border-purple-400'
                  }`}
                title={equipped.cards[idx]?.name || 'Clique para adicionar carta'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// COMPONENT - Card Modal
// ============================================

function CardModal({
  isOpen,
  onClose,
  slotName,
  cardIndex,
  cards,
  onSelect,
  currentCard,
  equipmentSlot
}: {
  isOpen: boolean
  onClose: () => void
  slotName: string
  cardIndex: number
  cards: Card[]
  onSelect: (card: Card | null) => void
  currentCard: Card | null
  equipmentSlot: string
}) {
  const [search, setSearch] = useState('')

  // Não filtra por slot - mostra todas as cartas e deixa o jogador escolher
  const filteredCards = useMemo(() => {
    let items = [...cards]

    if (search) {
      const searchLower = search.toLowerCase()
      items = items.filter(c => c.name.toLowerCase().includes(searchLower))
    }

    return items.slice(0, 100) // Limitar para performance
  }, [cards, search])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-purple-50">
          <h3 className="text-lg font-bold text-purple-800">
            Card para {slotName} (Slot {cardIndex + 1})
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-purple-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar card..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Current Card */}
        {currentCard && (
          <div className="p-4 bg-purple-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={currentCard.image || currentCard.icon}
                alt={currentCard.name}
                className="w-10 h-10 rounded-lg object-contain"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (!img.src.includes('divine-pride')) {
                    img.src = `https://static.divine-pride.net/images/items/item/${currentCard.id}.png`;
                  }
                }}
              />
              <div>
                <div className="font-medium text-gray-800">{currentCard.name}</div>
                <div className="text-sm text-gray-500">Card equipado</div>
              </div>
            </div>
            <button
              onClick={() => onSelect(null)}
              className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
            >
              Remover
            </button>
          </div>
        )}

        {/* Card List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="grid grid-cols-1 gap-1">
            {filteredCards.map((card, idx) => (
              <button
                key={`${card.id}-${idx}`}
                onClick={() => onSelect(card)}
                className={`flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50 transition-colors text-left
                  ${currentCard?.id === card.id ? 'bg-purple-100' : ''}`}
              >
                <img
                  src={card.image || card.icon}
                  alt={card.name}
                  className="w-8 h-8 rounded flex-shrink-0"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (!img.src.includes('divine-pride')) {
                      img.src = `https://static.divine-pride.net/images/items/item/${card.id}.png`;
                    }
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 truncate">{card.name}</div>
                  <div className="text-xs text-gray-500">
                    {card.effects.slice(0, 1).map((group, idx) => (
                      <span key={idx}>
                        {group.effects.slice(0, 2).map((eff, i) => (
                          <span key={i} className="mr-1">
                            {eff.stat && `${eff.stat}: ${(eff.value || 0) > 0 ? '+' : ''}${eff.value || 0}${eff.modifier === 'percent' ? '%' : ''}`}
                          </span>
                        ))}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
            {filteredCards.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Nenhum card encontrado
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// COMPONENT - Equipment Modal
// ============================================

function EquipmentModal({
  isOpen,
  onClose,
  slot,
  equipments,
  weapons,
  onSelect,
  currentEquipment
}: {
  isOpen: boolean
  onClose: () => void
  slot: typeof EQUIPMENT_SLOTS[0]
  equipments: Equipment[]
  weapons: Equipment[]
  onSelect: (equipment: Equipment | null, refine: number) => void
  currentEquipment: EquippedItem
}) {
  const [search, setSearch] = useState('')
  const [selectedRefine, setSelectedRefine] = useState(currentEquipment.refine)

  // Filtrar equipamentos por slot
  const filteredItems = useMemo(() => {
    let items: Equipment[] = []
    
    if (slot.id === 'arma') {
      items = weapons
    } else {
      items = equipments.filter(e => {
        const equipSlot = e.slot?.toLowerCase() || SLOT_MAP[e.slot] || ''
        return equipSlot === slot.id || 
               (slot.id.startsWith('acessorio') && (equipSlot === 'acessorio' || e.slot === 'Acessório'))
      })
    }

    if (search) {
      const searchLower = search.toLowerCase()
      items = items.filter(e => e.name.toLowerCase().includes(searchLower))
    }

    return items
  }, [slot, equipments, weapons, search])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Selecionar {slot.name}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar equipamento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Current Equipment */}
        {currentEquipment.equipment && (
          <div className="p-4 bg-blue-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={currentEquipment.equipment.image || currentEquipment.equipment.icon}
                alt={currentEquipment.equipment.name}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (!img.src.includes('divine-pride') && currentEquipment.equipment) {
                    const itemId = currentEquipment.equipment.nameid || currentEquipment.equipment.id;
                    img.src = `https://static.divine-pride.net/images/items/item/${itemId}.png`;
                  }
                }}
              />
              <div>
                <div className="font-medium text-gray-800">{currentEquipment.equipment.name}</div>
                <div className="text-sm text-gray-500">Equipado atualmente</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Refino:</label>
              <input
                type="number"
                value={selectedRefine}
                onChange={(e) => setSelectedRefine(Math.min(20, Math.max(0, Number(e.target.value))))}
                min={0}
                max={20}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
              />
              <button
                onClick={() => onSelect(currentEquipment.equipment, selectedRefine)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Atualizar
              </button>
              <button
                onClick={() => onSelect(null, 0)}
                className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
              >
                Remover
              </button>
            </div>
          </div>
        )}

        {/* Equipment List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="grid grid-cols-1 gap-1">
            {filteredItems.map((item, idx) => (
              <button
                key={`${item.id}-${item.cardSlots}-${idx}`}
                onClick={() => onSelect(item, selectedRefine)}
                className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors text-left
                  ${currentEquipment.equipment?.id === item.id ? 'bg-blue-100' : ''}`}
              >
                <img
                  src={item.image || item.icon}
                  alt={item.name}
                  className="w-10 h-10 object-contain flex-shrink-0"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (!img.src.includes('divine-pride')) {
                      img.src = `https://static.divine-pride.net/images/items/item/${item.nameid || item.id}.png`;
                    }
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 truncate">{item.name}</div>
                  <div className="text-xs text-gray-500 flex gap-2">
                    {item.weaponAttack && <span>ATK: {item.weaponAttack}</span>}
                    {item.level && <span>Nv. {item.level}</span>}
                    {item.cardSlots > 0 && <span>🃏 {item.cardSlots}</span>}
                    {item.type && <span className="text-blue-600">{item.type}</span>}
                  </div>
                </div>
              </button>
            ))}
            {filteredItems.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Nenhum equipamento encontrado
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// COMPONENT PRINCIPAL
// ============================================

export default function CalculadoraFisica() {
  // State - Dados externos
  const [monsters, setMonsters] = useState<Monster[]>([])
  const [weapons, setWeapons] = useState<Equipment[]>([])
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  // State - Classe e Personagem
  const [selectedClass, setSelectedClass] = useState('lorde')
  const [isTemporada, setIsTemporada] = useState(false)
  const [hasRunaTemporada, setHasRunaTemporada] = useState(false)
  const [forcaHeroica, setForcaHeroica] = useState(0)
  const [baseLevel, setBaseLevel] = useState(99)

  // State - Atributos
  const [str, setStr] = useState(99)
  const [strBonus, setStrBonus] = useState(40)
  const [agi, setAgi] = useState(80)
  const [agiBonus, setAgiBonus] = useState(30)
  const [vit, setVit] = useState(50)
  const [vitBonus, setVitBonus] = useState(20)
  const [int_, setInt] = useState(1)
  const [intBonus, setIntBonus] = useState(10)
  const [dex, setDex] = useState(70)
  const [dexBonus, setDexBonus] = useState(30)
  const [luk, setLuk] = useState(30)
  const [lukBonus, setLukBonus] = useState(10)

  // State - Equipamentos
  const [equippedItems, setEquippedItems] = useState<Record<string, EquippedItem>>(() => {
    const initial: Record<string, EquippedItem> = {}
    EQUIPMENT_SLOTS.forEach(slot => {
      initial[slot.id] = { equipment: null, refine: 0, cards: [] }
    })
    return initial
  })

  // State - Modal
  const [modalSlot, setModalSlot] = useState<typeof EQUIPMENT_SLOTS[0] | null>(null)
  const [cardModalSlot, setCardModalSlot] = useState<{ slot: typeof EQUIPMENT_SLOTS[0], cardIndex: number } | null>(null)

  // State - Skill
  const [selectedSkillId, setSelectedSkillId] = useState('ataque-normal')
  const [skillLevel, setSkillLevel] = useState(10) // Nível da skill (1-10)
  const [attackElement, setAttackElement] = useState('neutro')
  const [isCritical, setIsCritical] = useState(false)

  // State - Alvo
  const [selectedMonsterId, setSelectedMonsterId] = useState(1)

  // State - Bônus manuais
  const [manualEquipAtk, setManualEquipAtk] = useState(0)
  const [manualCardAtk, setManualCardAtk] = useState(0)
  const [raceDmg, setRaceDmg] = useState(0)
  const [sizeDmg, setSizeDmg] = useState(0)
  const [elementDmg, setElementDmg] = useState(0)
  const [physicalDmg, setPhysicalDmg] = useState(0)
  const [rangedDmg, setRangedDmg] = useState(0)
  const [critDmg, setCritDmg] = useState(40)
  const [defBypass, setDefBypass] = useState(0)

  // State - Buffs
  const [hasPowerThrust, setHasPowerThrust] = useState(false)
  const [hasMaxPower, setHasMaxPower] = useState(false)
  const [hasProvoke, setHasProvoke] = useState(false)
  const [hasConcentrate, setHasConcentrate] = useState(false)

  // State - UI
  const [showModifiers, setShowModifiers] = useState(true)
  const [showBuffs, setShowBuffs] = useState(true)
  const [showElementTable, setShowElementTable] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(true)

  // Carregar dados do RagnaTales
  useEffect(() => {
    Promise.all([
      fetch('/data/monsters.json').then(r => r.json()),
      fetch('/data/ragnatales/weapons-with-effects.json').then(r => r.json()),
      fetch('/data/ragnatales/equipments-with-effects.json').then(r => r.json()),
      fetch('/data/ragnatales/cards-with-effects.json').then(r => r.json()),
    ]).then(([monstersData, weaponsData, equipmentsData, cardsData]) => {
      setMonsters(monstersData)
      
      // Transforma armas do RagnaTales para o formato esperado
      // Cria mapa de ID por nome para reutilizar o ID do primeiro item encontrado
      const weaponIdMap: Record<string, number> = {}
      weaponsData.forEach((w: any) => {
        if (!weaponIdMap[w.name]) {
          weaponIdMap[w.name] = w.nameid || w.id
        }
      })
      
      const transformedWeapons: Equipment[] = weaponsData.map((w: any) => {
        // Usa o ID do primeiro item com o mesmo nome para a imagem
        const imageId = weaponIdMap[w.name] || w.nameid || w.id
        const localImageUrl = `/images/ragnatales/${imageId}.png`
        return {
          id: String(w.nameid || w.id),
          nameid: w.nameid || w.id,
          name: w.name,
          slot: 'weapon',
          cardSlots: w.slots || 0,
          icon: localImageUrl,
          image: localImageUrl,
          weaponAttack: w.attack || 0,
          level: w.weaponLevel || 1,
          weaponLevel: w.weaponLevel || 1,
          effects: w.effects || [],
          requiredLevel: w.requiredLevel || 0,
          description: w.description || '',
        }
      })
      setWeapons(transformedWeapons)
      
      // Transforma equipamentos - usa o slot que já vem nos dados
      // Cria mapa de ID por nome para reutilizar o ID do primeiro item encontrado
      const equipIdMap: Record<string, number> = {}
      equipmentsData.forEach((e: any) => {
        if (!equipIdMap[e.name]) {
          equipIdMap[e.name] = e.nameid || e.id
        }
      })
      
      const transformedEquipments: Equipment[] = equipmentsData.map((e: any) => {
        // Usa o ID do primeiro item com o mesmo nome para a imagem
        const imageId = equipIdMap[e.name] || e.nameid || e.id
        const localImageUrl = `/images/ragnatales/${imageId}.png`
        
        // Extrair slot da descrição se não estiver definido corretamente
        let slot = e.slot || 'outro'
        if (slot === 'outro' && e.description) {
          const desc = e.description.toLowerCase()
          if (desc.includes('equipa em: topo') || desc.includes('classe: headgear')) slot = 'topo'
          else if (desc.includes('equipa em: meio')) slot = 'meio'
          else if (desc.includes('equipa em: baixo')) slot = 'baixo'
          else if (desc.includes('equipa em: armadura') || desc.includes('classe: armadura')) slot = 'armadura'
          else if (desc.includes('equipa em: escudo') || desc.includes('classe: escudo')) slot = 'escudo'
          else if (desc.includes('equipa em: capa') || desc.includes('classe: capa')) slot = 'capa'
          else if (desc.includes('equipa em: calçado') || desc.includes('classe: calçado') || desc.includes('equipa em: sapato')) slot = 'sapato'
          else if (desc.includes('equipa em: acessório') || desc.includes('classe: acessório')) slot = 'acessorio'
        }
        
        return {
          id: String(e.nameid || e.id),
          nameid: e.nameid || e.id,
          name: e.name,
          slot: slot,
          cardSlots: e.slots || e.cardSlots || 0,
          icon: localImageUrl,
          image: localImageUrl,
          weaponAttack: 0,
          effects: e.effects || [],
          defense: e.defense || 0,
          requiredLevel: e.requiredLevel || 0,
          description: e.description || '',
        }
      })
      setEquipments(transformedEquipments)
      
      // Transforma cartas
      // Cria mapa de ID por nome para reutilizar o ID do primeiro item encontrado
      const cardIdMap: Record<string, number> = {}
      cardsData.forEach((c: any) => {
        if (!cardIdMap[c.name]) {
          cardIdMap[c.name] = c.nameid || c.id
        }
      })
      
      const transformedCards: Card[] = cardsData.map((c: any) => {
        const imageId = cardIdMap[c.name] || c.nameid || c.id
        const localImageUrl = `/images/ragnatales/${imageId}.png`
        return {
          id: String(c.nameid || c.id),
          name: c.name,
          compatibleSlots: c.compatibleSlots || ['weapon', 'armadura', 'escudo', 'capa', 'sapato', 'acessorio', 'topo', 'meio', 'baixo'],
          effects: c.effects || [],
          icon: localImageUrl,
          image: localImageUrl,
        }
      })
      setCards(transformedCards)
      
      setLoading(false)
    }).catch(err => {
      console.error('Erro ao carregar dados:', err)
      setLoading(false)
    })
  }, [])

  // Calcular stats derivados
  const totalStr = str + strBonus
  const totalAgi = agi + agiBonus
  const totalVit = vit + vitBonus
  const totalInt = int_ + intBonus
  const totalDex = dex + dexBonus
  const totalLuk = luk + lukBonus

  // Handler para equipar item
  const handleEquip = useCallback((slotId: string, equipment: Equipment | null, refine: number) => {
    setEquippedItems(prev => ({
      ...prev,
      [slotId]: {
        equipment,
        refine,
        cards: equipment ? Array(equipment.cardSlots).fill(null) : []
      }
    }))
    setModalSlot(null)
  }, [])

  // Handler para equipar card
  const handleEquipCard = useCallback((slotId: string, cardIndex: number, card: Card | null) => {
    setEquippedItems(prev => {
      const newCards = [...prev[slotId].cards]
      newCards[cardIndex] = card
      return {
        ...prev,
        [slotId]: {
          ...prev[slotId],
          cards: newCards
        }
      }
    })
    setCardModalSlot(null)
  }, [])

  // Calcular todos os modificadores de equipamentos e cartas
  const equipmentStats = useMemo(() => {
    let equipAtk = 0
    let weaponAtk = 0
    let weaponLevel = 1
    let weaponRefine = 0
    let weaponType = 'Espada'

    // Modificadores acumulados
    const modifiers = {
      atk_percent: 0,
      atk_flat: 0,
      physical_damage_percent: 0,
      ranged_damage_percent: 0,
      melee_damage_percent: 0,
      damage_vs_small: 0,
      damage_vs_medium: 0,
      damage_vs_large: 0,
      damage_vs_all_sizes: 0,
      damage_vs_undead: 0,
      damage_vs_demon: 0,
      damage_vs_demi_human: 0,
      damage_vs_brute: 0,
      damage_vs_plant: 0,
      damage_vs_insect: 0,
      damage_vs_fish: 0,
      damage_vs_dragon: 0,
      damage_vs_angel: 0,
      damage_vs_formless: 0,
      damage_vs_all_races: 0,
      damage_vs_fire: 0,
      damage_vs_water: 0,
      damage_vs_wind: 0,
      damage_vs_earth: 0,
      damage_vs_shadow: 0,
      damage_vs_holy: 0,
      damage_vs_ghost: 0,
      damage_vs_poison: 0,
      damage_vs_neutral: 0,
      ignore_def_percent: 0,
      ignore_mdef_percent: 0,
      crit_damage_percent: 0,
      crit_rate: 0,
      aspd_percent: 0,
      str: 0,
      agi: 0,
      vit: 0,
      int: 0,
      dex: 0,
      luk: 0,
      skill_damage: {} as Record<string, number>, // skill name -> bonus %
    }

    // Função para verificar se uma condição é atendida
    const checkCondition = (condition: any, refine: number): boolean => {
      if (!condition) return true
      
      switch (condition.type) {
        case 'per_refine':
          return true // Valor será multiplicado pelo refino
        case 'refine_min':
          return refine >= condition.value
        case 'refine_exact':
          return refine === condition.value
        case 'on_attack':
          return true // Sempre ativo para cálculo
        default:
          return true
      }
    }

    // Função para calcular valor do efeito considerando condição
    const getEffectValue = (effect: any, refine: number): number => {
      if (!effect.condition) return effect.value || 0
      
      if (effect.condition.type === 'per_refine') {
        const maxRefine = effect.condition.max || 20
        const effectiveRefine = Math.min(refine, maxRefine)
        return (effect.value || 0) * effectiveRefine
      }
      
      if (checkCondition(effect.condition, refine)) {
        return effect.value || 0
      }
      
      return 0
    }

    // Função para processar efeitos de um item
    const processEffects = (effects: any[], refine: number) => {
      if (!effects || !Array.isArray(effects)) return
      
      effects.forEach((effect: any) => {
        const value = getEffectValue(effect, refine)
        if (value === 0) return
        
        const stat = effect.stat
        
        if (stat === 'skill_damage' && effect.skill) {
          modifiers.skill_damage[effect.skill] = (modifiers.skill_damage[effect.skill] || 0) + value
        } else if (stat in modifiers && stat !== 'skill_damage') {
          (modifiers as any)[stat] += value
        }
      })
    }

    // Processar arma
    const weapon = equippedItems.arma?.equipment
    if (weapon) {
      weaponAtk = weapon.weaponAttack || weapon.attack || 0
      weaponLevel = weapon.level || weapon.weaponLevel || 1
      weaponRefine = equippedItems.arma.refine
      weaponType = weapon.type || 'Espada'
      
      // Processar efeitos da arma
      processEffects(weapon.effects, weaponRefine)
      
      // Processar cartas da arma
      equippedItems.arma.cards.forEach((card: any) => {
        if (card?.effects) {
          processEffects(card.effects, weaponRefine)
        }
      })
    }

    // Processar outros equipamentos
    Object.entries(equippedItems).forEach(([slotId, item]) => {
      if (slotId === 'arma' || !item.equipment) return
      
      const refine = item.refine || 0
      
      // Processar efeitos do equipamento
      processEffects(item.equipment.effects, refine)
      
      // Processar cartas do equipamento
      item.cards.forEach((card: any) => {
        if (card?.effects) {
          processEffects(card.effects, refine)
        }
      })
    })

    return { 
      equipAtk, 
      weaponAtk, 
      weaponLevel, 
      weaponRefine, 
      weaponType,
      modifiers 
    }
  }, [equippedItems])

  // Monstro selecionado
  const selectedMonster = useMemo(() => 
    monsters.find(m => m.id === selectedMonsterId) || null
  , [monsters, selectedMonsterId])

  // Skill selecionada
  const selectedSkill = useMemo(() =>
    PHYSICAL_SKILLS.find(s => s.id === selectedSkillId) || PHYSICAL_SKILLS[0]
  , [selectedSkillId])

  // Skills disponíveis para a classe
  const availableSkills = useMemo(() =>
    PHYSICAL_SKILLS.filter(s => s.classes.includes(selectedClass))
  , [selectedClass])

  // Classe selecionada
  const classInfo = useMemo(() =>
    PHYSICAL_CLASSES.find(c => c.id === selectedClass) || PHYSICAL_CLASSES[0]
  , [selectedClass])

  // ============================================
  // CÁLCULO DE DANO FÍSICO
  // ============================================
  
  const damageCalculation = useMemo(() => {
    if (!selectedMonster) return { min: 0, max: 0, average: 0, breakdown: {} }

    const { weaponAtk, weaponLevel, weaponRefine, weaponType, equipAtk, modifiers } = equipmentStats
    const totalEquipAtk = equipAtk + manualEquipAtk + manualCardAtk

    // Adicionar stats dos equipamentos
    const totalStrWithEquip = totalStr + modifiers.str
    const totalDexWithEquip = totalDex + modifiers.dex
    const totalLukWithEquip = totalLuk + modifiers.luk

    // Status ATK = STR + [STR/10]² + [DEX/5] + [LUK/5]
    const statusAtk = totalStrWithEquip + Math.floor(totalStrWithEquip / 10) ** 2 + Math.floor(totalDexWithEquip / 5) + Math.floor(totalLukWithEquip / 5)

    // Refine ATK: Nível 1=+2, Nível 2=+3, Nível 3=+5, Nível 4=+7 por refino
    const refineBonus = [0, 2, 3, 5, 7][weaponLevel] * weaponRefine
    
    // Over-refine
    const safeRefine = [0, 7, 6, 5, 4][weaponLevel]
    const overRefine = Math.max(0, weaponRefine - safeRefine)
    const overRefineBonus = weaponLevel >= 3 ? overRefine * 5 : 0

    // Variance
    const variance = weaponLevel >= 3 ? 0.05 : 0.10
    const weaponAtkMin = Math.floor(weaponAtk * (1 - variance))
    const weaponAtkMax = weaponAtk

    // Size modifier
    const sizeKey = selectedMonster.size === 'Grande' ? 'large' : selectedMonster.size === 'Médio' ? 'medium' : 'small'
    const sizeModifier = (WEAPON_SIZE_MODIFIERS[weaponType]?.[sizeKey] || 100) / 100

    // Element modifier
    const monsterElement = selectedMonster.element.toLowerCase()
    const atkElement = attackElement.toLowerCase()
    const elementModifier = (ELEMENT_TABLE[atkElement]?.[monsterElement] || 100) / 100

    // Base ATK com size modifier
    const modifiedAtkMin = statusAtk + (weaponAtkMin * sizeModifier) + refineBonus + overRefineBonus + totalEquipAtk + modifiers.atk_flat
    const modifiedAtkMax = statusAtk + (weaponAtkMax * sizeModifier) + refineBonus + overRefineBonus + totalEquipAtk + modifiers.atk_flat

    // ATK% dos equipamentos
    const atkPercentMod = 1 + (modifiers.atk_percent / 100)

    // Skill multiplier - usa nível da skill se disponível
    const skillMultiplierValue = (selectedSkill as any).levelMultipliers 
      ? (selectedSkill as any).levelMultipliers[Math.min(skillLevel, (selectedSkill as any).maxLevel || 10)] || selectedSkill.multiplier
      : selectedSkill.multiplier
    
    // Aplicar fórmula especial se existir
    let skillMult = skillMultiplierValue / 100
    const skillFormula = selectedSkill.formula
    
    // Fórmula: ATK × BaseLv / 100 (ex: Lâminas de Loki)
    if (skillFormula === 'atk*baselv') {
      skillMult = (skillMultiplierValue * baseLevel / 100) / 100
    }
    
    const skillHits = selectedSkill.hits

    // Skill damage bonus dos equipamentos
    const skillDamageBonus = modifiers.skill_damage[selectedSkill.name] || 0
    const skillBonusMod = 1 + (skillDamageBonus / 100)

    // DEF calculation - incluir ignore DEF dos equipamentos
    const hardDef = selectedMonster.def
    const totalDefBypass = defBypass + modifiers.ignore_def_percent
    const defBypassMult = Math.min(totalDefBypass, 100) / 100
    const effectiveHardDef = Math.floor(hardDef * (1 - defBypassMult))
    const hardDefReduction = effectiveHardDef / (effectiveHardDef + 400)

    // Damage modifiers - combinar manuais com equipamentos
    // Raça
    let totalRaceDmg = raceDmg + modifiers.damage_vs_all_races
    const monsterRace = selectedMonster.race?.toLowerCase() || ''
    if (monsterRace.includes('morto') || monsterRace.includes('undead')) totalRaceDmg += modifiers.damage_vs_undead
    if (monsterRace.includes('demônio') || monsterRace.includes('demon')) totalRaceDmg += modifiers.damage_vs_demon
    if (monsterRace.includes('humano') || monsterRace.includes('demi')) totalRaceDmg += modifiers.damage_vs_demi_human
    if (monsterRace.includes('bruto') || monsterRace.includes('brute')) totalRaceDmg += modifiers.damage_vs_brute
    if (monsterRace.includes('planta') || monsterRace.includes('plant')) totalRaceDmg += modifiers.damage_vs_plant
    if (monsterRace.includes('inseto') || monsterRace.includes('insect')) totalRaceDmg += modifiers.damage_vs_insect
    if (monsterRace.includes('peixe') || monsterRace.includes('fish')) totalRaceDmg += modifiers.damage_vs_fish
    if (monsterRace.includes('dragão') || monsterRace.includes('dragon')) totalRaceDmg += modifiers.damage_vs_dragon
    if (monsterRace.includes('anjo') || monsterRace.includes('angel')) totalRaceDmg += modifiers.damage_vs_angel
    if (monsterRace.includes('amorfo') || monsterRace.includes('formless')) totalRaceDmg += modifiers.damage_vs_formless
    const raceMod = 1 + totalRaceDmg / 100

    // Tamanho
    let totalSizeDmg = sizeDmg + modifiers.damage_vs_all_sizes
    if (selectedMonster.size === 'Pequeno') totalSizeDmg += modifiers.damage_vs_small
    if (selectedMonster.size === 'Médio') totalSizeDmg += modifiers.damage_vs_medium
    if (selectedMonster.size === 'Grande') totalSizeDmg += modifiers.damage_vs_large
    const sizeMod = 1 + totalSizeDmg / 100

    // Elemento do monstro
    let totalElemDmg = elementDmg
    if (monsterElement.includes('fogo') || monsterElement.includes('fire')) totalElemDmg += modifiers.damage_vs_fire
    if (monsterElement.includes('água') || monsterElement.includes('water')) totalElemDmg += modifiers.damage_vs_water
    if (monsterElement.includes('vento') || monsterElement.includes('wind')) totalElemDmg += modifiers.damage_vs_wind
    if (monsterElement.includes('terra') || monsterElement.includes('earth')) totalElemDmg += modifiers.damage_vs_earth
    if (monsterElement.includes('sombrio') || monsterElement.includes('shadow') || monsterElement.includes('dark')) totalElemDmg += modifiers.damage_vs_shadow
    if (monsterElement.includes('sagrado') || monsterElement.includes('holy')) totalElemDmg += modifiers.damage_vs_holy
    if (monsterElement.includes('fantasma') || monsterElement.includes('ghost')) totalElemDmg += modifiers.damage_vs_ghost
    if (monsterElement.includes('veneno') || monsterElement.includes('poison')) totalElemDmg += modifiers.damage_vs_poison
    if (monsterElement.includes('neutro') || monsterElement.includes('neutral')) totalElemDmg += modifiers.damage_vs_neutral
    const elemMod = 1 + totalElemDmg / 100

    // Dano físico
    const totalPhysDmg = physicalDmg + modifiers.physical_damage_percent
    const physMod = 1 + totalPhysDmg / 100

    // Determinar se é ranged ou melee baseado na classe/skill
    const rangedClasses = ['atirador', 'menestrel', 'cigana', 'ninja', 'justiceiro']
    const rangedSkills = ['double-strafe', 'arrow-shower', 'sharp-shooting', 'arrow-vulcan', 'final-strike']
    const isRanged = rangedClasses.includes(selectedClass) || rangedSkills.includes(selectedSkill.id)
    
    const totalRangedDmg = isRanged ? rangedDmg + modifiers.ranged_damage_percent : 0
    const rangeMod = 1 + totalRangedDmg / 100

    // Melee (se não for ranged)
    const totalMeleeDmg = !isRanged ? modifiers.melee_damage_percent : 0
    const meleeMod = 1 + totalMeleeDmg / 100

    // Crítico
    const totalCritDmg = critDmg + modifiers.crit_damage_percent
    const critMod = isCritical ? 1 + totalCritDmg / 100 : 1

    // Buff modifiers
    let buffMod = 1
    if (hasPowerThrust) buffMod *= 1.25
    if (hasMaxPower) buffMod *= 2
    if (hasConcentrate) buffMod *= 1.25

    // Monster reduction
    const monsterReduction = 1 - (selectedMonster.reduction / 100)

    // Cálculo final
    const baseDamageMin = modifiedAtkMin * atkPercentMod * skillMult * skillHits * skillBonusMod
    const baseDamageMax = modifiedAtkMax * atkPercentMod * skillMult * skillHits * skillBonusMod
    const totalModifier = elementModifier * raceMod * sizeMod * elemMod * physMod * rangeMod * meleeMod * critMod * buffMod * monsterReduction

    const afterDefMin = baseDamageMin * (1 - hardDefReduction)
    const afterDefMax = baseDamageMax * (1 - hardDefReduction)

    const finalMin = Math.max(1, Math.floor(afterDefMin * totalModifier))
    const finalMax = Math.max(1, Math.floor(afterDefMax * totalModifier))
    const average = Math.floor((finalMin + finalMax) / 2)

    return {
      min: finalMin,
      max: finalMax,
      average,
      breakdown: {
        statusAtk,
        weaponAtk: weaponAtk > 0 ? `${weaponAtkMin}~${weaponAtkMax}` : '0',
        refineBonus,
        overRefineBonus,
        sizeModifier: `${Math.floor(sizeModifier * 100)}%`,
        elementModifier: `${Math.floor(elementModifier * 100)}%`,
        skillMultiplier: `${skillMultiplierValue}% x ${skillHits}`,
        hardDef: `${effectiveHardDef} (${Math.floor(hardDefReduction * 100)}%)`,
        totalModifier: `${Math.floor(totalModifier * 100)}%`
      }
    }
  }, [
    selectedMonster, totalStr, totalDex, totalLuk,
    equipmentStats, manualEquipAtk, manualCardAtk,
    attackElement, selectedSkill, skillLevel, selectedClass, isCritical,
    raceDmg, sizeDmg, elementDmg, physicalDmg, rangedDmg, critDmg, defBypass,
    hasPowerThrust, hasMaxPower, hasConcentrate
  ])

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <ToolsLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados...</p>
          </div>
        </div>
      </ToolsLayout>
    )
  }

  return (
    <ToolsLayout>
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6 flex items-center justify-center gap-3">
          <Swords className="w-8 h-8" />
          Tales Damage Calculator - Físico
        </h1>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ============================================ */}
          {/* COLUNA ESQUERDA - Classe e Personagem */}
          {/* ============================================ */}
          <div className="space-y-4">
            {/* Classe */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value)
                      const newSkills = PHYSICAL_SKILLS.filter(s => s.classes.includes(e.target.value))
                      if (newSkills.length > 0) setSelectedSkillId(newSkills[0].id)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {PHYSICAL_CLASSES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Força Heroica</label>
                  <input
                    type="number"
                    value={forcaHeroica}
                    onChange={(e) => setForcaHeroica(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isTemporada}
                    onChange={(e) => setIsTemporada(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  Temporada?
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={hasRunaTemporada}
                    onChange={(e) => setHasRunaTemporada(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  Runa da temporada?
                </label>
              </div>
            </div>

            {/* Personagem com Equipamentos */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="relative" style={{ height: '280px' }}>
                {/* Grid de equipamentos */}
                <div className="absolute inset-0">
                  {/* Linha superior: Topo - Meio */}
                  <div className="absolute top-0 left-0 right-0 flex justify-center gap-8">
                    <EquipmentSlotComponent
                      slot={EQUIPMENT_SLOTS[0]} // Topo
                      equipped={equippedItems.topo}
                      onClick={() => setModalSlot(EQUIPMENT_SLOTS[0])}
                      onCardClick={(idx) => setCardModalSlot({ slot: EQUIPMENT_SLOTS[0], cardIndex: idx })}
                      position=""
                    />
                    <EquipmentSlotComponent
                      slot={EQUIPMENT_SLOTS[1]} // Meio
                      equipped={equippedItems.meio}
                      onClick={() => setModalSlot(EQUIPMENT_SLOTS[1])}
                      onCardClick={(idx) => setCardModalSlot({ slot: EQUIPMENT_SLOTS[1], cardIndex: idx })}
                      position=""
                    />
                  </div>

                  {/* Linha 2: Baixo - Armadura */}
                  <div className="absolute top-14 left-4">
                    <EquipmentSlotComponent
                      slot={EQUIPMENT_SLOTS[2]} // Baixo
                      equipped={equippedItems.baixo}
                      onClick={() => setModalSlot(EQUIPMENT_SLOTS[2])}
                      onCardClick={(idx) => setCardModalSlot({ slot: EQUIPMENT_SLOTS[2], cardIndex: idx })}
                      position=""
                    />
                  </div>
                  <div className="absolute top-14 right-4">
                    <EquipmentSlotComponent
                      slot={EQUIPMENT_SLOTS[3]} // Armadura
                      equipped={equippedItems.armadura}
                      onClick={() => setModalSlot(EQUIPMENT_SLOTS[3])}
                      onCardClick={(idx) => setCardModalSlot({ slot: EQUIPMENT_SLOTS[3], cardIndex: idx })}
                      position=""
                    />
                  </div>

                  {/* Centro: Character Sprite */}
                  <div className="absolute top-12 left-1/2 -translate-x-1/2">
                    <img 
                      src={`https://tales-calc-next.vercel.app/classes/${classInfo.sprite}`}
                      alt={classInfo.name}
                      className="w-24 h-32 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/godly/hela.gif'
                      }}
                    />
                  </div>

                  {/* Linha 3: Mão Direita - Mão Esquerda */}
                  <div className="absolute top-32 left-4">
                    <EquipmentSlotComponent
                      slot={EQUIPMENT_SLOTS[4]} // Arma
                      equipped={equippedItems.arma}
                      onClick={() => setModalSlot(EQUIPMENT_SLOTS[4])}
                      onCardClick={(idx) => setCardModalSlot({ slot: EQUIPMENT_SLOTS[4], cardIndex: idx })}
                      position=""
                    />
                  </div>
                  <div className="absolute top-32 right-4">
                    <EquipmentSlotComponent
                      slot={EQUIPMENT_SLOTS[5]} // Escudo
                      equipped={equippedItems.escudo}
                      onClick={() => setModalSlot(EQUIPMENT_SLOTS[5])}
                      onCardClick={(idx) => setCardModalSlot({ slot: EQUIPMENT_SLOTS[5], cardIndex: idx })}
                      position=""
                    />
                  </div>

                  {/* Linha 4: Capa - Sapato */}
                  <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-8">
                    <EquipmentSlotComponent
                      slot={EQUIPMENT_SLOTS[6]} // Capa
                      equipped={equippedItems.capa}
                      onClick={() => setModalSlot(EQUIPMENT_SLOTS[6])}
                      onCardClick={(idx) => setCardModalSlot({ slot: EQUIPMENT_SLOTS[6], cardIndex: idx })}
                      position=""
                    />
                    <EquipmentSlotComponent
                      slot={EQUIPMENT_SLOTS[7]} // Sapato
                      equipped={equippedItems.sapato}
                      onClick={() => setModalSlot(EQUIPMENT_SLOTS[7])}
                      onCardClick={(idx) => setCardModalSlot({ slot: EQUIPMENT_SLOTS[7], cardIndex: idx })}
                      position=""
                    />
                  </div>

                  {/* Linha 5: Acessórios */}
                  <div className="absolute bottom-0 left-4">
                    <EquipmentSlotComponent
                      slot={EQUIPMENT_SLOTS[8]} // Acc R
                      equipped={equippedItems.acessorio1}
                      onClick={() => setModalSlot(EQUIPMENT_SLOTS[8])}
                      onCardClick={(idx) => setCardModalSlot({ slot: EQUIPMENT_SLOTS[8], cardIndex: idx })}
                      position=""
                    />
                  </div>
                  <div className="absolute bottom-0 right-4">
                    <EquipmentSlotComponent
                      slot={EQUIPMENT_SLOTS[9]} // Acc L
                      equipped={equippedItems.acessorio2}
                      onClick={() => setModalSlot(EQUIPMENT_SLOTS[9])}
                      onCardClick={(idx) => setCardModalSlot({ slot: EQUIPMENT_SLOTS[9], cardIndex: idx })}
                      position=""
                    />
                  </div>
                </div>
              </div>

              {/* Stats da arma equipada */}
              {equippedItems.arma.equipment && (
                <div className="mt-2 p-2 bg-orange-50 rounded-lg text-xs">
                  <div className="font-medium text-orange-800">{equippedItems.arma.equipment.name} +{equippedItems.arma.refine}</div>
                  <div className="text-orange-600">
                    ATK: {equippedItems.arma.equipment.weaponAttack} | Nv.{equippedItems.arma.equipment.level} | {equippedItems.arma.equipment.type}
                  </div>
                </div>
              )}
            </div>

            {/* Atributos */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="space-y-2">
                {[
                  { label: 'FOR', base: str, setBase: setStr, bonus: strBonus, setBonus: setStrBonus },
                  { label: 'AGI', base: agi, setBase: setAgi, bonus: agiBonus, setBonus: setAgiBonus },
                  { label: 'VIT', base: vit, setBase: setVit, bonus: vitBonus, setBonus: setVitBonus },
                  { label: 'INT', base: int_, setBase: setInt, bonus: intBonus, setBonus: setIntBonus },
                  { label: 'DES', base: dex, setBase: setDex, bonus: dexBonus, setBonus: setDexBonus },
                  { label: 'SOR', base: luk, setBase: setLuk, bonus: lukBonus, setBonus: setLukBonus },
                ].map(attr => (
                  <div key={attr.label} className="flex items-center gap-3">
                    <span className="w-10 text-sm font-semibold text-gray-700">{attr.label}</span>
                    <input
                      type="number"
                      value={attr.base}
                      onChange={(e) => attr.setBase(Number(e.target.value))}
                      className="w-14 px-2 py-1.5 text-center text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-gray-400 font-medium">+</span>
                    <input
                      type="number"
                      value={attr.bonus}
                      onChange={(e) => attr.setBonus(Number(e.target.value))}
                      className="w-14 px-2 py-1.5 text-center text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-sm font-medium text-blue-600 min-w-[40px]">= {attr.base + attr.bonus}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => {
                    setStr(99); setStrBonus(40)
                    setAgi(80); setAgiBonus(30)
                    setVit(50); setVitBonus(20)
                    setInt(1); setIntBonus(10)
                    setDex(70); setDexBonus(30)
                    setLuk(30); setLukBonus(10)
                  }}
                  className="flex-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Resetar Atributos
                </button>
                <button 
                  onClick={() => {
                    const initial: Record<string, EquippedItem> = {}
                    EQUIPMENT_SLOTS.forEach(slot => {
                      initial[slot.id] = { equipment: null, refine: 0, cards: [] }
                    })
                    setEquippedItems(initial)
                  }}
                  className="flex-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Resetar Tudo
                </button>
              </div>
              
              {/* Salvar/Carregar Build */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    const build = {
                      class: selectedClass,
                      skillId: selectedSkillId,
                      skillLevel,
                      stats: { str, strBonus, agi, agiBonus, vit, vitBonus, int: int_, intBonus, dex, dexBonus, luk, lukBonus },
                      baseLevel,
                      equippedItems,
                      modifiers: { manualEquipAtk, manualCardAtk, physicalDmg, rangedDmg, raceDmg, sizeDmg, elementDmg, critDmg, defBypass },
                      buffs: { hasPowerThrust, hasMaxPower, hasConcentrate, hasProvoke },
                      attackElement,
                      isCritical,
                    }
                    const name = prompt('Nome da build:')
                    if (name) {
                      const builds = JSON.parse(localStorage.getItem('ragnatales-builds') || '{}')
                      builds[name] = build
                      localStorage.setItem('ragnatales-builds', JSON.stringify(builds))
                      alert(`Build "${name}" salva!`)
                    }
                  }}
                  className="flex-1 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center gap-1"
                >
                  💾 Salvar
                </button>
                <button
                  onClick={() => {
                    const builds = JSON.parse(localStorage.getItem('ragnatales-builds') || '{}')
                    const names = Object.keys(builds)
                    if (names.length === 0) {
                      alert('Nenhuma build salva!')
                      return
                    }
                    const name = prompt(`Builds disponíveis:\n${names.join('\n')}\n\nDigite o nome:`)
                    if (name && builds[name]) {
                      const b = builds[name]
                      setSelectedClass(b.class)
                      setSelectedSkillId(b.skillId)
                      setSkillLevel(b.skillLevel || 10)
                      setStr(b.stats.str); setStrBonus(b.stats.strBonus)
                      setAgi(b.stats.agi); setAgiBonus(b.stats.agiBonus)
                      setVit(b.stats.vit); setVitBonus(b.stats.vitBonus)
                      setInt(b.stats.int); setIntBonus(b.stats.intBonus)
                      setDex(b.stats.dex); setDexBonus(b.stats.dexBonus)
                      setLuk(b.stats.luk); setLukBonus(b.stats.lukBonus)
                      setBaseLevel(b.baseLevel || 99)
                      setEquippedItems(b.equippedItems)
                      setManualEquipAtk(b.modifiers.manualEquipAtk)
                      setManualCardAtk(b.modifiers.manualCardAtk)
                      setPhysicalDmg(b.modifiers.physicalDmg)
                      setRangedDmg(b.modifiers.rangedDmg)
                      setRaceDmg(b.modifiers.raceDmg)
                      setSizeDmg(b.modifiers.sizeDmg)
                      setElementDmg(b.modifiers.elementDmg)
                      setCritDmg(b.modifiers.critDmg)
                      setDefBypass(b.modifiers.defBypass)
                      setHasPowerThrust(b.buffs.hasPowerThrust)
                      setHasMaxPower(b.buffs.hasMaxPower)
                      setHasConcentrate(b.buffs.hasConcentrate)
                      setHasProvoke(b.buffs.hasProvoke)
                      setAttackElement(b.attackElement)
                      setIsCritical(b.isCritical)
                      alert(`Build "${name}" carregada!`)
                    }
                  }}
                  className="flex-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
                >
                  📂 Carregar
                </button>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* COLUNA CENTRAL - Skill e Alvo */}
          {/* ============================================ */}
          <div className="space-y-4">
            {/* Skill e Elemento */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Skill</h3>
              
              <div className="space-y-3">
                <select
                  value={selectedSkillId}
                  onChange={(e) => {
                    setSelectedSkillId(e.target.value)
                    const skill = PHYSICAL_SKILLS.find(s => s.id === e.target.value) as any
                    if (skill?.maxLevel) setSkillLevel(skill.maxLevel)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {availableSkills.map(skill => {
                    const s = skill as any
                    const mult = s.levelMultipliers ? s.levelMultipliers[s.maxLevel || 10] : skill.multiplier
                    return (
                      <option key={skill.id} value={skill.id}>
                        {skill.name} ({mult}% x{skill.hits})
                      </option>
                    )
                  })}
                </select>

                {/* Nível da Skill */}
                {(selectedSkill as any).maxLevel && (selectedSkill as any).maxLevel > 1 && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Nível da Skill: {skillLevel}
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={(selectedSkill as any).maxLevel || 10}
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Nv.1</span>
                      <span className="font-medium text-blue-600">
                        {(selectedSkill as any).levelMultipliers?.[skillLevel] || selectedSkill.multiplier}%
                      </span>
                      <span>Nv.{(selectedSkill as any).maxLevel}</span>
                    </div>
                  </div>
                )}
                
                {/* Nota da Skill */}
                {(selectedSkill as any).note && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-700">
                    💡 {(selectedSkill as any).note}
                  </div>
                )}

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Element</label>
                  <select
                    value={attackElement}
                    onChange={(e) => setAttackElement(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {Object.keys(ELEMENT_TABLE).map(elem => (
                      <option key={elem} value={elem}>{elem.charAt(0).toUpperCase() + elem.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isCritical}
                    onChange={(e) => setIsCritical(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  Critical Hit
                </label>
              </div>
            </div>

            {/* Alvo */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Alvo</h3>
              
              <select
                value={selectedMonsterId}
                onChange={(e) => setSelectedMonsterId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
              >
                {monsters.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.category})
                  </option>
                ))}
              </select>

              {selectedMonster && (
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <img 
                      src="https://tales-calc-next.vercel.app/monsters/padrao.png"
                      alt={selectedMonster.name}
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  <div className="flex-1 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nome:</span>
                      <span className="font-medium">{selectedMonster.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Elemento:</span>
                      <span className="font-medium capitalize">{selectedMonster.element} {selectedMonster.elementLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Raça:</span>
                      <span className="font-medium capitalize">{selectedMonster.race}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tamanho:</span>
                      <span className="font-medium">{selectedMonster.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">HP:</span>
                      <span className="font-medium">{selectedMonster.hp.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">DEF / MDEF:</span>
                      <span className="font-medium">{selectedMonster.def} / {selectedMonster.mdef}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Redução:</span>
                      <span className="font-medium text-red-600">{selectedMonster.reduction}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ATK Stats */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">ATK Stats</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Status ATK:</span>
                  <span className="font-bold">{damageCalculation.breakdown.statusAtk}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Weapon ATK:</span>
                  <span className="font-bold">{damageCalculation.breakdown.weaponAtk}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Refine:</span>
                  <span className="font-bold">+{damageCalculation.breakdown.refineBonus}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Over-refine:</span>
                  <span className="font-bold">+{damageCalculation.breakdown.overRefineBonus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* COLUNA DIREITA - Dano e Modificadores */}
          {/* ============================================ */}
          <div className="space-y-4">
            {/* Resultado do Dano */}
            <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-4 text-center">Dano</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-sm opacity-80 mb-1">Mínimo</div>
                  <div className="text-3xl font-bold">{damageCalculation.min.toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm opacity-80 mb-1">Máximo</div>
                  <div className="text-3xl font-bold">{damageCalculation.max.toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/20 text-center">
                <div className="text-sm opacity-80">Médio</div>
                <div className="text-2xl font-bold">{damageCalculation.average.toLocaleString()}</div>
              </div>

              {selectedMonster && (
                <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-2 text-center">
                  <div>
                    <div className="text-xs opacity-80">Hits p/ matar</div>
                    <div className="text-lg font-bold">
                      {Math.ceil(selectedMonster.hp / damageCalculation.average)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs opacity-80">HP do Alvo</div>
                    <div className="text-lg font-bold">
                      {selectedMonster.hp.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Breakdown do Cálculo */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100"
              >
                <span className="font-semibold text-blue-800">📊 Breakdown do Cálculo</span>
                {showBreakdown ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {showBreakdown && (
                <div className="p-4 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">Status ATK</div>
                      <div className="font-medium">{damageCalculation.breakdown?.statusAtk || 0}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">Weapon ATK</div>
                      <div className="font-medium">{equipmentStats.weaponAtk}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">Refine Bonus</div>
                      <div className="font-medium">+{damageCalculation.breakdown?.refineBonus || 0}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">Over-refine</div>
                      <div className="font-medium">+{damageCalculation.breakdown?.overRefineBonus || 0}</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-2 mt-2">
                    <div className="text-xs text-gray-500 mb-1">Multiplicadores</div>
                    <div className="flex flex-wrap gap-1">
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                        Skill: {damageCalculation.breakdown?.skillMultiplier}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                        Size: {damageCalculation.breakdown?.sizeModifier}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs">
                        Element: {damageCalculation.breakdown?.elementModifier}
                      </span>
                      {equipmentStats.modifiers.atk_percent > 0 && (
                        <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs">
                          ATK%: +{equipmentStats.modifiers.atk_percent}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t pt-2 mt-2">
                    <div className="text-xs text-gray-500 mb-1">DEF do Alvo</div>
                    <div className="flex items-center gap-2">
                      <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">
                        {damageCalculation.breakdown?.hardDef}
                      </span>
                      {equipmentStats.modifiers.ignore_def_percent > 0 && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">
                          Ignore: {equipmentStats.modifiers.ignore_def_percent}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t pt-2 mt-2 text-center">
                    <div className="text-xs text-gray-500">Modificador Total</div>
                    <div className="text-lg font-bold text-blue-600">
                      {damageCalculation.breakdown?.totalModifier}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modificadores */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <button
                onClick={() => setShowModifiers(!showModifiers)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100"
              >
                <span className="font-semibold text-gray-800">Modificadores</span>
                {showModifiers ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {showModifiers && (
                <div className="p-4 space-y-3">
                  <div className="text-sm text-blue-600 font-medium mb-2">Físicos</div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Equip ATK', value: manualEquipAtk, setter: setManualEquipAtk },
                      { label: 'Card ATK', value: manualCardAtk, setter: setManualCardAtk },
                      { label: '% Dano Físico', value: physicalDmg, setter: setPhysicalDmg },
                      { label: '% Ranged', value: rangedDmg, setter: setRangedDmg },
                      { label: '% vs Raça', value: raceDmg, setter: setRaceDmg },
                      { label: '% vs Tamanho', value: sizeDmg, setter: setSizeDmg },
                      { label: '% vs Elemento', value: elementDmg, setter: setElementDmg },
                      { label: '% Crítico', value: critDmg, setter: setCritDmg },
                    ].map(mod => (
                      <div key={mod.label}>
                        <label className="block text-xs text-gray-600 mb-1">{mod.label}</label>
                        <input
                          type="number"
                          value={mod.value}
                          onChange={(e) => mod.setter(Number(e.target.value))}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    ))}
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">% DEF Bypass</label>
                      <input
                        type="number"
                        value={defBypass}
                        onChange={(e) => setDefBypass(Number(e.target.value))}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                  
                  {/* Bônus dos Equipamentos */}
                  {(equipmentStats.modifiers.atk_percent > 0 || 
                    equipmentStats.modifiers.physical_damage_percent > 0 ||
                    equipmentStats.modifiers.ranged_damage_percent > 0 ||
                    equipmentStats.modifiers.ignore_def_percent > 0 ||
                    equipmentStats.modifiers.damage_vs_all_sizes > 0 ||
                    equipmentStats.modifiers.damage_vs_all_races > 0) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm text-green-600 font-medium mb-2">📊 Bônus dos Equipamentos</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {equipmentStats.modifiers.atk_percent > 0 && (
                          <div className="bg-green-50 px-2 py-1 rounded">ATK: +{equipmentStats.modifiers.atk_percent}%</div>
                        )}
                        {equipmentStats.modifiers.atk_flat > 0 && (
                          <div className="bg-green-50 px-2 py-1 rounded">ATK: +{equipmentStats.modifiers.atk_flat}</div>
                        )}
                        {equipmentStats.modifiers.physical_damage_percent > 0 && (
                          <div className="bg-green-50 px-2 py-1 rounded">Físico: +{equipmentStats.modifiers.physical_damage_percent}%</div>
                        )}
                        {equipmentStats.modifiers.ranged_damage_percent > 0 && (
                          <div className="bg-green-50 px-2 py-1 rounded">Ranged: +{equipmentStats.modifiers.ranged_damage_percent}%</div>
                        )}
                        {equipmentStats.modifiers.melee_damage_percent > 0 && (
                          <div className="bg-green-50 px-2 py-1 rounded">Melee: +{equipmentStats.modifiers.melee_damage_percent}%</div>
                        )}
                        {equipmentStats.modifiers.ignore_def_percent > 0 && (
                          <div className="bg-green-50 px-2 py-1 rounded">Ign DEF: +{equipmentStats.modifiers.ignore_def_percent}%</div>
                        )}
                        {equipmentStats.modifiers.damage_vs_all_sizes > 0 && (
                          <div className="bg-green-50 px-2 py-1 rounded">vs Tam: +{equipmentStats.modifiers.damage_vs_all_sizes}%</div>
                        )}
                        {equipmentStats.modifiers.damage_vs_all_races > 0 && (
                          <div className="bg-green-50 px-2 py-1 rounded">vs Raça: +{equipmentStats.modifiers.damage_vs_all_races}%</div>
                        )}
                        {equipmentStats.modifiers.crit_damage_percent > 0 && (
                          <div className="bg-green-50 px-2 py-1 rounded">Crit: +{equipmentStats.modifiers.crit_damage_percent}%</div>
                        )}
                        {Object.entries(equipmentStats.modifiers.skill_damage).map(([skill, bonus]) => (
                          <div key={skill} className="bg-purple-50 px-2 py-1 rounded col-span-2">
                            [{skill}]: +{bonus}%
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Buffs */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <button
                onClick={() => setShowBuffs(!showBuffs)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100"
              >
                <span className="font-semibold text-gray-800">Buffs</span>
                {showBuffs ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {showBuffs && (
                <div className="p-4 space-y-2">
                  {[
                    { label: 'Power Thrust (+25%)', checked: hasPowerThrust, setter: setHasPowerThrust },
                    { label: 'Maximum Power Thrust (+100%)', checked: hasMaxPower, setter: setHasMaxPower },
                    { label: 'Concentração (+25% ATK)', checked: hasConcentrate, setter: setHasConcentrate },
                    { label: 'Provocar (no alvo)', checked: hasProvoke, setter: setHasProvoke },
                  ].map(buff => (
                    <label key={buff.label} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={buff.checked}
                        onChange={(e) => buff.setter(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      {buff.label}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Breakdown
              </h3>
              
              <div className="text-xs space-y-1.5 text-gray-600">
                {Object.entries(damageCalculation.breakdown).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="font-medium text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Modal */}
      {modalSlot && (
        <EquipmentModal
          isOpen={true}
          onClose={() => setModalSlot(null)}
          slot={modalSlot}
          equipments={equipments}
          weapons={weapons}
          onSelect={(eq, ref) => handleEquip(modalSlot.id, eq, ref)}
          currentEquipment={equippedItems[modalSlot.id]}
        />
      )}

      {/* Card Modal */}
      {cardModalSlot && (
        <CardModal
          isOpen={true}
          onClose={() => setCardModalSlot(null)}
          slotName={cardModalSlot.slot.name}
          cardIndex={cardModalSlot.cardIndex}
          cards={cards}
          onSelect={(card) => handleEquipCard(cardModalSlot.slot.id, cardModalSlot.cardIndex, card)}
          currentCard={equippedItems[cardModalSlot.slot.id].cards[cardModalSlot.cardIndex]}
          equipmentSlot={cardModalSlot.slot.id}
        />
      )}
    </div>
    </ToolsLayout>
  )
}
