
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface LoadingBarProps {
  isLoading?: boolean
  progress?: number
  variant?: "default" | "rainbow" | "pulse" | "dots"
  className?: string
}

const LoadingBar = React.forwardRef<HTMLDivElement, LoadingBarProps>(
  ({ isLoading = false, progress = 0, variant = "default", className }, ref) => {
    const [displayProgress, setDisplayProgress] = React.useState(0)
    
    React.useEffect(() => {
      if (isLoading) {
        const timer = setTimeout(() => {
          setDisplayProgress(progress)
        }, 100)
        return () => clearTimeout(timer)
      }
    }, [isLoading, progress])

    if (!isLoading) return null

    const renderVariant = () => {
      switch (variant) {
        case "rainbow":
          return (
            <div className="w-full h-1 bg-gray-200 overflow-hidden rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 transition-all duration-300 ease-out"
                style={{ 
                  width: `${displayProgress}%`,
                  backgroundSize: '200% 100%',
                  animation: 'rainbow-slide 2s linear infinite'
                }}
              />
              <style>{`
                @keyframes rainbow-slide {
                  0% { background-position: 0% 50%; }
                  100% { background-position: 200% 50%; }
                }
              `}</style>
            </div>
          )
        
        case "pulse":
          return (
            <div className="w-full h-1 bg-gray-200 overflow-hidden rounded-full">
              <div 
                className="h-full bg-[#6667AB] transition-all duration-300 ease-out animate-pulse"
                style={{ width: `${displayProgress}%` }}
              />
            </div>
          )
        
        case "dots":
          return (
            <div className="flex space-x-1 justify-center items-center">
              <div className="w-2 h-2 bg-[#6667AB] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-[#6667AB] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-[#6667AB] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )
        
        default:
          return (
            <div className="w-full h-1 bg-gray-200 overflow-hidden rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-[#6667AB] to-[#8B87E8] transition-all duration-300 ease-out relative"
                style={{ width: `${displayProgress}%` }}
              >
                <div className="absolute top-0 left-0 w-full h-full bg-white opacity-30 animate-pulse" />
              </div>
            </div>
          )
      }
    }

    return (
      <div ref={ref} className={cn("w-full", className)}>
        {renderVariant()}
      </div>
    )
  }
)

LoadingBar.displayName = "LoadingBar"

export { LoadingBar }
export type { LoadingBarProps }
