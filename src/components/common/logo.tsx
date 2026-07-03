import React from 'react'

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  withText?: boolean
}

export function Logo({ className = 'h-8 w-auto', withText = false, ...props }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <svg
        viewBox="0 0 68 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <defs>
          <linearGradient id="infinity-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
        </defs>
        <path
          d="M16 8C9.37 8 4 13.37 4 20C4 26.63 9.37 32 16 32C22.63 32 28 26.63 34 20C40 13.37 45.37 8 52 8C58.63 8 64 13.37 64 20C64 26.63 58.63 32 52 32C45.37 32 40 26.63 34 20C28 13.37 22.63 8 16 8Z"
          stroke="url(#infinity-gradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-pulse"
        />
      </svg>
      {withText && (
        <span className="font-sans font-bold text-xl tracking-tight text-foreground">
          Loop
        </span>
      )}
    </div>
  )
}
