'use client'

import { SessionProvider } from 'next-auth/react'
import { AppSidebar } from './AppSidebar'

interface ToolsLayoutProps {
  children: React.ReactNode
}

export function ToolsLayout({ children }: ToolsLayoutProps) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-gray-50">
        <AppSidebar defaultCollapsed={true} />
        <main className="flex-1 min-h-screen lg:mt-0 mt-14">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}

