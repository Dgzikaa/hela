'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { 
  User, 
  LogOut, 
  Settings, 
  Moon, 
  Sun, 
  Bell,
  Wallet,
  HelpCircle,
  ChevronDown
} from 'lucide-react'

export function UserMenu() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fechar menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Carregar preferência de tema do localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const menuItems: Array<{
    label: string
    icon: any
    onClick: () => void
    show: boolean
    badge?: string
  }> = [
    {
      label: 'Meu Perfil',
      icon: User,
      onClick: () => {
        router.push('/configuracoes/perfil')
        setIsOpen(false)
      },
      show: true
    },
    {
      label: 'Meus Ganhos',
      icon: Wallet,
      onClick: () => {
        router.push('/admin/meus-ganhos')
        setIsOpen(false)
      },
      show: true
    },
    {
      label: isDarkMode ? 'Modo Claro' : 'Modo Escuro',
      icon: isDarkMode ? Sun : Moon,
      onClick: toggleDarkMode,
      show: true
    },
    {
      label: 'Configurações',
      icon: Settings,
      onClick: () => {
        router.push('/configuracoes/geral')
        setIsOpen(false)
      },
      show: true
    },
    {
      label: 'Ajuda',
      icon: HelpCircle,
      onClick: () => {
        router.push('/admin/ajuda')
        setIsOpen(false)
      },
      show: true
    },
  ]

  if (!session) {
    return null
  }

  // Pegar iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Botão do Usuário */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {/* Avatar */}
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm">
            {getInitials(session.user?.name || 'U')}
          </span>
        </div>
        
        {/* Nome e Email */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-gray-900">
            {session.user?.name}
          </p>
          <p className="text-xs text-gray-500">
            {session.user?.email}
          </p>
        </div>

        {/* Seta */}
        <ChevronDown 
          className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
          {/* Header do Menu */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">
              {session.user?.name}
            </p>
            <p className="text-xs text-gray-500">
              {session.user?.email}
            </p>
          </div>

          {/* Items do Menu */}
          <div className="py-2">
            {menuItems.filter(item => item.show).map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700 font-medium flex-1">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Sair */}
          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left text-red-600"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">
                Sair
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

