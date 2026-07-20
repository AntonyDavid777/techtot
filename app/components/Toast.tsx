'use client'

import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

const toastStyles = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: '✕',
  },
  warning: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    icon: '!',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'i',
  },
}

export function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => onRemove(toast.id)}
        />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: () => void }) {
  const [isClosing, setIsClosing] = useState(false)
  const style = toastStyles[toast.type]

  useEffect(() => {
    if (!toast.duration) return

    const timer = setTimeout(() => {
      setIsClosing(true)
      setTimeout(onRemove, 300)
    }, toast.duration)

    return () => clearTimeout(timer)
  }, [toast.duration, onRemove])

  return (
    <div
      className={`${style.bg} border ${style.border} ${style.text} px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 transform transition-all ${
        isClosing ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
    >
      <span className="font-bold mt-0.5">{style.icon}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => {
          setIsClosing(true)
          setTimeout(onRemove, 300)
        }}
        className="ml-2 hover:opacity-70"
      >
        ×
      </button>
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (message: string, type: ToastType = 'info', duration = 4000) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type, duration }])
    return id
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const success = (message: string, duration?: number) => addToast(message, 'success', duration)
  const error = (message: string, duration?: number) => addToast(message, 'error', duration)
  const warning = (message: string, duration?: number) => addToast(message, 'warning', duration)
  const info = (message: string, duration?: number) => addToast(message, 'info', duration)

  return {
    toasts,
    removeToast,
    addToast,
    success,
    error,
    warning,
    info,
  }
}
