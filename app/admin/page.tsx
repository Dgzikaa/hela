'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para a página de pedidos
    router.push('/admin/pedidos')
  }, [router])

  return null
}

