import React, { useState, useEffect, useMemo } from 'react';
import { getDesignById } from '../config/designRegistry';

/**
 * HeroOpeningDesign Component
 * 
 * Displays hero opening sequence for 2 seconds:
 * - Lord image (if allowed for event)
 * - Gantalu (temple bells) at top-left and top-right
 * - Dheepalu (oil lamps) at bottom corners
 * 
 * After 2 seconds OR on scroll, elements fade out
 */
const HeroOpeningDesign = ({ designId, lordImageUrl, eventType, onComplete }) => {
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const design = useMemo(() => getDesignById(designId), [designId]);

  useEffect(() => {
    // Auto-hide after 2 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 2000);

    // Hide on scroll
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
        setVisible(false);
        if (onComplete) onComplete();
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [onComplete]);

  if (!design || !visible) {
    return null;
  }

  const showLord = design.hero_opening.show_lord && lordImageUrl;
  const showGantalu = design.hero_opening.show_gantalu;
  const showDheepalu = design.hero_opening.show_dheepalu;

  return (
    <div
      className="hero-opening-design fixed inset-0 z-50 pointer-events-none transition-opacity duration-1000"
      style={{
        opacity: visible ? 1 : 0
      }}
    >
      {/* Lord Image - Center Top */}
      {showLord && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 animate-fade-in">
          <img
            src={lordImageUrl}
            alt="Divine Blessing"
            className="w-48 h-48 md:w-64 md:h-64 object-contain opacity-90"
            style={{
              filter: 'drop-shadow(0 4px 20px rgba(255, 215, 0, 0.4))'
            }}
          />
        </div>
      )}

      {/* Gantalu (Temple Bells) - Top Left */}
      {showGantalu && (
        <div className="absolute top-8 left-8 md:left-16 animate-fade-in">
          <GantaluSVG color={design.decorations.gantalu.color} />
        </div>
      )}

      {/* Gantalu (Temple Bells) - Top Right */}
      {showGantalu && (
        <div className="absolute top-8 right-8 md:right-16 animate-fade-in">
          <GantaluSVG color={design.decorations.gantalu.color} flip />
        </div>
      )}

      {/* Dheepalu (Oil Lamps) - Bottom Left */}
      {showDheepalu && (
        <div className="absolute bottom-8 left-8 md:left-16 animate-fade-in">
          <DheepaluSVG color={design.decorations.dheepalu.color} />
        </div>
      )}

      {/* Dheepalu (Oil Lamps) - Bottom Right */}
      {showDheepalu && (
        <div className="absolute bottom-8 right-8 md:right-16 animate-fade-in">
          <DheepaluSVG color={design.decorations.dheepalu.color} />
        </div>
      )}
    </div>
  );
};

/**
 * GantaluSVG - Temple Bell Component
 */
const GantaluSVG = ({ color = '#FFD700', flip = false }) => {
  return (
    <svg
      width="60"
      height="80"
      viewBox="0 0 60 80"
      xmlns="http://www.w3.org/2000/svg"
      className={flip ? 'transform scale-x-[-1]' : ''}
      style={{
        filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))'
      }}
    >
      {/* Rope */}
      <line
        x1="30"
        y1="0"
        x2="30"
        y2="30"
        stroke={color}
        strokeWidth="2"
        opacity="0.8"
      />
      
      {/* Bell Body */}
      <path
        d="M15,30 Q15,25 20,25 L40,25 Q45,25 45,30 L45,50 Q45,60 30,65 Q15,60 15,50 Z"
        fill={color}
        opacity="0.9"
      />
      
      {/* Bell Highlight */}
      <ellipse
        cx="25"
        cy="35"
        rx="8"
        ry="12"
        fill="white"
        opacity="0.3"
      />
      
      {/* Bell Clapper */}
      <circle
        cx="30"
        cy="60"
        r="4"
        fill={color}
        opacity="0.95"
      />
      <line
        x1="30"
        y1="52"
        x2="30"
        y2="60"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.8"
      />
    </svg>
  );
};

/**
 * DheepaluSVG - Oil Lamp Component
 */
const DheepaluSVG = ({ color = '#FFD700' }) => {
  return (
    <svg
      width="50"
      height="60"
      viewBox="0 0 50 60"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: 'drop-shadow(0 2px 8px rgba(255, 165, 0, 0.3))'
      }}
    >
      {/* Lamp Base */}
      <ellipse
        cx="25"
        cy="55"
        rx="20"
        ry="4"
        fill={color}
        opacity="0.7"
      />
      
      {/* Lamp Stand */}
      <rect
        x="22"
        y="45"
        width="6"
        height="10"
        fill={color}
        opacity="0.8"
      />
      
      {/* Lamp Bowl */}
      <path
        d="M10,45 Q10,40 15,38 L35,38 Q40,40 40,45 L38,48 Q38,50 25,50 Q12,50 12,48 Z"
        fill={color}
        opacity="0.9"
      />
      
      {/* Flame */}
      <g className="animate-pulse">
        <path
          d="M25,38 Q22,32 22,28 Q22,24 25,20 Q28,24 28,28 Q28,32 25,38 Z"
          fill="#FFA500"
          opacity="0.8"
        />
        <path
          d="M25,34 Q23,30 23,28 Q23,26 25,24 Q27,26 27,28 Q27,30 25,34 Z"
          fill="#FFD700"
          opacity="0.9"
        />
      </g>
      
      {/* Flame Glow */}
      <ellipse
        cx="25"
        cy="28"
        rx="8"
        ry="12"
        fill="#FFA500"
        opacity="0.2"
        className="animate-pulse"
      />
    </svg>
  );
};

export default HeroOpeningDesign;
