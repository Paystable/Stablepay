import React from 'react';

interface LoadingLogoProps {
  size?: number;
  className?: string;
}

export function LoadingLogo({ size = 64, className = "" }: LoadingLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Dollar Sign */}
      <path
        d="M32 8C32 8 28 12 28 20C28 24 30 26 32 28C34 30 36 32 36 36C36 40 34 42 32 44C30 46 28 48 28 52C28 56 32 60 32 60"
        stroke="#6A5ACD"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Dollar Sign Horizontal Lines */}
      <path
        d="M26 20L38 20"
        stroke="#6A5ACD"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M26 44L38 44"
        stroke="#6A5ACD"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Half Globe */}
      <path
        d="M32 8C40 8 48 12 48 20C48 28 44 36 40 44C36 52 32 56 32 56"
        stroke="#6A5ACD"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Globe Grid Lines - Horizontal */}
      <path
        d="M32 16C36 16 40 18 44 20"
        stroke="#6A5ACD"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M32 24C36 24 40 26 44 28"
        stroke="#6A5ACD"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M32 32C36 32 40 34 44 36"
        stroke="#6A5ACD"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M32 40C36 40 40 42 44 44"
        stroke="#6A5ACD"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      
      {/* Globe Grid Lines - Vertical */}
      <path
        d="M36 8C36 12 38 16 40 20C42 24 44 28 44 32C44 36 42 40 40 44C38 48 36 52 36 56"
        stroke="#6A5ACD"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M40 8C40 12 42 16 44 20C46 24 48 28 48 32C48 36 46 40 44 44C42 48 40 52 40 56"
        stroke="#6A5ACD"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
