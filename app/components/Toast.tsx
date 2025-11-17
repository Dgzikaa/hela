'use client'

import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

export interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
  onClose: (id: string) => void
}

export function Toast({ id, type, message, duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  }

  const colors = {
    success: 'bg-green-500/90 text-white',
    error: 'bg-red-500/90 text-white',
    warning: 'bg-yellow-500/90 text-white',
    info: 'bg-blue-500/90 text-white'
  }

  const progressColors = {
    success: 'bg-green-300',
    error: 'bg-red-300',
    warning: 'bg-yellow-300',
    info: 'bg-blue-300'
  }

  return (
    <div
      className={`${colors[type]} rounded-lg shadow-lg p-4 min-w-[300px] max-w-md backdrop-blur-sm animate-slideIn`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
        <div 
          className={`h-full ${progressColors[type]} animate-progress`}
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  )
}

interface ToastData {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export function ToastContainer({ toasts, onClose }: { 
  toasts: ToastData[]
  onClose: (id: string) => void 
}) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  )
}

