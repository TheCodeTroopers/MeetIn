import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]',
        secondary: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]',
        destructive: 'bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))] border border-[hsl(var(--destructive)/0.3)]',
        success: 'bg-[hsl(145_60%_45%/0.15)] text-[hsl(145,70%,55%)] border border-[hsl(145_60%_45%/0.3)]',
        warning: 'bg-[hsl(38_92%_55%/0.15)] text-[hsl(38,92%,60%)] border border-[hsl(38_92%_55%/0.3)]',
        outline: 'border border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
