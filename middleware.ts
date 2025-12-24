import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Se está autenticado e tentando acessar /login, redireciona para home
    if (req.nextUrl.pathname === '/login' && req.nextauth.token) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // A página de login é pública
        if (req.nextUrl.pathname === '/login') {
          return true
        }
        // Todas as outras rotas exigem autenticação
        return !!token
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

// Protege todas as rotas exceto as públicas
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (autenticação do NextAuth)
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico (favicon)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

