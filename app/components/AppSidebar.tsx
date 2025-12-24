'use client'

import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { 
  ShoppingCart,
  Users,
  Calendar,
  LogOut,
  Menu,
  X,
  Gamepad2,
  Trash2,
  TrendingUp,
  Dices,
  Gift,
  BarChart3,
  Flame,
  Home,
  ChevronLeft,
  ChevronRight,
  Sword,
  LineChart,
  Settings,
  Target,
  Wallet,
  CalendarRange,
  Wrench,
  Calculator,
  UserCog
} from 'lucide-react'
import { useState } from 'react'

interface MenuItem {
  name: string
  href: string
  icon: any
  isAdmin?: boolean
  isDanger?: boolean
  category?: string
}

interface MenuCategory {
  name: string
  items: MenuItem[]
}

// Home sempre visível (sem categoria)
const homeItem: MenuItem = { name: 'Home', href: '/', icon: Home }

// Categorias do menu
const menuCategories: MenuCategory[] = [
  {
    name: 'Carrys',
    items: [
      { name: 'Agendamento', href: '/admin/pedidos', icon: Calendar, isAdmin: true },
      { name: 'Resumo', href: '/admin/projecao', icon: Wallet, isAdmin: true },
      { name: 'Calendário', href: '/admin/calendario', icon: CalendarRange, isAdmin: true },
      { name: 'CRM', href: '/admin/crm', icon: BarChart3, isAdmin: true },
      { name: 'Carry Grátis', href: '/admin/carry-gratis', icon: Gift, isAdmin: true },
    ]
  },
  {
    name: 'Ferramentas',
    items: [
      { name: 'Tigrinho', href: '/calculadora', icon: Dices },
      { name: 'Preços', href: '/precos', icon: LineChart },
    ]
  },
  {
    name: 'Calculadoras',
    items: [
      { name: 'Calc. Física', href: '/calculadora-fisica', icon: Target },
      { name: 'Calc. Mágica', href: '/dano', icon: Sword },
      { name: 'Farm', href: '/farm', icon: Flame },
    ]
  },
  {
    name: 'Configurações',
    items: [
      { name: 'Config. Preços', href: '/config-farm', icon: Settings, isAdmin: true },
      { name: 'Usuários', href: '/admin/usuarios', icon: Users, isAdmin: true },
      { name: 'Membros', href: '/admin/jogadores', icon: Gamepad2, isAdmin: true },
    ]
  }
]

// Item de perigo (Limpar Dados)
const dangerItem: MenuItem = { name: 'Limpar Dados', href: '/admin/limpar', icon: Trash2, isAdmin: true, isDanger: true }

interface AppSidebarProps {
  defaultCollapsed?: boolean
}

