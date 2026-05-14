import React, { useState, useEffect, useRef } from 'react';

/**
 * PHASE 24: Hero Video Background Component
 * 
 * Features:
 * - Displays hero video as background
 * - Autoplay, muted, looping
 * - Poster/thumbnail shown first (lazy loading)
 * - Fallback to image background if disabled
 * - Responsive (mobile + desktop)
 * - No CLS (Cumulative Layout Shift)
 */
const HeroVideoBackground = ({ 
  videoUrl, 
  thumbnailUrl, 
  enabled = false,
  fallbackBackground = null,
  onPlay = null,
  children 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!enabled || !videoUrl || hasError) return;

    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
    };

    const handleError = (e) => {
      console.error('Hero video loading error:', e);
      setHasError(true);
    };

    video.addEventListener('canplaythrough', handleCanPlay);
    video.addEventListener('error', handleError);

    // Attempt to play
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.log('Autoplay prevented:', err.message);
        // Try to play muted
        video.muted = true;
        video.play().catch((e) => console.log('Muted play also failed:', e));
      });
    }

    return () => {
      video.removeEventListener('canplaythrough', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [videoUrl, enabled, hasError]);

  // If video is not enabled or has error, show fallback
  if (!enabled || !videoUrl || hasError) {
    return (
      <div className="relative w-full h-full">
        {fallbackBackground}
        {children}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Video background */}
      <video
        ref={videoRef}
        poster={thumbnailUrl || undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ zIndex: 0 }}
      >
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl} type="video/webm" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay for better text readability */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-20" 
        style={{ zIndex: 1 }}
      />

      {/* Content layer */}
      <div className="relative" style={{ zIndex: 2 }}>
        {children}
      </div>

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50" style={{ zIndex: 3 }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
};

export default HeroVideoBackground;
