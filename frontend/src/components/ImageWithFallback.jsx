import React, { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * PHASE 29A: ImageWithFallback Component
 * 
 * Features:
 * - Graceful fallback to gradient if image fails
 * - No broken image icons
 * - Configurable fallback colors
 * - Maintains aspect ratio
 */

const ImageWithFallback = ({
  src,
  alt = '',
  width,
  height,
  className = '',
  fallbackGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  fallbackText = '',
  onLoad = () => {},
  onError = () => {},
  style = {},
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad();
  };

  const handleError = (e) => {
    setHasError(true);
    console.warn('ImageWithFallback: Image failed to load, showing gradient fallback', { src });
    onError(e);
  };

  // Show gradient fallback if error
  if (hasError) {
    return (
      <div
        className={cn('relative overflow-hidden', className)}
        style={{
          width: width || '100%',
          height: height || '100%',
          background: fallbackGradient,
          ...style,
        }}
      >
        {fallbackText && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-sm font-medium opacity-75">
              {fallbackText}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{
        width: width || '100%',
        height: height || '100%',
        ...style,
      }}
    >
      {/* Loading placeholder */}
      {!isLoaded && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background: fallbackGradient,
          }}
        />
      )}

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        {...props}
      />
    </div>
  );
};

export default ImageWithFallback;
