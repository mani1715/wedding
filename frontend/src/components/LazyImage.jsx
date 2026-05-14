import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * PHASE 29A: LazyImage Component
 * 
 * Features:
 * - IntersectionObserver for lazy loading
 * - Blur placeholder before load
 * - Prevents CLS with required width/height
 * - Supports srcSet for responsive images
 * - Graceful error handling
 */

const LazyImage = ({
  src,
  alt = '',
  width,
  height,
  className = '',
  srcSet = '',
  sizes = '',
  priority = false,
  onLoad = () => {},
  onError = () => {},
  style = {},
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // If priority, load immediately
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (observerRef.current) {
              observerRef.current.disconnect();
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad();
  };

  const handleError = (e) => {
    setHasError(true);
    console.error('LazyImage failed to load:', src);
    onError(e);
  };

  // Enforce width and height to prevent CLS
  if (!width || !height) {
    console.warn('LazyImage: width and height are required to prevent CLS', { src, alt });
  }

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden', className)}
      style={{
        width: width || 'auto',
        height: height || 'auto',
        ...style,
      }}
    >
      {/* Blur placeholder (only show before load) */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{
            backdropFilter: 'blur(10px)',
          }}
        />
      )}

      {/* Actual image (load when in view) */}
      {isInView && !hasError && (
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          {...props}
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
          style={{
            background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
          }}
        >
          <div className="text-gray-400 text-sm text-center px-4">
            <svg
              className="w-12 h-12 mx-auto mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Image unavailable</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
