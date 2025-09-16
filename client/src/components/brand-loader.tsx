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
            
            {/* Inner logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 flex items-center justify-center">
                {/* Dollar Sign */}
                <div className="w-6 h-8 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-[#6A5ACD]">
                    <path 
                      fill="currentColor" 
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"
                    />
                  </svg>
                </div>
                
                {/* Globe Half */}
                <div className="w-6 h-8 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-[#6A5ACD]">
                    <path 
                      fill="currentColor" 
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                    />
                  </svg>
                </div>
              </div>
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

