'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, Bell } from 'lucide-react'
import { UserMenu } from './UserMenu'
import { GlobalSearch } from './GlobalSearch'
import { NotificationCenter } from './NotificationCenter'

export function TopBar() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const isLoggedIn = status === 'authenticated'
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Atalho Ctrl+K / Cmd+K para abrir busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
          <button
            onClick={() => setIsSearchOpen(true)}
            className="relative w-full group"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-gray-500 transition-colors" />
            <div className="w-full pl-10 pr-16 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-left text-gray-500 dark:text-gray-400 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors text-sm">
              Buscar clientes, pedidos, jogadores...
            </div>
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Ações da Direita */}
        <div className="flex items-center gap-4">
          {/* Busca Mobile */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Global Search Modal */}
          <GlobalSearch 
            isOpen={isSearchOpen} 
            onClose={() => setIsSearchOpen(false)} 
          />

          {/* Notificações */}
          {isLoggedIn && <NotificationCenter />}
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
              onClick={() => router.push('/login')}
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

