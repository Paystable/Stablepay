import React from 'react';

interface BrandLoaderProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

export function BrandLoader({ 
  message = "Loading StablePay...", 
  showProgress = false, 
  progress = 0 
}: BrandLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
      <div className="text-center space-y-8">
        {/* Brand Logo/Icon */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="w-20 h-20 border-4 border-[#6A5ACD]/20 rounded-full animate-spin">
              <div className="w-full h-full border-4 border-transparent border-t-[#6A5ACD] rounded-full"></div>
            </div>
            
            {/* Inner pulsing circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-[#6A5ACD] to-[#9370DB] rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-[#6A5ACD]">
            {message}
          </h3>
          <p className="text-sm text-gray-600 max-w-xs mx-auto">
            Securing your financial future with blockchain technology
          </p>
        </div>

        {/* Progress Bar (if enabled) */}
        {showProgress && (
          <div className="w-64 mx-auto space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#6A5ACD] to-[#9370DB] rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        )}

        {/* Animated dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-[#6A5ACD] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-[#6A5ACD] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-[#6A5ACD] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

export default BrandLoader;

