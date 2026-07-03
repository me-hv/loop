'use client'

import React from 'react'
import Link from 'next/link'
import { Logo } from '@/components/common/logo'
import { buttonVariants } from '@/components/ui/button'
import { ThemeToggle } from '@/components/common/theme-toggle'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/85 backdrop-blur-md">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-7 w-auto text-indigo-500" withText />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#why-loop" className="hover:text-foreground transition-colors">Why Loop</a>
            <a href="#preview" className="hover:text-foreground transition-colors">Preview</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className={buttonVariants({
                variant: 'ghost',
                className: 'hidden sm:inline-flex cursor-pointer',
              })}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className={buttonVariants({
                className: 'bg-accent hover:bg-accent/90 text-white cursor-pointer',
              })}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Logo className="h-7 w-auto text-indigo-500" withText />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Stay in the loop. Build habits that drive consistent results and personal growth.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Product</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#why-loop" className="hover:text-foreground transition-colors">Why Loop</a></li>
                <li><a href="#preview" className="hover:text-foreground transition-colors">Preview</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Company</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Connect</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Twitter / X</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Loop Inc. All rights reserved.
            </p>
            <div className="text-xs text-muted-foreground flex gap-4">
              <a href="#" className="hover:underline">Terms</a>
              <a href="#" className="hover:underline">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
