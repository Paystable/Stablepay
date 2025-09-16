import React, { useState, useEffect } from 'react';

interface InteractiveLoaderProps {
  size?: number;
  className?: string;
  text?: string;
}

const InteractiveLoader: React.FC<InteractiveLoaderProps> = ({ 
  size = 80, 
  className = '',
  text = 'Loading...'
}) => {
  const [rotation, setRotation] = useState(0);
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 2) % 360);
    }, 50);

    const pulseInterval = setInterval(() => {
      setPulse(prev => prev === 1 ? 1.1 : 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(pulseInterval);
    };
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className="relative"
        style={{ 
          width: size, 
          height: size,
          transform: `scale(${pulse})`,
          transition: 'transform 0.5s ease-in-out'
        }}
      >
        {/* Background circle */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{ 
            backgroundColor: '#6667AB',
            width: '100%',
            height: '100%'
          }}
        />
        
        {/* Dollar sign */}
        <div 
          className="absolute flex items-center justify-center text-white font-bold"
          style={{
            left: '25%',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: `${size * 0.25}px`,
            zIndex: 2
          }}
        >
          $
        </div>
        
        {/* Rotating globe */}
        <div 
          className="absolute"
          style={{
            right: '25%',
            top: '50%',
            transform: `translateY(-50%) rotate(${rotation}deg)`,
            zIndex: 2
          }}
        >
          <svg 
            width={size * 0.4} 
            height={size * 0.4} 
            viewBox="0 0 24 24" 
            fill="none"
          >
            {/* Globe outline */}
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              fill="none" 
              stroke="white" 
              strokeWidth="2"
            />
            {/* Horizontal lines */}
            <line x1="4" y1="8" x2="20" y2="8" stroke="white" strokeWidth="1.5"/>
            <line x1="4" y1="12" x2="20" y2="12" stroke="white" strokeWidth="1.5"/>
            <line x1="4" y1="16" x2="20" y2="16" stroke="white" strokeWidth="1.5"/>
            {/* Vertical line */}
            <line x1="12" y1="4" x2="12" y2="20" stroke="white" strokeWidth="1.5"/>
          </svg>
        </div>
        
        {/* Pulsing ring */}
        <div 
          className="absolute inset-0 rounded-full border-2 border-white opacity-30"
          style={{
            animation: 'pulse 2s ease-in-out infinite',
            transform: 'scale(1.2)'
          }}
        />
      </div>
      
      {text && (
        <p 
          className="mt-4 text-gray-600 font-medium animate-pulse"
          style={{ fontSize: `${size * 0.15}px` }}
        >
          {text}
        </p>
      )}
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1.2);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.3);
          }
        }
      `}</style>
    </div>
  );
};

export default InteractiveLoader;
