'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ComprarCarry() {
  const router = useRouter()
  
  // Redirecionar para home (página oculta - usar apenas bot Discord)
  useEffect(() => {
    router.push('/')
  }, [router])
  
  // Retornar null para evitar renderização enquanto redireciona
  return null
}
