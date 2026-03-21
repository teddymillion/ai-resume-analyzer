'use client'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface AuthInputProps extends React.ComponentProps<'input'> {
  icon?: React.ReactNode
  rightSlot?: React.ReactNode
}

export default function AuthInput({ icon, rightSlot, className, ...props }: AuthInputProps) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
          {icon}
        </span>
      )}
      <Input
        className={cn(
          'h-11 bg-white/8 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-cyan-500/40 focus-visible:border-cyan-400 pl-10 pr-10',
          className,
        )}
        {...props}
      />
      {rightSlot && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightSlot}
        </span>
      )}
    </div>
  )
}
