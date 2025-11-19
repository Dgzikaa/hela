'use client'

import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { 
  LayoutDashboard,
  ShoppingCart,
  Users,
  Calendar,
  MessageSquare,
  Crown,
  LogOut,
  Menu,
  X,
  Gamepad2,
  Trash2
} from 'lucide-react'
import { useState } from 'react'

interface MenuItem {
  name: string
  href: string
  icon: any
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Pedidos', href: '/admin/pedidos', icon: ShoppingCart },
  { name: 'Calendário', href: '/admin/calendario', icon: Calendar },
  { name: 'Jogadores', href: '/admin/jogadores', icon: Gamepad2 },
  { name: 'Leads', href: '/admin/leads', icon: MessageSquare },
  { name: 'Clientes VIP', href: '/admin/clientes', icon: Crown },
  { name: 'Usuários', href: '/admin/usuarios', icon: Users },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/admin/login')
  }

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname?.startsWith(href)
  }

  return (
    <>
      {/* Header Mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-600 hover:text-purple-600 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="text-xl font-bold text-gray-900">Hela Carrys</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow-lg shadow-purple-200">
            <span className="text-white text-sm font-bold">
              {session?.user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
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
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
          transition-transform duration-300 ease-in-out shadow-xl
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:w-64
          w-64
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="hidden lg:flex items-center gap-3 p-6 border-b border-gray-100">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
              <span className="text-white text-xl font-bold">H</span>
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-lg">Hela Carrys</h1>
              <p className="text-gray-500 text-xs font-medium">Admin Panel</p>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow-lg shadow-purple-200">
                <span className="text-white font-bold text-sm">
                  {session?.user?.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-semibold text-sm truncate">
                  {session?.user?.name}
                </p>
                <p className="text-gray-500 text-xs truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200 group
                    ${active 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]' 
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 transition-transform ${active ? '' : 'group-hover:scale-110'}`} />
                  <span className="font-semibold text-sm">{item.name}</span>
                </button>
              )
            })}

            {/* Separador */}
            <div className="my-4 border-t border-gray-200"></div>

            {/* Limpar Dados - Ação Crítica */}
            <button
              onClick={() => {
                router.push('/admin/limpar')
                setIsMobileMenuOpen(false)
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200 group
                ${isActive('/admin/limpar')
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-[1.02]' 
                  : 'text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200'
                }
              `}
            >
              <Trash2 className={`w-5 h-5 transition-transform ${isActive('/admin/limpar') ? '' : 'group-hover:scale-110'}`} />
              <span className="font-semibold text-sm">⚠️ Limpar Dados</span>
            </button>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition-all group"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-sm">Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

