import * as React from 'react'
import { cn } from '@/lib/utils'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'min-h-[80px] w-full rounded-lg border border-neutral/30 bg-white px-3 py-2 text-sm text-foreground shadow-inner shadow-neutral/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/60',
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
