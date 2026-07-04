import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/providers/providers'
import { PwaRegister } from '@/components/common/PwaRegister'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Loop | Stay in the loop',
    template: '%s | Loop'
  },
  description: 'A modern, premium habit tracking application designed for consistency, reflections, and smart insights.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Loop'
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: 'website',
    siteName: 'Loop',
    title: 'Loop - Stay in the Loop',
    description: 'A modern, premium habit tracking application designed for consistency, reflections, and smart insights.',
    url: 'https://loop-habits.web.app'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loop - Stay in the Loop',
    description: 'A modern, premium habit tracking application designed for consistency, reflections, and smart insights.'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <Providers>
          <PwaRegister />
          {children}
        </Providers>
      </body>
    </html>
  )
}
