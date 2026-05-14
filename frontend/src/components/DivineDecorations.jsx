import React, { useEffect, useState } from 'react';
import { getDeity } from '@/config/religiousAssets';
import { 
  getDecorationConfig, 
  getLayoutConfig,
  shouldShowLord,
  shouldShowGantalu,
  shouldShowFire 
} from '@/config/divineDecorationsConfig';

/**
 * DivineDecorations Component
 * 
 * Structural layout for divine decorations based on event type
 * - No animations (static positioning only)
 * - Config-driven visibility flags
 * - Event-specific decoration rules
 * 
 * Elements:
 * 1. LORD IMAGE - top-center, medium size, fades on scroll
 * 2. GANTALU (bells) - top-left & top-right, visible first 2 seconds, fade on scroll
 * 3. DHEEPALU (fire lamps) - bottom corners, low opacity, static
 */
const DivineDecorations = ({ deityId, eventType }) => {
  const [lordImage, setLordImage] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [gantaluVisible, setGantaluVisible] = useState(true);
  
  // Get decoration config based on event type
  const decorationConfig = getDecorationConfig(eventType);
  const lordLayout = getLayoutConfig('lord');
  const gantaluLayout = getLayoutConfig('gantalu');
  const fireLayout = getLayoutConfig('fire');
  
  // Load deity image
  useEffect(() => {
    if (!decorationConfig.showLord || !deityId || deityId === 'none') {
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
  }, [deityId, decorationConfig.showLord]);
  
  // Handle scroll for lord fade effect
  useEffect(() => {
    if (!decorationConfig.showLord) return;
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > lordLayout.scrollThreshold);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [decorationConfig.showLord, lordLayout.scrollThreshold]);
  
  // Handle gantalu visibility timer (visible first 2 seconds)
  useEffect(() => {
    if (!decorationConfig.showGantalu) return;
    
    const timer = setTimeout(() => {
      setGantaluVisible(false);
    }, gantaluLayout.initialVisibleDuration);
    
    return () => clearTimeout(timer);
  }, [decorationConfig.showGantalu, gantaluLayout.initialVisibleDuration]);
  
  // Handle gantalu fade on scroll
  useEffect(() => {
    if (!decorationConfig.showGantalu || !gantaluLayout.fadeOnScroll) return;
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > gantaluLayout.scrollFadeThreshold) {
        setGantaluVisible(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [decorationConfig.showGantalu, gantaluLayout.fadeOnScroll, gantaluLayout.scrollFadeThreshold]);
  
  // Don't render if no decorations should be shown
  if (!decorationConfig.showLord && !decorationConfig.showGantalu && !decorationConfig.showFire) {
    return null;
  }
  
  return (
    <div className="divine-decorations-container">
      
      {/* LORD IMAGE - Top Center */}
      {decorationConfig.showLord && lordImage && imageLoaded && (
        <div 
          className="lord-image-container"
          style={{
            position: 'absolute',
            top: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: lordLayout.zIndex,
            opacity: scrolled ? lordLayout.scrolledOpacity : lordLayout.initialOpacity,
            transition: 'opacity 0.5s ease-in-out',
            width: '100%',
            maxWidth: '400px',
            padding: '0 16px',
            pointerEvents: 'none'
          }}
        >
          <img
            src={lordImage}
            alt="Lord"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: lordLayout.maxHeight.mobile,
              objectFit: 'contain',
              borderRadius: '8px',
              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))'
            }}
          />
        </div>
      )}
      
      {/* GANTALU (Bells) - Top Left */}
      {decorationConfig.showGantalu && gantaluVisible && (
        <div
          className="gantalu-left"
          style={{
            position: 'absolute',
            top: 0,
            left: '16px',
            zIndex: gantaluLayout.zIndex,
            opacity: gantaluVisible ? 1 : 0,
            transition: 'opacity 0.5s ease-out',
            pointerEvents: 'none'
          }}
        >
          {/* Rope */}
          <div
            style={{
              width: '2px',
              height: gantaluLayout.ropeHeight,
              background: 'linear-gradient(to bottom, #78350f, #92400e)',
              margin: '0 auto',
              opacity: 0.7
            }}
          />
          {/* Bell */}
          <div
            style={{
              width: gantaluLayout.size.mobile.width,
              height: gantaluLayout.size.mobile.height
            }}
          >
            <svg viewBox="0 0 100 120" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
              <path 
                d="M20 30 Q20 20 50 20 Q80 20 80 30 L75 80 Q75 90 50 95 Q25 90 25 80 Z" 
                fill="#fbbf24"
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
      {decorationConfig.showGantalu && gantaluVisible && (
        <div
          className="gantalu-right"
          style={{
            position: 'absolute',
            top: 0,
            right: '16px',
            zIndex: gantaluLayout.zIndex,
            opacity: gantaluVisible ? 1 : 0,
            transition: 'opacity 0.5s ease-out',
            pointerEvents: 'none'
          }}
        >
          {/* Rope */}
          <div
            style={{
              width: '2px',
              height: gantaluLayout.ropeHeight,
              background: 'linear-gradient(to bottom, #78350f, #92400e)',
              margin: '0 auto',
              opacity: 0.7
            }}
          />
          {/* Bell */}
          <div
            style={{
              width: gantaluLayout.size.mobile.width,
              height: gantaluLayout.size.mobile.height
            }}
          >
            <svg viewBox="0 0 100 120" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
              <path 
                d="M20 30 Q20 20 50 20 Q80 20 80 30 L75 80 Q75 90 50 95 Q25 90 25 80 Z" 
                fill="#fbbf24"
                stroke="#b45309"
                strokeWidth="2"
              />
              <circle cx="50" cy="100" r="8" fill="#78350f" />
              <line x1="50" y1="85" x2="50" y2="92" stroke="#78350f" strokeWidth="3" />
            </svg>
          </div>
        </div>
      )}
      
      {/* DHEEPALU (Fire Lamp) - Bottom Left */}
      {decorationConfig.showFire && (
        <div
          className="fire-lamp-left"
          style={{
            position: 'absolute',
            bottom: fireLayout.bottomOffset,
            left: fireLayout.sideOffset.mobile,
            zIndex: fireLayout.zIndex,
            opacity: fireLayout.opacity,
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              width: fireLayout.size.mobile.width,
              height: fireLayout.size.mobile.height
            }}
          >
            <svg viewBox="0 0 100 120" style={{ width: '100%', height: '100%' }}>
              {/* Lamp stand */}
              <ellipse cx="50" cy="110" rx="35" ry="8" fill="#78350f" opacity="0.8" />
              <rect x="45" y="70" width="10" height="40" fill="#92400e" />
              
              {/* Lamp bowl */}
              <ellipse cx="50" cy="70" rx="30" ry="12" fill="#b45309" />
              <path d="M20 70 Q50 75 80 70" fill="#d97706" />
              
              {/* Flame - Static */}
              <ellipse cx="50" cy="50" rx="15" ry="25" fill="#fbbf24" opacity="0.9" />
              <ellipse cx="50" cy="55" rx="10" ry="18" fill="#fef08a" opacity="0.7" />
              
              {/* Glow */}
              <circle cx="50" cy="50" r="40" fill="#fbbf24" opacity="0.2" />
            </svg>
          </div>
        </div>
      )}
      
      {/* DHEEPALU (Fire Lamp) - Bottom Right */}
      {decorationConfig.showFire && (
        <div
          className="fire-lamp-right"
          style={{
            position: 'absolute',
            bottom: fireLayout.bottomOffset,
            right: fireLayout.sideOffset.mobile,
            zIndex: fireLayout.zIndex,
            opacity: fireLayout.opacity,
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              width: fireLayout.size.mobile.width,
              height: fireLayout.size.mobile.height
            }}
          >
            <svg viewBox="0 0 100 120" style={{ width: '100%', height: '100%' }}>
              {/* Lamp stand */}
              <ellipse cx="50" cy="110" rx="35" ry="8" fill="#78350f" opacity="0.8" />
              <rect x="45" y="70" width="10" height="40" fill="#92400e" />
              
              {/* Lamp bowl */}
              <ellipse cx="50" cy="70" rx="30" ry="12" fill="#b45309" />
              <path d="M20 70 Q50 75 80 70" fill="#d97706" />
              
              {/* Flame - Static */}
              <ellipse cx="50" cy="50" rx="15" ry="25" fill="#fbbf24" opacity="0.9" />
              <ellipse cx="50" cy="55" rx="10" ry="18" fill="#fef08a" opacity="0.7" />
              
              {/* Glow */}
              <circle cx="50" cy="50" r="40" fill="#fbbf24" opacity="0.2" />
            </svg>
          </div>
        </div>
      )}
      
      {/* Responsive styling for larger screens */}
      <style jsx>{`
        @media (min-width: 768px) {
          .lord-image-container img {
            max-height: ${lordLayout.maxHeight.tablet} !important;
          }
          
          .gantalu-left,
          .gantalu-right {
            left: 32px;
          }
          
          .gantalu-right {
            right: 32px;
          }
          
          .gantalu-left > div:last-child,
          .gantalu-right > div:last-child {
            width: ${gantaluLayout.size.tablet.width};
            height: ${gantaluLayout.size.tablet.height};
          }
          
          .fire-lamp-left {
            left: ${fireLayout.sideOffset.desktop} !important;
          }
          
          .fire-lamp-right {
            right: ${fireLayout.sideOffset.desktop} !important;
          }
          
          .fire-lamp-left > div,
          .fire-lamp-right > div {
            width: ${fireLayout.size.desktop.width};
            height: ${fireLayout.size.desktop.height};
          }
        }
        
        @media (min-width: 1024px) {
          .lord-image-container img {
            max-height: ${lordLayout.maxHeight.desktop} !important;
          }
          
          .gantalu-left > div:last-child,
          .gantalu-right > div:last-child {
            width: ${gantaluLayout.size.desktop.width};
            height: ${gantaluLayout.size.desktop.height};
          }
        }
      `}</style>
    </div>
  );
};

export default DivineDecorations;
