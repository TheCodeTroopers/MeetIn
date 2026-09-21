import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#701a28]/20 focus-visible:border-[#701a28] disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-[#701a28] text-white hover:bg-[#520114] shadow-xs active:scale-[0.98]',
        destructive:
          'bg-rose-700 text-white hover:bg-rose-800 shadow-xs active:scale-[0.98]',
        outline:
          'border border-[#701a28] bg-transparent hover:bg-[#701a28]/10 text-[#701a28] shadow-xs active:scale-[0.98]',
        secondary:
          'bg-[#e5a93c] text-[#520114] hover:bg-[#d4982b] font-bold shadow-xs active:scale-[0.98]',
        ghost:
          'hover:bg-[#701a28]/10 text-[#1b1c1a] hover:text-[#701a28]',
        link:
          'text-[#701a28] underline-offset-4 hover:underline p-0 h-auto font-semibold',
        success:
          'bg-emerald-700 text-white hover:bg-emerald-800 shadow-xs active:scale-[0.98]',
      },
      size: {
        default: 'h-9 px-4 py-2 text-sm',
        sm: 'h-8 px-3 text-xs rounded-sm',
        lg: 'h-11 px-6 text-base rounded-md',
        icon: 'h-9 w-9 p-0',
        'icon-sm': 'h-7 w-7 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
