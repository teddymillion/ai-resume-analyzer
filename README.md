# ai-resume-analyzer

This is a [Next.js](https://nextjs.org) project.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Password Reset Flow

1. User clicks "Forgot password?" on the login page
2. Enters their email → Supabase sends a reset email
3. User clicks the link in the email → redirected to `/auth/callback`
4. Callback establishes the recovery session → redirects to `/forgot-password?mode=reset`
5. User sets a new password → signed out → redirected to login

## Project Structure

```
app/
  api/ai/
    analyze/      # POST — Gemini resume analysis
    rewrite/      # POST — Gemini bullet rewrite
    models/       # GET  — list available Gemini models
  auth/callback/  # OAuth + password reset callback
  forgot-password/
  login/
  signup/
  resumes/        # Resume history list
  resumes/[id]/   # Resume detail view
components/
  auth/           # AuthProvider, AuthGuard, AuthLayout, AuthInput
  tabs/           # Overview, Skills, JobMatch, ATS, Suggestions
  analysis-panel, resume-analyzer, resume-upload, score-card, ...
hooks/
  use-auth, use-sign-out, use-delete-resume, use-mobile, use-toast
lib/
  analysis-engine # Local scoring fallback
  resume-parser   # Text-based section/skill extraction
  rate-limit      # In-memory rate limiter
  supabase        # Supabase client
  types           # Shared TypeScript types
supabase/
  schema.sql      # Database + RLS + storage setup
```

## Production Deployment

1. Deploy to [Vercel](https://vercel.com) — connect your repo and add all env vars
2. Update Supabase **Site URL** and **Redirect URLs** to your production domain
3. The in-memory rate limiter resets on cold starts — for production consider [Upstash Redis](https://upstash.com) as a persistent store

## Security Notes

- Never commit `.env.local` to version control (it's in `.gitignore`)
- The Supabase anon key is safe to expose client-side — RLS policies enforce data isolation
- All API routes are rate-limited per IP
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.) are set in `next.config.mjs`
