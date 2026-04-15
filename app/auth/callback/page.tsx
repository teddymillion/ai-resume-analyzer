'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase puts the session tokens in the URL hash for both OAuth and
      // magic-link / recovery flows. getSession() picks them up automatically
      // once the client-side JS runs.
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        setError(sessionError.message)
        return
      }

      if (session) {
        // Check if this is a password-recovery flow
        const hash = window.location.hash
        const params = new URLSearchParams(hash.replace('#', '?'))
        const type = params.get('type')

        if (type === 'recovery') {
          // Session is live — send user to the reset form
          router.replace('/forgot-password?mode=reset')
          return
        }

        // Normal OAuth / magic-link sign-in
        router.replace('/')
        return
      }

      // No session yet — try to exchange the code/token from the hash
      const hash = window.location.hash
      if (hash.includes('access_token') || hash.includes('code')) {
        // Let Supabase parse the hash and establish the session
        const { data, error: exchangeError } = await supabase.auth.getSession()
        if (exchangeError || !data.session) {
          setError(exchangeError?.message ?? 'Authentication failed. Please try again.')
          return
        }

        const params = new URLSearchParams(hash.replace('#', '?'))
        if (params.get('type') === 'recovery') {
          router.replace('/forgot-password?mode=reset')
        } else {
          router.replace('/')
        }
        return
      }

      setError('No session received. Please try again.')
    }

    handleCallback()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-semibold text-red-400">Authentication Error</h1>
          <p className="mt-4 text-white/70">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-6 px-4 py-2 bg-cyan-500 text-slate-950 rounded-lg hover:bg-cyan-400 font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="text-center">
        <div className="h-8 w-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-white/70">Completing sign in…</p>
      </div>
    </div>
  )
}
