
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
      {/* Logo Animation */}
      <div className="relative">
        <div className="w-16 h-16 bg-[#6667AB] rounded-2xl flex items-center justify-center animate-pulse shadow-lg">
          <span className="text-white font-bold text-xl">SP</span>
        </div>
        <div className="absolute -inset-2 bg-gradient-to-r from-[#6667AB] to-[#8B87E8] rounded-2xl opacity-20 animate-ping" />
      </div>

      {/* Loading Message */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-[#6667AB]">
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

      {/* Feature Highlights */}
      <div className="grid grid-cols-3 gap-4 text-center max-w-md">
        <div className="space-y-1">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-green-600 text-sm">✓</span>
          </div>
          <p className="text-xs text-gray-600">Secure</p>
        </div>
        <div className="space-y-1">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-blue-600 text-sm">⚡</span>
          </div>
          <p className="text-xs text-gray-600">Fast</p>
        </div>
        <div className="space-y-1">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-purple-600 text-sm">💰</span>
          </div>
          <p className="text-xs text-gray-600">Profitable</p>
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
