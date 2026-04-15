'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './use-auth'

/** Returns a stable sign-out handler that signs the user out and redirects to /login. */
export function useSignOut() {
  const router = useRouter()
  const { signOut } = useAuth()

  return useCallback(async () => {
    try {
      await signOut()
    } catch {
      // Sign-out errors are non-critical — still redirect
    }
    router.replace('/login')
  }, [signOut, router])
}