export function AppSidebar({ defaultCollapsed = true }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [isHovering, setIsHovering] = useState(false)

  const isLoggedIn = status === 'authenticated'
  
  // Determina se deve mostrar expandido (colapsado mas com hover, ou não colapsado)
  const showExpanded = !isCollapsed || isHovering

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/admin/login')
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  // Filtra categorias baseado no status de login
  const getVisibleCategories = (): MenuCategory[] => {
    return menuCategories.map(category => ({
      ...category,
      items: category.items.filter(item => {
        if (item.isAdmin) return isLoggedIn
        return true
      })
    })).filter(category => category.items.length > 0)
  }

  const visibleCategories = getVisibleCategories()
  const showDangerItem = isLoggedIn && dangerItem.isAdmin

  return (
    <>
      {/* Header Mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Hela Carrys
          </h1>
        </div>
      </div>

      {/* Overlay Mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 mt-14"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 shadow-lg
          transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${showExpanded ? 'w-64' : 'w-16'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 h-16">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <span className="text-white text-xl font-bold">H</span>
            </div>
            {showExpanded && (
              <div className="overflow-hidden">
                <h1 className="text-gray-900 font-bold text-lg whitespace-nowrap">Hela Carrys</h1>
                <p className="text-gray-500 text-xs">RagnaTales</p>
              </div>
            )}
          </div>

          {/* Toggle Collapse Button (desktop only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-300 hover:bg-gray-100 rounded-full items-center justify-center text-gray-600 hover:text-gray-900 transition-colors z-10 shadow-sm"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
            {/* Home - Sempre visível separado */}
            <button
              onClick={() => {
                router.push(homeItem.href)
                setIsMobileMenuOpen(false)
              }}
              title={!showExpanded ? homeItem.name : undefined}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200 group
                ${isActive(homeItem.href)
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
                ${!showExpanded ? 'justify-center' : ''}
              `}
            >
              <homeItem.icon className={`w-5 h-5 shrink-0 transition-transform ${isActive(homeItem.href) ? '' : 'group-hover:scale-110'}`} />
              {showExpanded && (
                <span className="font-medium text-sm whitespace-nowrap">{homeItem.name}</span>
              )}
            </button>

            {/* Separador após Home */}
            {showExpanded && <div className="my-2 border-t border-gray-200" />}
            {!showExpanded && <div className="my-1 border-t border-gray-200" />}

            {/* Categorias */}
            {visibleCategories.map((category, categoryIndex) => (
              <div key={category.name}>
                {showExpanded && (
                  <p className="px-3 py-2 mt-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {category.name}
                  </p>
                )}
                {!showExpanded && categoryIndex > 0 && <div className="my-1 border-t border-gray-200" />}
                
                {category.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href)
                        setIsMobileMenuOpen(false)
                      }}
                      title={!showExpanded ? item.name : undefined}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                        transition-all duration-200 group
                        ${active 
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }
                        ${!showExpanded ? 'justify-center' : ''}
                      `}
                    >
                      <Icon className={`w-5 h-5 shrink-0 transition-transform ${active ? '' : 'group-hover:scale-110'}`} />
                      {showExpanded && (
                        <span className="font-medium text-sm whitespace-nowrap">{item.name}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}

            {/* Danger Item - Limpar Dados */}
            {showDangerItem && (
              <>
                {showExpanded && <div className="mt-4 border-t border-gray-200" />}
                {!showExpanded && <div className="mt-2 border-t border-gray-200" />}
                
                <button
                  onClick={() => {
                    router.push(dangerItem.href)
                    setIsMobileMenuOpen(false)
                  }}
                  title={!showExpanded ? dangerItem.name : undefined}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200 group mt-2
                    ${isActive(dangerItem.href)
                      ? 'bg-red-600 text-white' 
                      : 'text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200'
                    }
                    ${!showExpanded ? 'justify-center' : ''}
                  `}
                >
                  <dangerItem.icon className={`w-5 h-5 shrink-0 transition-transform ${isActive(dangerItem.href) ? '' : 'group-hover:scale-110'}`} />
                  {showExpanded && (
                    <span className="font-medium text-sm whitespace-nowrap">⚠️ {dangerItem.name}</span>
                  )}
                </button>
              </>
            )}
          </nav>

          {/* Footer - Login/Logout */}
          <div className="p-2 border-t border-gray-200">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                title={!showExpanded ? 'Sair' : undefined}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-red-600 hover:text-red-700 hover:bg-red-50 transition-all group
                  ${!showExpanded ? 'justify-center' : ''}
                `}
              >
                <LogOut className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                {showExpanded && <span className="font-medium text-sm">Sair</span>}
              </button>
            ) : (
              <button
                onClick={() => router.push('/admin/login')}
                title={!showExpanded ? 'Login Admin' : undefined}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all group
                  ${!showExpanded ? 'justify-center' : ''}
                `}
              >
                <Users className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                {showExpanded && <span className="font-medium text-sm">Login Admin</span>}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Spacer para o conteúdo não ficar embaixo do sidebar */}
      <div className={`hidden lg:block shrink-0 transition-all duration-300 ${showExpanded ? 'w-64' : 'w-16'}`} />
    </>
  )
}
