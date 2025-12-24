'use client'

import { SessionProvider } from 'next-auth/react'
import { AppSidebar } from './AppSidebar'
import { TopBar } from './TopBar'

interface ToolsLayoutProps {
  children: React.ReactNode
  title?: string
}

export function ToolsLayout({ children, title }: ToolsLayoutProps) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-gray-50">
        <AppSidebar defaultCollapsed={true} />
        <TopBar title={title} />
        <main className="flex-1 min-h-screen pt-14 px-3 md:px-4 py-4">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}

