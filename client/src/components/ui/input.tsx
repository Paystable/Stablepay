
import * as React from "react"

import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  loading?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, loading, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mobile-input",
            loading && "pr-10",
            className
          )}
          ref={ref}
          style={{
            fontSize: '16px', // Prevents zoom on iOS
            touchAction: 'manipulation'
          }}
          {...props}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
