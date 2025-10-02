"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type ToastItem = {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'error' | 'success' | 'warning'
}

interface ToastContextType {
  toasts: ToastItem[]
  showToast: (toast: Omit<ToastItem, 'id'>) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setToasts(prev => [{ id, ...toast }, ...prev].slice(0, 6)) // cap stack size
    // auto-dismiss after 5s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const value = useMemo(() => ({ toasts, showToast, dismissToast }), [toasts, showToast, dismissToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast()
  return (
    <div className="fixed right-4 top-4 z-[9999] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map(({ id, title, description, variant }) => (
          <motion.div
            key={id}
            role="status"
            layout
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.6 }}
            className={[
              'rounded-md border p-3 shadow-lg backdrop-blur-sm',
              'bg-white text-gray-900 dark:bg-neutral-900 dark:text-white',
              variant === 'error' ? 'border-red-700 bg-red-900 text-white dark:bg-red-900 dark:text-white' : '',
              variant === 'success' ? 'border-green-700 bg-green-600 text-white dark:bg-green-600 dark:text-white' : '',
              variant === 'warning' ? 'border-yellow-300 bg-yellow-50 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-50' : '',
              (!variant || variant === 'default') ? 'border-gray-200' : '',
            ].join(' ')}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="text-sm font-medium">{title}</div>
                {description ? (
                  <div className="mt-1 text-xs opacity-80">{description}</div>
                ) : null}
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                className="ml-2 text-xs opacity-60 hover:opacity-100"
                onClick={() => dismissToast(id)}
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}


