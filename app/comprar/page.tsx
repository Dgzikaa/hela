'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, ShoppingCart, Check } from 'lucide-react'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Input, Textarea } from '../components/Input'

interface Boss {
  id: number
  nome: string
  mobId: number
  ordem: number
  preco: number
  imagemUrl: string
}

export default function ComprarCarry() {
  const router = useRouter()
  
  // Redirecionar para home (página oculta - usar apenas bot Discord)
  useEffect(() => {
    router.push('/')
  }, [router])
  
  const [bosses, setBosses] = useState<Boss[]>([])
  const [bosseselecionados, setBossesSelecionados] = useState<number[]>([])
  const [conquistaSemMorrer, setConquistaSemMorrer] = useState(false)
  const [nomeCliente, setNomeCliente] = useState('')
  const [contatoCliente, setContatoCliente] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    carregarBosses()
  }, [])

  const carregarBosses = async () => {
    try {
      const res = await fetch('/api/bosses')
      if (res.ok) {
        const data = await res.json()
        // Ordenar por ordem (1-6), Hela fica por último
        const ordenados = data.sort((a: Boss, b: Boss) => {
          if (a.ordem === 0) return 1 // Hela por último
          if (b.ordem === 0) return -1
          return a.ordem - b.ordem
        })
        setBosses(ordenados)
      }
    } catch (error) {
      console.error('Erro ao carregar bosses:', error)
    }
  }

  const toggleBoss = (bossId: number) => {
    setBossesSelecionados(prev => 
      prev.includes(bossId) 
        ? prev.filter(id => id !== bossId)
        : [...prev, bossId]
    )
  }

  const calcularTotal = () => {
    let total = 0
    
    // Somar preços dos bosses individuais
    bosseselecionados.forEach(bossId => {
      const boss = bosses.find(b => b.id === bossId)
      if (boss) total += boss.preco
    })

    // Verificar se comprou 1-6 completo
    const bosses16 = bosses.filter(b => b.ordem >= 1 && b.ordem <= 6)
    const todosSelecionados = bosses16.every(b => bosseselecionados.includes(b.id))
    
    if (todosSelecionados) {
      // Pacote completo: 500KK (conquista sem morrer GRÁTIS!)
      total = 500
      setConquistaSemMorrer(true) // Auto-ativa o brinde
    } else if (conquistaSemMorrer) {
      // Conquista sem morrer avulsa
      total += 150
    }

    return total
  }

  const temDesconto = () => {
    const bosses16 = bosses.filter(b => b.ordem >= 1 && b.ordem <= 6)
    return bosses16.every(b => bosseselecionados.includes(b.id))
  }

  const enviarPedido = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (bosseselecionados.length === 0) {
      alert('Selecione pelo menos um boss!')
      return
    }

    setEnviando(true)

    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeCliente,
          contatoCliente,
          bosses: bosseselecionados,
          conquistaSemMorrer,
          pacoteCompleto: temDesconto(),
          valorTotal: calcularTotal(),
          observacoes
        })
      })

      if (res.ok) {
        setSucesso(true)
        // Resetar form
        setBossesSelecionados([])
        setConquistaSemMorrer(false)
        setNomeCliente('')
        setContatoCliente('')
        setObservacoes('')
        
        setTimeout(() => setSucesso(false), 5000)
      } else {
        alert('Erro ao enviar pedido. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao enviar pedido. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-slate-900 rounded-2xl shadow-xl">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
              Comprar Carry
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            Escolha os bosses e garanta suas conquistas!
          </p>
        </div>

        {/* Mensagem de Sucesso */}
        {sucesso && (
          <Card className="mb-6 bg-green-50 border-green-200 animate-fade-in">
            <div className="flex items-center gap-3 text-green-800">
              <Check className="w-6 h-6" />
              <div>
                <p className="font-bold">Pedido enviado com sucesso!</p>
                <p className="text-sm">Entraremos em contato em breve.</p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Seleção de Bosses */}
          <div className="md:col-span-2">
            <Card className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Selecione os Bosses
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {bosses.map((boss) => (
                  <button
                    key={boss.id}
                    onClick={() => toggleBoss(boss.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      bosseselecionados.includes(boss.id)
                        ? 'border-slate-900 bg-slate-50 shadow-lg scale-105'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="absolute top-3 right-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        bosseselecionados.includes(boss.id)
                          ? 'bg-slate-900 border-slate-900'
                          : 'border-slate-300'
                      }`}>
                        {bosseselecionados.includes(boss.id) && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Imagem do Boss */}
                    <div className="mb-3 flex items-center justify-center">
                      <img 
                        src={boss.imagemUrl} 
                        alt={boss.nome}
                        className="w-24 h-24 object-contain"
                        loading="lazy"
                      />
                    </div>

                    {/* Info */}
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      {boss.nome}
                    </h3>
                    <p className="text-2xl font-bold text-slate-900">
                      {boss.preco}KK
                    </p>
                    {boss.ordem > 0 && (
                      <p className="text-xs text-slate-500">Boss {boss.ordem}</p>
                    )}
                  </button>
                ))}
              </div>

              {/* Conquista Sem Morrer */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={conquistaSemMorrer}
                    onChange={(e) => setConquistaSemMorrer(e.target.checked)}
                    disabled={temDesconto()} // Desabilita se tem pacote completo
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">Conquista: Sem Morrer</p>
                    <p className="text-sm text-slate-600">
                      {temDesconto() 
                        ? '🎁 GRÁTIS no pacote 1-6!' 
                        : '+150KK'}
                    </p>
                  </div>
                </label>
              </div>

              {/* Aviso Desconto */}
              {temDesconto() && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-800 font-bold text-center">
                    🎉 PACOTE COMPLETO (1-6)! Economia de {(70+100+130+150+230+300) - 500}KK + Conquista Sem Morrer GRÁTIS!
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Resumo e Formulário */}
          <div>
            <Card className="sticky top-4">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Resumo do Pedido
              </h2>

              {/* Total */}
              <div className="mb-6 p-4 bg-slate-900 rounded-xl text-white">
                <p className="text-sm opacity-80 mb-1">Valor Total</p>
                <p className="text-3xl font-bold">{calcularTotal()}KK</p>
                {bosseselecionados.length > 0 && (
                  <p className="text-xs opacity-60 mt-1">
                    {bosseselecionados.length} boss{bosseselecionados.length > 1 ? 'es' : ''} selecionado{bosseselecionados.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Formulário */}
              <form onSubmit={enviarPedido} className="space-y-4">
                <Input
                  label="Seu Nome *"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  placeholder="Nome do personagem"
                  required
                />

                <Input
                  label="Contato (Discord/WhatsApp) *"
                  value={contatoCliente}
                  onChange={(e) => setContatoCliente(e.target.value)}
                  placeholder="Discord#1234 ou (11) 99999-9999"
                  required
                />

                <Textarea
                  label="Observações"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Informações adicionais..."
                  rows={3}
                />

                <Button 
                  type="submit" 
                  fullWidth 
                  disabled={enviando || bosseselecionados.length === 0}
                >
                  {enviando ? 'Enviando...' : 'Solicitar Carry'}
                </Button>

                <p className="text-xs text-slate-500 text-center">
                  Após o envio, entraremos em contato para confirmação e agendamento.
                </p>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

