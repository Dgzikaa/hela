'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Search, Bell } from 'lucide-react'
import { UserMenu } from './UserMenu'

export function TopBar() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const isLoggedIn = status === 'authenticated'

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b border-gray-200 z-30 px-4 md:px-8">
      <div className="h-full flex items-center justify-between">
        {/* Logo Mobile (aparece só em mobile) */}
        <div className="lg:hidden flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl font-bold">H</span>
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-lg">Hela Carrys</h1>
            <p className="text-gray-500 text-xs">RagnaTales</p>
          </div>
        </div>

        {/* Busca Global (Desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-2xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar clientes, pedidos, jogadores..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Ações da Direita */}
        <div className="flex items-center gap-4">
          {/* Busca Mobile */}
          <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Search className="w-5 h-5 text-gray-600" />
          </button>

          {/* Notificações - Comentado por enquanto, sistema Discord já existe */}
          {/* {isLoggedIn && (
            <button 
              onClick={() => router.push('/notificacoes')}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          )} */}

          {/* Menu do Usuário */}
          {isLoggedIn ? (
            <UserMenu />
          ) : (
            <button
              onClick={() => router.push('/admin/login')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

