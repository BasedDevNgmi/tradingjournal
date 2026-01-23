import * as React from "react"
import { slot } from "radix-ui" // Note: if radix is not installed, we use a simple approach
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:pointer-events-none disabled:opacity-50 border-4 border-black active:translate-x-[2px] active:translate-y-[2px]",
          variant === 'default' && "bg-black text-white hover:bg-zinc-800",
          variant === 'outline' && "bg-white text-black hover:bg-zinc-100",
          variant === 'ghost' && "border-transparent hover:bg-zinc-100",
          size === 'default' && "h-12 px-6 py-2",
          size === 'sm' && "h-10 px-4 text-xs",
          size === 'lg' && "h-14 px-10 text-lg",
          size === 'icon' && "h-12 w-12",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
