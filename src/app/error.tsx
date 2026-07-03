'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/common/logo'
import { Button, buttonVariants } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled runtime error:', error)
  }, [error])

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-4 bg-background text-center">
      <Logo className="h-10 w-auto mb-6 text-destructive" />
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
        Something went wrong
      </h1>
      <p className="mt-4 text-base text-muted-foreground max-w-md">
        An unexpected application error occurred. Let&apos;s try reloading or returning home.
      </p>
      <div className="mt-8 flex gap-4">
        <Button onClick={() => reset()} className="cursor-pointer">
          Try Again
        </Button>
        <Link href="/" className={buttonVariants({ variant: 'outline', className: 'cursor-pointer' })}>
          Go Home
        </Link>
      </div>
    </div>
  )
}
