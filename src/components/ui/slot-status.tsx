import * as React from 'react'
import { cn } from '@/lib/utils'

export type SlotStatusType = 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'COMPLETED' | 'CANCELLED' | string

interface SlotStatusProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: SlotStatusType
}

const slotConfig: Record<string, { label: string; className: string }> = {
  available: {
    label: 'Available',
    className: 'bg-[#E5F4EC] text-[#2E7D5B] border border-[#C8E8D5]'
  },
  booked: {
    label: 'Booked',
    className: 'bg-[#FBE8E8] text-[#B64242] border border-[#F6D0D0]'
  },
  blocked: {
    label: 'Blocked',
    className: 'bg-[#FFF3D6] text-[#B7791F] border border-[#FFE6A3]'
  },
  completed: {
    label: 'Completed',
    className: 'bg-[#EAF0F7] text-[#4A668A] border border-[#D2E1F0]'
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-[#F5EFE8] text-[#75676C] border border-[#E9DED8]'
  },
}

export function SlotStatus({ status, className, ...props }: SlotStatusProps) {
  const normalized = (status || '').toLowerCase()
  const config = slotConfig[normalized] || {
    label: status,
    className: 'bg-[#F5EFE8] text-[#75676C] border border-[#E9DED8]'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold',
        config.className,
        className
      )}
      {...props}
    >
      <span>{config.label}</span>
    </span>
  )
}

export const SlotStatusBadge = SlotStatus

