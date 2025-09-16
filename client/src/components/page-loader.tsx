
"use client"

import * as React from "react"
import { LoadingBar } from "@/components/ui/loading-bar"
import { cn } from "@/lib/utils"

interface PageLoaderProps {
  isLoading: boolean
  progress?: number
  message?: string
  variant?: "default" | "rainbow" | "pulse" | "dots"
  fullScreen?: boolean
}

export function PageLoader({ 
  isLoading, 
  progress = 0, 
  message = "Loading...", 
  variant = "default",
  fullScreen = true 
}: PageLoaderProps) {
  const [displayProgress, setDisplayProgress] = React.useState(0)
  const [dots, setDots] = React.useState("")

  React.useEffect(() => {
    if (isLoading) {
      // Smooth progress animation
      const progressTimer = setInterval(() => {
        setDisplayProgress(prev => {
          if (prev < progress) {
            return Math.min(prev + 2, progress)
          }
          return prev
        })
      }, 50)

      // Animated dots
      const dotsTimer = setInterval(() => {
        setDots(prev => prev.length >= 3 ? "" : prev + ".")
      }, 500)

      return () => {
        clearInterval(progressTimer)
        clearInterval(dotsTimer)
      }
    } else {
      setDisplayProgress(0)
      setDots("")
    }
  }, [isLoading, progress])

  if (!isLoading) return null

  const content = (
    <div className="flex flex-col items-center justify-center space-y-6">

      {/* Loading Message */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-[#6A5ACD]">
          {message}{dots}
        </h3>
        <p className="text-sm text-gray-600">
          Securing your financial future
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-72 space-y-2">
        <LoadingBar 
          isLoading={true} 
          progress={displayProgress} 
          variant={variant}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Progress</span>
          <span>{Math.round(displayProgress)}%</span>
        </div>
      </div>

    </div>
  )

  if (fullScreen) {
    return (
      <div className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-white/95 backdrop-blur-sm"
      )}>
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  )
}
