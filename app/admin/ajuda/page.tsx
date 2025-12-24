'use client'

import { useState } from 'react'
import { HelpCircle, Book, MessageCircle, Video, FileText, ChevronDown, ChevronRight } from 'lucide-react'
import { Card } from '@/app/components/Card'

interface FAQ {
  pergunta: string
  resposta: string
  categoria: string
}

export default function AjudaPage() {
  const [faqAberto, setFaqAberto] = useState<number | null>(null)

  const faqs: FAQ[] = [
    {
      categoria: 'Carrys',
      pergunta: 'Como funciona o sistema de agendamento de carrys?',
      resposta: 'O sistema permite agendar carrys através da página de Agendamento. Você pode selecionar os bosses, definir data/hora, e o sistema automaticamente notifica todos os participantes via Discord.'
    },
    {
      categoria: 'Carrys',
      pergunta: 'Como são calculados os pagamentos?',
      resposta: 'Os pagamentos são divididos igualmente entre todos os jogadores participantes do carry. O valor é calculado automaticamente baseado no número de participantes e o valor total do pedido.'
    },
    {
      categoria: 'Carrys',
      pergunta: 'O que acontece se um carry for cancelado?',
      resposta: 'Quando um carry é cancelado, todos os participantes são notificados automaticamente via Discord. Se houver pagamento de reserva, ele será devolvido ao cliente.'
    },
    {
      categoria: 'Sistema',
      pergunta: 'Como ativar o modo escuro?',
      resposta: 'Você pode ativar o modo escuro clicando no seu avatar no canto superior direito e selecionando "Modo Escuro", ou através da página de Configurações.'
    },
    {
      categoria: 'Sistema',
      pergunta: 'Como alterar minha senha?',
      resposta: 'Acesse Meu Perfil através do menu do usuário no canto superior direito. Role até a seção "Segurança" e preencha os campos de nova senha.'
    },
    {
      categoria: 'Notificações',
      pergunta: 'Como configurar notificações do Discord?',
      resposta: 'Acesse Configurações no menu do usuário e ative "Notificações Discord". Certifique-se de que seu Discord está vinculado ao sistema.'
    },
    {
      categoria: 'Ferramentas',
      pergunta: 'Como usar a Calculadora Tigrinho?',
      resposta: 'A Calculadora Tigrinho permite simular tiradas de Expedição e Somatologia. Selecione os itens, veja os preços atualizados do mercado e calcule suas chances de lucro.'
    },
    {
      categoria: 'Ferramentas',
      pergunta: 'Os preços são atualizados automaticamente?',
      resposta: 'Sim! Os preços do mercado são atualizados automaticamente através do sistema RagnaTales Watcher que monitora o mercado em tempo real.'
    },
  ]

  const categorias = Array.from(new Set(faqs.map(faq => faq.categoria)))

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">❓ Central de Ajuda</h1>
          <p className="text-gray-600">Encontre respostas e aprenda a usar o sistema</p>
        </div>

        {/* Cards de Recursos */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <Book className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Documentação</h3>
            <p className="text-sm text-gray-600">Guias completos</p>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <Video className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Tutoriais</h3>
            <p className="text-sm text-gray-600">Vídeos passo a passo</p>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <MessageCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Suporte Discord</h3>
            <p className="text-sm text-gray-600">Chat ao vivo</p>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <FileText className="w-12 h-12 text-orange-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Changelog</h3>
            <p className="text-sm text-gray-600">Novidades</p>
          </Card>
        </div>

        {/* Guias Rápidos */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🚀 Guias Rápidos</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-bold text-purple-900 mb-2">📅 Agendar um Carry</h3>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Acesse "Carrys → Agendamento"</li>
                <li>Clique em "Novo Pedido"</li>
                <li>Preencha dados do cliente e selecione bosses</li>
                <li>Escolha data/hora e confirme</li>
              </ol>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-2">💰 Ver Meus Ganhos</h3>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Clique no seu avatar (canto superior direito)</li>
                <li>Selecione "Meus Ganhos"</li>
                <li>Veja histórico e projeções</li>
              </ol>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-bold text-green-900 mb-2">🎰 Usar Calculadora Tigrinho</h3>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Acesse "Ferramentas → Tigrinho"</li>
                <li>Selecione os itens que possui</li>
                <li>Veja os preços atualizados</li>
                <li>Calcule seu lucro potencial</li>
              </ol>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="font-bold text-orange-900 mb-2">⚙️ Personalizar Sistema</h3>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Clique no seu avatar</li>
                <li>Selecione "Configurações"</li>
                <li>Ative/desative notificações</li>
                <li>Configure modo escuro e preferências</li>
              </ol>
            </div>
          </div>
        </Card>

        {/* FAQ */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <HelpCircle className="w-6 h-6" />
            Perguntas Frequentes
          </h2>

          {categorias.map(categoria => (
            <div key={categoria} className="mb-6">
              <h3 className="text-lg font-bold text-purple-600 mb-3">{categoria}</h3>
              <div className="space-y-2">
                {faqs
                  .filter(faq => faq.categoria === categoria)
                  .map((faq, index) => {
                    const faqIndex = faqs.indexOf(faq)
                    const isAberto = faqAberto === faqIndex
                    
                    return (
                      <div key={faqIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setFaqAberto(isAberto ? null : faqIndex)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                        >
                          <span className="font-semibold text-gray-900">{faq.pergunta}</span>
                          {isAberto ? (
                            <ChevronDown className="w-5 h-5 text-purple-600" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        {isAberto && (
                          <div className="p-4 bg-white border-t border-gray-200">
                            <p className="text-gray-700">{faq.resposta}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </Card>

        {/* Contato */}
        <Card className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ainda precisa de ajuda?</h3>
            <p className="text-gray-600 mb-4">
              Nossa equipe está disponível no Discord para te ajudar!
            </p>
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold">
              Abrir Suporte no Discord
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}

