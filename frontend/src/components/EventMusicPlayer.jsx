import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

/**
 * PHASE 20: Event-Wise Background Music Player
 * PHASE 29D: Enhanced accessibility with better ARIA labels and keyboard support
 * 
 * Features:
 * - Auto-play after page load (respecting browser rules)
 * - Fixed position speaker icon (bottom-right)
 * - Mute/unmute functionality
 * - State persistence while scrolling
 * - Lazy loading of audio file
 * - Cleanup on page leave
 * - Fully keyboard accessible with clear ARIA labels
 */
const EventMusicPlayer = ({ musicUrl, enabled }) => {
  const [isMuted, setIsMuted] = useState(true); // Start muted to respect browser policies
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!enabled || !musicUrl) return;

    // Create audio element
    const audio = new Audio();
    audio.src = musicUrl;
    audio.loop = true;
    audio.preload = 'auto';
    
    // Set initial volume
    audio.volume = 0.5;
    audio.muted = true; // Start muted
    
    audioRef.current = audio;

    // Handle audio loading
    const handleCanPlay = () => {
      setIsLoaded(true);
      // Try to auto-play (will only work if user has interacted with page)
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Auto-play successful
            console.log('Music auto-play started');
          })
          .catch((err) => {
            // Auto-play was prevented (browser policy)
            console.log('Auto-play prevented:', err.message);
          });
      }
    };

    const handleError = (e) => {
      console.error('Music loading error:', e);
      setError(true);
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('error', handleError);

    // Cleanup on unmount
    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, [musicUrl, enabled]);

  // Handle mute/unmute toggle
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    const newMutedState = !isMuted;
    audioRef.current.muted = newMutedState;
    setIsMuted(newMutedState);

    // If unmuting, ensure audio is playing
    if (!newMutedState && audioRef.current.paused) {
      audioRef.current.play().catch((err) => {
        console.log('Play failed:', err.message);
      });
    }
  };

  // Don't render if music is not enabled or there's an error
  if (!enabled || !musicUrl || error) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50" role="region" aria-label="Background music player">
      <button
        onClick={toggleMute}
        className="group flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 focus-visible:from-amber-600 focus-visible:to-orange-700 text-white rounded-full shadow-lg hover:shadow-xl focus-visible:shadow-xl transform hover:scale-110 focus-visible:scale-110 transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
        aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
        aria-pressed={!isMuted}
        title={isMuted ? 'Click to play background music' : 'Click to mute background music'}
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6" aria-hidden="true" />
        ) : (
          <div className="relative">
            <Volume2 className="w-6 h-6" aria-hidden="true" />
            {/* Animated sound waves */}
            <div className="absolute -right-1 top-1/2 transform -translate-y-1/2" aria-hidden="true">
              <div className="flex gap-0.5">
                <div className="w-0.5 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                <div className="w-0.5 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                <div className="w-0.5 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </button>
      
      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping" aria-label="Music loading"></div>
      )}
    </div>
  );
};

export default EventMusicPlayer;
