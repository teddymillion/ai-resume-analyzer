'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from './use-auth'

/** Returns a stable sign-out handler that signs the user out and redirects to /login. */
export function useSignOut() {
  const router = useRouter()
  const { signOut } = useAuth()

  return async () => {
    await signOut()
    router.replace('/login')
  }
}
