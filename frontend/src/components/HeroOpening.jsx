import React, { useEffect, useState, useRef } from 'react';
import { getDeity } from '@/config/religiousAssets';

/**
 * PHASE 17: HeroOpening Component
 * 
 * Unified hero opening experience for the first 2 seconds or until first scroll
 * Coordinates lord image, gantalu (bells), and dheepalu (lamps) with perfect timing
 * 
 * Features:
 * - Shows all decorations for 2 seconds
 * - Fades out on first scroll OR after 2 seconds
 * - Event-specific rules enforced
 * - Performance optimized with CSS animations only
 * - Respects prefers-reduced-motion
 * - Gentle glow pulse for dheepalu
 */
const HeroOpening = ({ deityId, eventType, decorativeEffectsEnabled = true }) => {
  const [lordImage, setLordImage] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [visible, setVisible] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const timerRef = useRef(null);
  
  // Check for prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Get event-specific decoration rules
  const getDecorationRules = (eventType) => {
    const eventTypeLower = eventType ? eventType.toLowerCase() : '';
    
    const rules = {
      engagement: { showLord: true, showGantalu: true, showDheepalu: true },
      haldi: { showLord: false, showGantalu: false, showDheepalu: false },
      mehendi: { showLord: false, showGantalu: false, showDheepalu: false },
      marriage: { showLord: true, showGantalu: true, showDheepalu: true },
      reception: { showLord: true, showGantalu: true, showDheepalu: true } // Optional, but enabled by default
    };
    
    return rules[eventTypeLower] || { showLord: false, showGantalu: false, showDheepalu: false };
  };
  
  const decorationRules = getDecorationRules(eventType);
  
  // Don't render if decorative effects are disabled
  if (!decorativeEffectsEnabled) {
    return null;
  }
  
  // Don't render if no decorations should be shown for this event
  if (!decorationRules.showLord && !decorationRules.showGantalu && !decorationRules.showDheepalu) {
    return null;
  }
  
  // Load deity image
  useEffect(() => {
    if (!decorationRules.showLord || !deityId || deityId === 'none') {
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
  }, [deityId, decorationRules.showLord]);
  
  // Handle fade out after 2 seconds OR on first scroll
  useEffect(() => {
    // Set timer for 2 seconds
    timerRef.current = setTimeout(() => {
      setVisible(false);
    }, 2000);
    
    // Handle first scroll
    const handleScroll = () => {
      if (!hasScrolled && window.scrollY > 10) {
        setHasScrolled(true);
        setVisible(false);
        clearTimeout(timerRef.current);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasScrolled]);
  
  // If reduced motion is preferred, don't show at all
  if (prefersReducedMotion) {
    return null;
  }
  
  return (
    <div 
      className="hero-opening-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 100,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease-out',
      }}
    >
      
      {/* LORD IMAGE - Center */}
      {decorationRules.showLord && lordImage && imageLoaded && (
        <div 
          className="lord-image-hero"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 103,
            width: '100%',
            maxWidth: '400px',
            padding: '0 20px',
          }}
        >
          <img
            src={lordImage}
            alt="Divine Blessing"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '60vh',
              objectFit: 'contain',
              borderRadius: '12px',
              filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.4))',
            }}
          />
        </div>
      )}
      
      {/* GANTALU (Bells) - Top Left */}
      {decorationRules.showGantalu && (
        <div
          className="gantalu-left-hero"
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 102,
          }}
        >
          {/* Rope */}
          <div
            style={{
              width: '2px',
              height: '60px',
              background: 'linear-gradient(to bottom, #78350f, #92400e)',
              margin: '0 auto',
              opacity: 0.8,
            }}
          />
          {/* Bell */}
          <div style={{ width: '50px', height: '60px' }}>
            <svg viewBox="0 0 100 120" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
              <defs>
                <linearGradient id="bellGradientHero" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
              <path 
                d="M20 30 Q20 20 50 20 Q80 20 80 30 L75 80 Q75 90 50 95 Q25 90 25 80 Z" 
                fill="url(#bellGradientHero)"
                stroke="#b45309"
                strokeWidth="2"
              />
              <circle cx="50" cy="100" r="8" fill="#78350f" />
              <line x1="50" y1="85" x2="50" y2="92" stroke="#78350f" strokeWidth="3" />
            </svg>
          </div>
        </div>
      )}
      
      {/* GANTALU (Bells) - Top Right */}
      {decorationRules.showGantalu && (
        <div
          className="gantalu-right-hero"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 102,
          }}
        >
          {/* Rope */}
          <div
            style={{
              width: '2px',
              height: '60px',
              background: 'linear-gradient(to bottom, #78350f, #92400e)',
              margin: '0 auto',
              opacity: 0.8,
            }}
          />
          {/* Bell */}
          <div style={{ width: '50px', height: '60px' }}>
            <svg viewBox="0 0 100 120" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
              <path 
                d="M20 30 Q20 20 50 20 Q80 20 80 30 L75 80 Q75 90 50 95 Q25 90 25 80 Z" 
                fill="url(#bellGradientHero)"
                stroke="#b45309"
                strokeWidth="2"
              />
              <circle cx="50" cy="100" r="8" fill="#78350f" />
              <line x1="50" y1="85" x2="50" y2="92" stroke="#78350f" strokeWidth="3" />
            </svg>
          </div>
        </div>
      )}
      
      {/* DHEEPALU (Fire Lamp) - Bottom Left with Gentle Glow Pulse */}
      {decorationRules.showDheepalu && (
        <div
          className="dheepalu-left-hero"
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '20px',
            zIndex: 101,
          }}
        >
          <div style={{ width: '60px', height: '80px' }}>
            <svg viewBox="0 0 100 120" style={{ width: '100%', height: '100%' }}>
              {/* Lamp stand */}
              <ellipse cx="50" cy="110" rx="35" ry="8" fill="#78350f" opacity="0.8" />
              <rect x="45" y="70" width="10" height="40" fill="#92400e" />
              
              {/* Lamp bowl */}
              <ellipse cx="50" cy="70" rx="30" ry="12" fill="#b45309" />
              <path d="M20 70 Q50 75 80 70" fill="#d97706" />
              
              {/* Flame with gentle pulse */}
              <g className="flame-pulse">
                <ellipse cx="50" cy="50" rx="15" ry="25" fill="#fbbf24" opacity="0.9" />
                <ellipse cx="50" cy="55" rx="10" ry="18" fill="#fef08a" opacity="0.7" />
              </g>
              
              {/* Glow with gentle pulse */}
              <circle cx="50" cy="50" r="40" fill="#fbbf24" opacity="0.25" className="glow-pulse" />
            </svg>
          </div>
        </div>
      )}
      
      {/* DHEEPALU (Fire Lamp) - Bottom Right with Gentle Glow Pulse */}
      {decorationRules.showDheepalu && (
        <div
          className="dheepalu-right-hero"
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '20px',
            zIndex: 101,
          }}
        >
          <div style={{ width: '60px', height: '80px' }}>
            <svg viewBox="0 0 100 120" style={{ width: '100%', height: '100%' }}>
              {/* Lamp stand */}
              <ellipse cx="50" cy="110" rx="35" ry="8" fill="#78350f" opacity="0.8" />
              <rect x="45" y="70" width="10" height="40" fill="#92400e" />
              
              {/* Lamp bowl */}
              <ellipse cx="50" cy="70" rx="30" ry="12" fill="#b45309" />
              <path d="M20 70 Q50 75 80 70" fill="#d97706" />
              
              {/* Flame with gentle pulse */}
              <g className="flame-pulse-alt">
                <ellipse cx="50" cy="50" rx="15" ry="25" fill="#fbbf24" opacity="0.9" />
                <ellipse cx="50" cy="55" rx="10" ry="18" fill="#fef08a" opacity="0.7" />
              </g>
              
              {/* Glow with gentle pulse */}
              <circle cx="50" cy="50" r="40" fill="#fbbf24" opacity="0.25" className="glow-pulse-alt" />
            </svg>
          </div>
        </div>
      )}
      
      {/* CSS Animations - Gentle and Subtle */}
      <style jsx>{`
        /* Gentle glow pulse for flame */
        @keyframes gentle-glow-pulse {
          0%, 100% {
            opacity: 0.25;
          }
          50% {
            opacity: 0.35;
          }
        }
        
        @keyframes gentle-flame-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
        }
        
        .glow-pulse {
          animation: gentle-glow-pulse 3s ease-in-out infinite;
        }
        
        .glow-pulse-alt {
          animation: gentle-glow-pulse 3.5s ease-in-out infinite;
        }
        
        .flame-pulse {
          animation: gentle-flame-pulse 2s ease-in-out infinite;
        }
        
        .flame-pulse-alt {
          animation: gentle-flame-pulse 2.5s ease-in-out infinite;
        }
        
        /* Responsive sizing */
        @media (min-width: 768px) {
          .gantalu-left-hero > div:last-child,
          .gantalu-right-hero > div:last-child {
            width: 70px;
            height: 84px;
          }
          
          .dheepalu-left-hero > div,
          .dheepalu-right-hero > div {
            width: 80px;
            height: 100px;
          }
        }
        
        @media (min-width: 1024px) {
          .lord-image-hero {
            max-width: 500px !important;
          }
          
          .gantalu-left-hero,
          .gantalu-right-hero {
            top: 40px;
          }
          
          .gantalu-left-hero {
            left: 40px;
          }
          
          .gantalu-right-hero {
            right: 40px;
          }
          
          .dheepalu-left-hero {
            left: 40px;
            bottom: 60px;
          }
          
          .dheepalu-right-hero {
            right: 40px;
            bottom: 60px;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroOpening;
