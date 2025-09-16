import React, { useState } from 'react';
import InteractiveLoader from './InteractiveLoader';

const LoaderDemo: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');

  const startLoading = (text: string) => {
    setLoadingText(text);
    setIsLoading(true);
    
    // Simulate loading for 3 seconds
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          StablePay Interactive Loader Demo
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Small Loader */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Small Loader</h3>
            <InteractiveLoader size={60} text="Processing..." />
          </div>
          
          {/* Medium Loader */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Medium Loader</h3>
            <InteractiveLoader size={80} text="Connecting..." />
          </div>
          
          {/* Large Loader */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Large Loader</h3>
            <InteractiveLoader size={120} text="Initializing..." />
          </div>
        </div>
        
        {/* Interactive Demo */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-2xl font-semibold mb-6">Interactive Demo</h3>
          
          <div className="space-y-4 mb-8">
            <button
              onClick={() => startLoading('Connecting to wallet...')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg mr-4 transition-colors"
            >
              Connect Wallet
            </button>
            
            <button
              onClick={() => startLoading('Processing transaction...')}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg mr-4 transition-colors"
            >
              Process Transaction
            </button>
            
            <button
              onClick={() => startLoading('Loading dashboard...')}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Load Dashboard
            </button>
          </div>
          
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8">
                <InteractiveLoader size={100} text={loadingText} />
              </div>
            </div>
          )}
        </div>
        
        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Features</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Rotating globe animation</li>
              <li>• Pulsing effect</li>
              <li>• Customizable size</li>
              <li>• Custom loading text</li>
              <li>• Smooth animations</li>
              <li>• Responsive design</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Usage</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`<InteractiveLoader 
  size={80} 
  text="Loading..." 
  className="my-custom-class"
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoaderDemo;
