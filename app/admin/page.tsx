'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para a home
    router.push('/')
  }, [router])

  return null
}

