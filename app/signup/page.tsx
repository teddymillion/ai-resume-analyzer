'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import AuthLayout from '@/components/auth/auth-layout'
import AuthInput from '@/components/auth/auth-input'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormValues = z.infer<typeof schema>

export default function SignupPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (user) { router.refresh(); router.replace('/') }
  }, [user, router])

  const onSubmit = async (values: FormValues) => {
    setFormError(null)
    setFormMessage(null)
    const { error } = await supabase.auth.signUp(values)
    if (error) { setFormError(error.message); return }
    setFormMessage('Check your email to confirm your account.')
  }

  return (
    <AuthLayout title="Create a free account to save your resume history and analysis results.">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7 shadow-2xl">
        <h2 className="text-xl font-bold text-white">Create account</h2>
        <p className="mt-1 text-sm text-white/50">Free forever · No credit card required</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-white/60">Email</Label>
            <AuthInput id="email" type="email" placeholder="you@example.com" icon={<Mail className="h-4 w-4" />} autoComplete="email" {...register('email')} />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-white/60">Password</Label>
            <AuthInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              autoComplete="new-password"
              rightSlot={
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-white/30 hover:text-white/60 transition-colors" aria-label={showPassword ? 'Hide' : 'Show'}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register('password')}
            />
            {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
          </div>

          {formError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/[0.08] p-3 text-xs text-red-300">{formError}</div>
          )}
          {formMessage && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.08] p-3 text-xs text-emerald-300">{formMessage}</div>
          )}

          <Button type="submit" className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold" disabled={isSubmitting}>
            {isSubmitting ? <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-slate-900/30 border-t-slate-900 animate-spin" />Creating account…</span> : 'Create account'}
          </Button>

          <div className="flex items-center gap-3 text-xs text-white/25">
            <div className="h-px flex-1 bg-white/[0.08]" />or<div className="h-px flex-1 bg-white/[0.08]" />
          </div>

          <Button
            type="button" variant="outline"
            className="w-full border-white/[0.08] bg-white/[0.03] text-white/70 hover:bg-white/[0.07] hover:text-white text-sm"
            onClick={async () => {
              const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback`, scopes: 'email profile' } })
              if (error) setFormError(error.message)
            }}
          >
            Continue with Google
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-white/40">
          Already have an account?{' '}
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  )
}
