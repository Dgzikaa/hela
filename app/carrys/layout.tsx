'use client'

import { SessionProvider } from 'next-auth/react'
import { AppSidebar } from '../components/AppSidebar'
import { TopBar } from '../components/TopBar'

export default function CarrysLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-gray-50">
        <AppSidebar defaultCollapsed={true} />
        <TopBar />
        <main className="flex-1 min-h-screen pt-16">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}

