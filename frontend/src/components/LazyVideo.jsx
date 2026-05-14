import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * PHASE 29A: LazyVideo Component
 * 
 * Features:
 * - IntersectionObserver for lazy loading
 * - Shows poster image while loading
 * - Respects save-data mode (disable video if enabled)
 * - Muted by default, autoplay when in view
 * - Graceful fallback if video fails
 */

const LazyVideo = ({
  src,
  poster = '',
  width,
  height,
  className = '',
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false,
  playsInline = true,
  priority = false,
  onLoad = () => {},
  onError = () => {},
  fallbackContent = null,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(true);
  const videoRef = useRef(null);
  const observerRef = useRef(null);

  // Check save-data mode
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      if (connection && connection.saveData) {
        console.log('Save-data mode enabled, video will not load');
        setShouldLoadVideo(false);
      }
    }
  }, []);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !videoRef.current || !shouldLoadVideo) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            
            // Attempt to play video
            if (autoPlay && videoRef.current) {
              const playPromise = videoRef.current.play();
              if (playPromise !== undefined) {
                playPromise.catch((error) => {
                  console.log('Video autoplay prevented:', error.message);
                  // Fallback: ensure muted and try again
                  if (videoRef.current) {
                    videoRef.current.muted = true;
                    videoRef.current.play().catch((e) => {
                      console.log('Video play failed even when muted:', e);
                    });
                  }
                });
              }
            }

            if (observerRef.current) {
              observerRef.current.disconnect();
            }
          }
        });
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    observerRef.current.observe(videoRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority, autoPlay, shouldLoadVideo]);

  const handleLoadedData = () => {
    setIsLoaded(true);
    onLoad();
  };

  const handleError = (e) => {
    setHasError(true);
    console.error('LazyVideo failed to load:', src);
    onError(e);
  };

  // Don't load video if save-data is enabled
  if (!shouldLoadVideo) {
    return (
      <div
        className={cn('relative overflow-hidden bg-gray-900', className)}
        style={{
          width: width || '100%',
          height: height || 'auto',
        }}
      >
        {poster ? (
          <img
            src={poster}
            alt="Video poster"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          fallbackContent || (
            <div className="flex items-center justify-center w-full h-full">
              <p className="text-white text-sm">Video disabled (save-data mode)</p>
            </div>
          )
        )}
      </div>
    );
  }

  // Show fallback if video has error
  if (hasError) {
    return (
      <div
        className={cn('relative overflow-hidden bg-gray-900', className)}
        style={{
          width: width || '100%',
          height: height || 'auto',
        }}
      >
        {poster ? (
          <img
            src={poster}
            alt="Video poster"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          fallbackContent || (
            <div className="flex items-center justify-center w-full h-full">
              <div className="text-center text-white">
                <svg
                  className="w-16 h-16 mx-auto mb-2 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm">Video unavailable</p>
              </div>
            </div>
          )
        )}
      </div>
    );
  }

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{
        width: width || '100%',
        height: height || 'auto',
      }}
    >
      {/* Poster placeholder (visible before video loads) */}
      {!isLoaded && poster && (
        <img
          src={poster}
          alt="Video poster"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      )}

      {/* Video element (load when in view) */}
      {(isInView || priority) && (
        <video
          ref={videoRef}
          poster={poster}
          width={width}
          height={height}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          controls={controls}
          playsInline={playsInline}
          preload={priority ? 'auto' : 'metadata'}
          onLoadedData={handleLoadedData}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {/* Loading indicator */}
      {!isLoaded && !poster && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
};

export default LazyVideo;
