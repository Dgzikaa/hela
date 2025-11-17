import { ReactNode, CSSProperties } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
  style?: CSSProperties
}

export function Card({ children, className, hover = false, gradient = false, style }: CardProps) {
  return (
    <div
      className={cn(
        'backdrop-blur-md rounded-xl p-6 transition-all duration-300',
        gradient 
          ? 'bg-gradient-to-br from-white/20 to-white/10 border border-white/20' 
          : 'bg-white/10 border border-white/10',
        hover && 'hover:bg-white/20 hover:scale-[1.02] hover:shadow-2xl cursor-pointer',
        className
      )}
      style={style}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('text-2xl font-bold text-white', className)}>{children}</h3>
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('text-purple-100', className)}>{children}</div>
}

