import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AuthProvider } from '@/components/auth/auth-provider'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'AI Resume Analyzer - Premium SaaS',
  description: 'Analyze your resume with AI. Get ATS optimization, job matching and smart suggestions to land your dream job.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">{children}</div>
            <footer className="border-t border-white/10 bg-slate-950 text-white/60">
              <div className="mx-auto max-w-6xl px-6 py-6 text-sm">
                © 2026 T.BoB. Built by T.BoB. All rights reserved.
              </div>
            </footer>
          </div>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
