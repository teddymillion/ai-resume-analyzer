import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AuthProvider } from '@/components/auth/auth-provider'
import ErrorBoundary from '@/components/error-boundary'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Resume Analyzer',
  description: 'Analyze your resume with AI. Get ATS optimization, job matching and smart suggestions to land your dream job.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <div className="flex-1">{children}</div>
              <footer className="border-t border-white/10 bg-slate-950 text-white/60">
                <div className="mx-auto max-w-6xl px-6 py-6 text-sm">
                  © {new Date().getFullYear()} AI Resume Analyzer. All rights reserved.
                </div>
              </footer>
            </div>
          </AuthProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
