import Link from 'next/link'
import { Logo } from '@/components/common/logo'
import { buttonVariants } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-4 bg-background text-center">
      <Logo className="h-10 w-auto mb-6" />
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
        Page Not Found
      </h1>
      <p className="mt-4 text-base text-muted-foreground max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved. Let&apos;s get you back in the loop.
      </p>
      <div className="mt-8">
        <Link href="/" className={buttonVariants({ className: 'cursor-pointer' })}>
          Return Home
        </Link>
      </div>
    </div>
  )
}
