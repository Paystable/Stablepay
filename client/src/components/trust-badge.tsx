import React from 'react';

interface TrustBadgeProps {
  className?: string;
}

export function TrustBadge({ className = "" }: TrustBadgeProps) {
  return (
    <div className={`bg-gradient-to-br from-[#6A5ACD]/10 to-[#9370DB]/10 backdrop-blur-sm border border-[#6A5ACD]/20 rounded-2xl p-6 shadow-lg ${className}`}>
      <div className="text-center space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-[#6A5ACD]">
            Trusted & Verified
          </h3>
          <p className="text-sm text-gray-700">
            Partnered with industry leaders and registered with regulatory authorities
          </p>
        </div>

        {/* Partnerships Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-[#6A5ACD] uppercase tracking-wide">
            Technology Partners
          </h4>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {/* Base Logo */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 p-3">
                <img 
                  src="/logos/base-logo.png" 
                  alt="Base" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs font-medium text-gray-700">Base</span>
            </div>

            {/* Coinbase Logo */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 p-3">
                <img 
                  src="/logos/coinbase-logo.png" 
                  alt="Coinbase" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs font-medium text-gray-700">Coinbase</span>
            </div>

            {/* Circle Logo */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 p-3">
                <img 
                  src="/logos/circle-logo.png" 
                  alt="Circle" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs font-medium text-gray-700">Circle</span>
            </div>
          </div>
        </div>

        {/* Regulatory Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-[#6A5ACD] uppercase tracking-wide">
            Regulatory Compliance
          </h4>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {/* Gujarat Industries Commissionerate */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 p-3">
                <img 
                  src="/logos/gujarat-logo.png" 
                  alt="Industries Commissionerate, Government of Gujarat" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-gray-700">Industries Commissionerate</div>
                <div className="text-xs text-gray-600">Government of Gujarat</div>
              </div>
            </div>

            {/* Financial Intelligence Unit - India */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 p-3">
                <img 
                  src="/logos/fiu-india-logo.png" 
                  alt="Financial Intelligence Unit, Government of India" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-gray-700">Financial Intelligence Unit</div>
                <div className="text-xs text-gray-600">Government of India</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="pt-4 border-t border-[#6A5ACD]/20">
          <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-[#6A5ACD] rounded-full"></div>
              <span>Regulated</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-[#9370DB] rounded-full"></div>
              <span>Compliant</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-[#6A5ACD] rounded-full"></div>
              <span>Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
