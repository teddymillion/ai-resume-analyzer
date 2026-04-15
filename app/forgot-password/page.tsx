'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, CheckCircle, AlertCircle, Lock, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import AuthLayout from '@/components/auth/auth-layout'
import AuthInput from '@/components/auth/auth-input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

function ForgotPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // mode=reset is set by /auth/callback after Supabase establishes the recovery session
  const isResetMode = searchParams.get('mode') === 'reset'

  const [emailInput, setEmailInput] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [resetDone, setResetDone] = useState(false)

  // ── Step 1: request reset email ──────────────────────────────────────────
  const onRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput.trim()) {
      setFormError('Please enter your email address.')
      return
    }
    setIsSubmitting(true)
    setFormError(null)
    setFormSuccess(null)

    const { error } = await supabase.auth.resetPasswordForEmail(emailInput.trim(), {
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    setIsSubmitting(false)

    if (error) {
      setFormError(error.message)
      return
    }

    setFormSuccess('Check your email for the password reset link.')
  }

  // ── Step 2: set new password (session already live via /auth/callback) ───
  const onResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (newPassword.length < 6) {
      setFormError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    setIsSubmitting(false)

    if (error) {
      // Session may have expired — send them back to request a new link
      if (error.message.toLowerCase().includes('session') || error.status === 401) {
        setFormError('Your reset link has expired. Please request a new one.')
        router.replace('/forgot-password')
        return
      }
      setFormError(error.message)
      return
    }

    // Sign out so the user logs in fresh with the new password
    await supabase.auth.signOut()
    setResetDone(true)
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (resetDone) {
    return (
      <AuthLayout title="Password reset complete">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 mx-auto">
            <CheckCircle className="h-8 w-8 text-emerald-300" />
          </div>
          <h2 className="text-2xl font-semibold mt-6">Password Updated</h2>
          <p className="text-sm text-white/70 mt-2">
            Your password has been reset successfully. Log in with your new password.
          </p>
          <Link href="/login">
            <Button className="w-full mt-8 bg-cyan-500 text-slate-950 hover:bg-cyan-400">
              Log in with new password
            </Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Reset your password">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              {isResetMode ? 'Set New Password' : 'Forgot Password'}
            </h2>
            <p className="text-sm text-white/70 mt-1">
              {isResetMode
                ? 'Choose a strong new password.'
                : 'Enter your email and we\'ll send a reset link.'}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        {isResetMode ? (
          // ── Reset form (session is live) ────────────────────────────────
          <form onSubmit={onResetSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-white/80">New Password</Label>
              <AuthInput
                id="newPassword"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4" />}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/80">Confirm Password</Label>
              <AuthInput
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4" />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {formError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {formError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating…' : 'Update Password'}
            </Button>
          </form>
        ) : (
          // ── Request form ────────────────────────────────────────────────
          <form onSubmit={onRequestSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email</Label>
              <AuthInput
                id="email"
                type="email"
                placeholder="you@example.com"
                icon={<Mail className="h-4 w-4" />}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                autoComplete="email"
              />
            </div>

            {formError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                {formSuccess}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending…' : 'Send Reset Link'}
            </Button>
          </form>
        )}

        <p className="text-sm text-white/70 mt-6 text-center">
          Remember your password?{' '}
          <Link href="/login" className="text-cyan-300 hover:text-cyan-200">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout title="Loading…">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <div className="h-8 w-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-white/60 mt-4">Loading…</p>
          </div>
        </AuthLayout>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  )
}
