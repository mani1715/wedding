import React, { useEffect, useState } from 'react';
import { getDeity } from '@/config/religiousAssets';

/**
 * PHASE 17: HeroOpeningSequence Component
 * 
 * Unified hero opening experience for divine wedding invitations
 * 
 * FEATURES:
 * - Lord image (center, hero position) - event-specific
 * - Gantalu (temple bells with ropes) - top-left & top-right
 * - Dheepalu (oil lamps with glow) - bottom corners
 * 
 * TIMING:
 * - All elements appear on page load
 * - Disappear after 2 seconds OR on first scroll
 * - Lord and Gantalu fade out completely
 * - Dheepalu remain visible (with subtle glow pulse)
 * 
 * EVENT RULES:
 * - Engagement: Lord YES, Gantalu YES, Dheepalu YES
 * - Haldi: All NO (trendy only)
 * - Mehendi: All NO (trendy only)
 * - Marriage: Lord YES, Gantalu YES, Dheepalu YES
 * - Reception: Lord OPTIONAL (based on deity_id), Gantalu OPTIONAL, Dheepalu OPTIONAL
 * 
 * PERFORMANCE:
 * - CSS animations only
 * - No heavy effects
 * - Respects prefers-reduced-motion
 * - Mobile-first design
 */
const HeroOpeningSequence = ({ deityId, eventType, decorativeEffects = true }) => {
  const [lordImage, setLordImage] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Determine what to show based on event type
  const getEventRules = (eventType) => {
    const eventTypeLower = eventType ? eventType.toLowerCase() : '';
    
    const rules = {
      engagement: { showLord: true, showGantalu: true, showDheepalu: true },
      haldi: { showLord: false, showGantalu: false, showDheepalu: false },
      mehendi: { showLord: false, showGantalu: false, showDheepalu: false },
      marriage: { showLord: true, showGantalu: true, showDheepalu: true },
      reception: { 
        showLord: !!(deityId && deityId !== 'none'), 
        showGantalu: !!(deityId && deityId !== 'none'),
        showDheepalu: !!(deityId && deityId !== 'none')
      }
    };
    
    return rules[eventTypeLower] || { showLord: false, showGantalu: false, showDheepalu: false };
  };
  
  const eventRules = getEventRules(eventType);
  
  // Load deity image
  useEffect(() => {
    if (!eventRules.showLord || !deityId || deityId === 'none') {
      return;
    }
    
    const deity = getDeity(deityId);
    if (!deity || !deity.images) return;
    
    const isMobile = window.innerWidth < 768;
    const img = new Image();
    img.src = isMobile ? deity.images.mobile : deity.images.desktop;
    img.onload = () => {
      setLordImage(img.src);
      setImageLoaded(true);
    };
  }, [deityId, eventRules.showLord]);
  
  // Handle 2-second timer OR first scroll
  useEffect(() => {
    let timer;
    
    const handleScroll = () => {
      if (!hasScrolled && window.scrollY > 50) {
        setHasScrolled(true);
        setIsVisible(false);
      }
    };
    
    // Set 2-second timer
    timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);
    
    // Add scroll listener for early fade
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasScrolled]);
  
  // Don't render if decorative effects are disabled
  if (!decorativeEffects) {
    return null;
  }
  
  // Don't render if no elements should be shown
  if (!eventRules.showLord && !eventRules.showGantalu && !eventRules.showDheepalu) {
    return null;
  }
  
  // Fade out duration
  const fadeOutDuration = prefersReducedMotion ? '0ms' : '800ms';
  
  return (
    <div 
      className="hero-opening-sequence fixed inset-0 pointer-events-none z-50"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: `opacity ${fadeOutDuration} ease-out`
      }}
    >
      {/* Lord Image - Center Hero Position */}
      {eventRules.showLord && lordImage && imageLoaded && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4"
          style={{
            maxWidth: '240px',
            maxHeight: '320px',
            opacity: isVisible ? 0.9 : 0,
            transition: `opacity ${fadeOutDuration} ease-out`
          }}
        >
          <img 
            src={lordImage} 
            alt="Divine Blessing"
            className="w-full h-full object-contain drop-shadow-2xl"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.3))'
            }}
          />
        </div>
      )}
      
      {/* Gantalu (Temple Bells) - Top Left */}
      {eventRules.showGantalu && (
        <div 
          className="absolute top-6 left-6 md:left-8"
          style={{
            opacity: isVisible ? 0.9 : 0,
            transition: `opacity ${fadeOutDuration} ease-out`
          }}
        >
          {/* Rope */}
          <div 
            className="w-0.5 bg-gradient-to-b from-amber-800 to-amber-600 mx-auto"
            style={{ height: '50px', opacity: 0.8 }}
          />
          {/* Bell SVG */}
          <div className="relative w-8 h-10 md:w-12 md:h-16 mx-auto">
            <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-lg">
              <path 
                d="M20 30 Q20 20 50 20 Q80 20 80 30 L75 80 Q75 90 50 95 Q25 90 25 80 Z" 
                fill="url(#bellGradientLeft)"
                stroke="#b45309"
                strokeWidth="2"
              />
              <circle cx="50" cy="100" r="8" fill="#78350f" />
              <line x1="50" y1="85" x2="50" y2="92" stroke="#78350f" strokeWidth="3" />
              <defs>
                <linearGradient id="bellGradientLeft" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      )}
      
      {/* Gantalu (Temple Bells) - Top Right */}
      {eventRules.showGantalu && (
        <div 
          className="absolute top-6 right-6 md:right-8"
          style={{
            opacity: isVisible ? 0.9 : 0,
            transition: `opacity ${fadeOutDuration} ease-out`
          }}
        >
          {/* Rope */}
          <div 
            className="w-0.5 bg-gradient-to-b from-amber-800 to-amber-600 mx-auto"
            style={{ height: '50px', opacity: 0.8 }}
          />
          {/* Bell SVG */}
          <div className="relative w-8 h-10 md:w-12 md:h-16 mx-auto">
            <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-lg">
              <path 
                d="M20 30 Q20 20 50 20 Q80 20 80 30 L75 80 Q75 90 50 95 Q25 90 25 80 Z" 
                fill="url(#bellGradientRight)"
                stroke="#b45309"
                strokeWidth="2"
              />
              <circle cx="50" cy="100" r="8" fill="#78350f" />
              <line x1="50" y1="85" x2="50" y2="92" stroke="#78350f" strokeWidth="3" />
              <defs>
                <linearGradient id="bellGradientRight" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      )}
      
      {/* Dheepalu (Oil Lamps) - Bottom Left */}
      {eventRules.showDheepalu && (
        <div 
          className="absolute bottom-10 left-6 md:left-8"
          style={{
            opacity: 0.5,
            animation: prefersReducedMotion ? 'none' : 'gentle-glow 2s ease-in-out infinite'
          }}
        >
          <div className="relative w-10 h-14 md:w-16 md:h-20">
            <svg viewBox="0 0 100 120" className="w-full h-full">
              {/* Lamp stand */}
              <rect x="35" y="80" width="30" height="35" fill="#8B4513" rx="2" />
              <rect x="25" y="75" width="50" height="8" fill="#A0522D" rx="2" />
              {/* Lamp bowl */}
              <ellipse cx="50" cy="65" rx="30" ry="12" fill="#CD853F" />
              <ellipse cx="50" cy="60" rx="28" ry="10" fill="#DEB887" />
              {/* Flame */}
              <path 
                d="M50 30 Q45 40 50 55 Q55 40 50 30 Z" 
                fill="url(#flameGradientLeft)"
                opacity="0.9"
              />
              <defs>
                <linearGradient id="flameGradientLeft" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="50%" stopColor="#FFA500" />
                  <stop offset="100%" stopColor="#FF6347" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      )}
      
      {/* Dheepalu (Oil Lamps) - Bottom Right */}
      {eventRules.showDheepalu && (
        <div 
          className="absolute bottom-10 right-6 md:right-8"
          style={{
            opacity: 0.5,
            animation: prefersReducedMotion ? 'none' : 'gentle-glow 2s ease-in-out infinite 0.5s'
          }}
        >
          <div className="relative w-10 h-14 md:w-16 md:h-20">
            <svg viewBox="0 0 100 120" className="w-full h-full">
              {/* Lamp stand */}
              <rect x="35" y="80" width="30" height="35" fill="#8B4513" rx="2" />
              <rect x="25" y="75" width="50" height="8" fill="#A0522D" rx="2" />
              {/* Lamp bowl */}
              <ellipse cx="50" cy="65" rx="30" ry="12" fill="#CD853F" />
              <ellipse cx="50" cy="60" rx="28" ry="10" fill="#DEB887" />
              {/* Flame */}
              <path 
                d="M50 30 Q45 40 50 55 Q55 40 50 30 Z" 
                fill="url(#flameGradientRight)"
                opacity="0.9"
              />
              <defs>
                <linearGradient id="flameGradientRight" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="50%" stopColor="#FFA500" />
                  <stop offset="100%" stopColor="#FF6347" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      )}
      
      {/* CSS Animations */}
      <style>{`
        @keyframes gentle-glow {
          0%, 100% {
            opacity: 0.5;
            filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.3));
          }
          50% {
            opacity: 0.7;
            filter: drop-shadow(0 0 16px rgba(255, 215, 0, 0.5));
          }
        }
      `}</style>
    </div>
  );
};

export default HeroOpeningSequence;
