'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.replace(redirectTo)
    }
  }, [loading, user, router, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/5 rounded-full mb-4 ring-1 ring-white/10">
            <div className="w-6 h-6 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
          </div>
          <p className="text-sm text-white/40">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
