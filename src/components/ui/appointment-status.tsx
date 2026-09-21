import * as React from 'react'
import { cn } from '@/lib/utils'

export type AppointmentStatusType = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'

interface AppointmentStatusProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: AppointmentStatusType | string
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-[#FFF3D6] text-[#B7791F] border border-[#FFE6A3]'
  },
  approved: {
    label: 'Approved',
    className: 'bg-[#E5F4EC] text-[#2E7D5B] border border-[#C8E8D5]'
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-[#FBE8E8] text-[#B64242] border border-[#F6D0D0]'
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

export function AppointmentStatus({ status, className, ...props }: AppointmentStatusProps) {
  const normalized = (status || '').toLowerCase()
  const config = statusConfig[normalized] || {
    label: status,
    className: 'bg-[#F5EFE8] text-[#75676C] border border-[#E9DED8]'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide',
        config.className,
        className
      )}
      {...props}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{config.label}</span>
    </span>
  )
}

export const AppointmentStatusBadge = AppointmentStatus

