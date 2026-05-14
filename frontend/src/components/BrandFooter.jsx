import React from 'react';

/**
 * PHASE 28: BrandFooter Component
 * 
 * Subtle branding footer for public invitation pages.
 * Shows "Created with ❤️ on [Platform Name]" without being intrusive.
 * 
 * This is organic growth virality - no ads, no popups, no forced branding.
 * Just a gentle attribution that makes guests curious about the platform.
 * 
 * Props:
 * - platformName: Name of the platform (default: "WeddingPulse")
 * - className: Additional CSS classes
 */
const BrandFooter = ({ 
  platformName = "WeddingPulse", 
  className = "" 
}) => {
  return (
    <footer className={`w-full py-6 mt-12 ${className}`}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Subtle divider */}
        <div className="border-t border-gray-200 mb-4"></div>
        
        {/* Brand attribution */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-gray-500 text-center">
            Created with{' '}
            <span className="text-red-500 animate-pulse inline-block" style={{ animationDuration: '1.5s' }}>
              ❤️
            </span>
            {' '}on{' '}
            <span className="font-semibold text-gray-700 hover:text-pink-600 transition-colors">
              {platformName}
            </span>
          </p>
          
          {/* Optional tagline */}
          <p className="text-xs text-gray-400 text-center">
            Make your wedding invitation unforgettable
          </p>
        </div>

        {/* Optional social proof */}
        <div className="mt-4 flex justify-center items-center gap-1 text-xs text-gray-400">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Trusted by thousands of couples</span>
        </div>
      </div>
    </footer>
  );
};

export default BrandFooter;
