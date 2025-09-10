"use client"

import * as React from "react"

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage?: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null)

  React.useEffect(() => {
    const measurePerformance = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart
        const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
        
        let memoryUsage
        if ('memory' in performance) {
          memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024 // MB
        }

        setMetrics({
          loadTime,
          renderTime,
          memoryUsage
        })
      }
    }

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      measurePerformance()
    } else {
      window.addEventListener('load', measurePerformance)
    }

    return () => window.removeEventListener('load', measurePerformance)
  }, [])

  // Only show in development
  if (process.env.NODE_ENV !== 'development' || !metrics) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded-lg font-mono z-50">
      <div>Load: {metrics.loadTime.toFixed(1)}ms</div>
      <div>Render: {metrics.renderTime.toFixed(1)}ms</div>
      {metrics.memoryUsage && (
        <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
      )}
    </div>
  )
}
