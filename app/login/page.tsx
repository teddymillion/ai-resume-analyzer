'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react'
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

export default function LoginPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (user) {
      router.replace('/')
    }
  }, [user, router])

  const onSubmit = async (values: FormValues) => {
    setFormError(null)
    const { error } = await supabase.auth.signInWithPassword(values)
    if (error) {
      setFormError(error.message)
      return
    }
    router.replace('/')
  }

  return (
    <AuthLayout
      title="Log in to access personalized scorecards, ATS tips, and AI rewrites."
    >
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Welcome back</h2>
            <p className="text-sm text-white/70 mt-1">Sign in to continue.</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">Email</Label>
            <AuthInput
              id="email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="h-4 w-4" />}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-red-300">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-white/80">Password</Label>
              <Link href="#" className="text-xs text-cyan-300 hover:text-cyan-200">
                Forgot password?
              </Link>
            </div>
            <AuthInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-white/50 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-red-300">{errors.password.message}</p>
            )}
          </div>

          {formError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {formError}
            </div>
          )}

          <Button type="submit" className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-slate-900/40 border-t-slate-900 animate-spin" />
                Logging in…
              </span>
            ) : (
              'Log in'
            )}
          </Button>

          <div className="flex items-center gap-3 text-xs text-white/50">
            <div className="h-px flex-1 bg-white/10" />
            or continue
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            Continue with Google
          </Button>
        </form>

        <p className="text-sm text-white/70 mt-6 text-center">
          Don’t have an account?{' '}
          <Link href="/signup" className="text-cyan-300 hover:text-cyan-200">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
