import * as React from 'react'
import { cn } from '@/lib/utils'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'min-h-[80px] w-full rounded-lg border border-neutral/40 bg-neutral/50 px-3 py-2 text-sm text-foreground placeholder:text-foreground/60 shadow-inner shadow-neutral/25 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
