"use client"

import * as React from "react"

interface LoadingState {
  isLoading: boolean
  progress: number
  message: string
}

interface LoadingActions {
  startLoading: (message?: string) => void
  updateProgress: (progress: number, message?: string) => void
  finishLoading: () => void
  setMessage: (message: string) => void
}

export function useLoading(initialLoading = false): LoadingState & LoadingActions {
  const [state, setState] = React.useState<LoadingState>({
    isLoading: initialLoading,
    progress: 0,
    message: "Loading..."
  })

  const startLoading = React.useCallback((message = "Loading...") => {
    setState({
      isLoading: true,
      progress: 0,
      message
    })
  }, [])

  const updateProgress = React.useCallback((progress: number, message?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
      message: message || prev.message
    }))
  }, [])

  const finishLoading = React.useCallback(() => {
    setState(prev => ({
      ...prev,
      progress: 100
    }))
    
    // Small delay to show completion before hiding
    setTimeout(() => {
      setState({
        isLoading: false,
        progress: 0,
        message: "Loading..."
      })
    }, 500)
  }, [])

  const setMessage = React.useCallback((message: string) => {
    setState(prev => ({
      ...prev,
      message
    }))
  }, [])

  return {
    ...state,
    startLoading,
    updateProgress,
    finishLoading,
    setMessage
  }
}
