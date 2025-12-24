'use client'

import { SessionProvider } from 'next-auth/react'
import { AppSidebar } from './AppSidebar'
import { TopBar } from './TopBar'

interface ToolsLayoutProps {
  children: React.ReactNode
}

export function ToolsLayout({ children }: ToolsLayoutProps) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-gray-50">
        <AppSidebar defaultCollapsed={true} />
        <TopBar />
        <main className="flex-1 min-h-screen pt-14">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}

