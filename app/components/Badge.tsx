import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-purple-600/80 text-white',
    success: 'bg-green-600/80 text-white',
    warning: 'bg-yellow-600/80 text-white',
    danger: 'bg-red-600/80 text-white',
    info: 'bg-blue-600/80 text-white',
  }
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

