import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'success' | 'destructive' | 'warning' | 'info'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: "bg-black text-white",
    outline: "text-black border-2 border-black bg-white",
    success: "bg-green-400 text-black border-2 border-black",
    destructive: "bg-red-400 text-black border-2 border-black",
    warning: "bg-yellow-300 text-black border-2 border-black",
    info: "bg-blue-400 text-black border-2 border-black",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-black uppercase tracking-tighter border-2 border-black transition-colors focus:outline-none focus:ring-2 focus:ring-black",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
