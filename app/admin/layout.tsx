'use client'

import { SessionProvider, useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { AdminSidebar } from '../components/AdminSidebar'

function AdminContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // Rota de login não precisa de autenticação
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    // Se não está na página de login e não está autenticado, redireciona
    if (!isLoginPage && status === 'unauthenticated') {
      router.push('/admin/login')
    }
    // Se está na página de login e está autenticado, redireciona para o admin
    if (isLoginPage && status === 'authenticated') {
      router.push('/admin/pedidos')
    }
  }, [status, router, isLoginPage])

  // Página de login - renderiza direto sem sidebar
  if (isLoginPage) {
    return <>{children}</>
  }

  // Carregando
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen bg-slate-900 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando...</p>
        </div>
      </div>
    )
  }

  // Não logado - não mostra nada (vai redirecionar)
  if (!session) {
    return (
      <div className="flex min-h-screen bg-slate-900 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Redirecionando...</p>
        </div>
      </div>
    )
  }

  // Logado - mostra o conteúdo com sidebar
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 mt-14 lg:mt-0">
        {children}
      </main>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <AdminContent>{children}</AdminContent>
    </SessionProvider>
  )
}

