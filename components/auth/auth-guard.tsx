'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-full mb-4">
            <div className="w-7 h-7 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-white/70">Checking your session…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
