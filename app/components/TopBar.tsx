'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, Bell } from 'lucide-react'
import { UserMenu } from './UserMenu'
import { GlobalSearch } from './GlobalSearch'
import { NotificationCenter } from './NotificationCenter'

interface TopBarProps {
  title?: string
}

export function TopBar({ title }: TopBarProps) {
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
    <header className="fixed top-0 right-0 left-0 lg:left-16 h-14 bg-white border-b border-gray-200 z-40 px-3 md:px-6">
      <div className="h-full flex items-center justify-between gap-4">
        {/* Logo Mobile / Título Desktop */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo Mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-base font-bold">H</span>
            </div>
            <span className="text-gray-900 font-bold text-sm truncate">{title || 'Hela Carrys'}</span>
          </div>
          
          {/* Título Desktop */}
          <div className="hidden lg:block">
            <h1 className="text-gray-900 font-bold text-base truncate">{title || 'Hela Carrys'}</h1>
          </div>
        </div>

        {/* Busca Global (Centralizada Desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-xl justify-center">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="relative w-full group"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-gray-500 transition-colors" />
            <div className="w-full pl-10 pr-14 py-2 bg-gray-50 border border-gray-200 rounded-lg text-left text-gray-500 hover:border-purple-300 hover:bg-gray-100 transition-colors text-sm">
              Buscar clientes, pedidos, jogadores...
            </div>
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-white rounded border border-gray-300 text-xs text-gray-500 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Ações da Direita */}
        <div className="flex items-center gap-3">
          {/* Busca Mobile */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>

          {/* Global Search Modal */}
          <GlobalSearch 
            isOpen={isSearchOpen} 
            onClose={() => setIsSearchOpen(false)} 
          />

          {/* Notificações */}
          {isLoggedIn && <NotificationCenter />}

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

