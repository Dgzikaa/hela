'use client'

import { SessionProvider } from 'next-auth/react'
import { AdminSidebar } from '../components/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 lg:ml-64 mt-14 lg:mt-0">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}

