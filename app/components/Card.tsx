import { ReactNode, CSSProperties } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
  style?: CSSProperties
  onClick?: () => void
}

export function Card({ children, className, hover = false, gradient = false, style, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-6 transition-all duration-300 border',
        gradient 
          ? 'bg-white border-slate-200 shadow-sm' 
          : 'bg-white border-slate-200',
        hover && 'hover:shadow-lg hover:border-slate-300 cursor-pointer',
        className
      )}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('text-2xl font-bold text-slate-900', className)}>{children}</h3>
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('text-slate-600', className)}>{children}</div>
}

