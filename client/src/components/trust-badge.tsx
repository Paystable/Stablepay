import React from 'react';

interface TrustBadgeProps {
  className?: string;
}

export function TrustBadge({ className = "" }: TrustBadgeProps) {
  return (
    <div className={`bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg ${className}`}>
      <div className="text-center space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">
            Trusted & Verified
          </h3>
          <p className="text-sm text-gray-600">
            Partnered with industry leaders and registered with regulatory authorities
          </p>
        </div>

        {/* Partnerships Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Technology Partners
          </h4>
          <div className="flex flex-wrap justify-center items-center gap-6">
            {/* Base Logo */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <div className="w-4 h-0.5 bg-blue-600"></div>
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-600">Base</span>
            </div>

            {/* Coinbase Logo */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-600 rounded-sm"></div>
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-600">Coinbase</span>
            </div>

            {/* Circle Logo */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                <div className="w-12 h-12 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-green-400 via-blue-500 to-purple-500"></div>
                  <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-600">Circle</span>
            </div>
          </div>
        </div>

        {/* Regulatory Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Regulatory Compliance
          </h4>
          <div className="flex flex-wrap justify-center items-center gap-6">
            {/* Gujarat Industries Commissionerate */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-orange-600 rounded-sm flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-gray-600">Industries Commissionerate</div>
                <div className="text-xs text-gray-500">Government of Gujarat</div>
              </div>
            </div>

            {/* Financial Intelligence Unit - India */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-700 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-gray-600">Financial Intelligence Unit</div>
                <div className="text-xs text-gray-500">Government of India</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Regulated</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Compliant</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
