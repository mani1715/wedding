/**
 * PHASE 22 – Event Background Renderer Component
 * Renders premium background designs on public invitation page
 * Supports CSS, Image, and Hybrid background types
 */

import React, { useEffect, useState } from 'react';

const EventBackgroundRenderer = ({ 
  designId,
  backgroundType,
  colorPalette,
  className = ''
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [screenSize, setScreenSize] = useState('mobile');

  // Handle responsive sizing
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setScreenSize('desktop');
      } else if (window.innerWidth >= 768) {
        setScreenSize('tablet');
      } else {
        setScreenSize('mobile');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsLoaded(true);
  }, [designId]);

  if (!designId || !backgroundType || !colorPalette) {
    return null; // No background configured
  }

  const colors = colorPalette;

  // Base container styles
  const baseStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0, // Background layer (lord will be z-5, content z-10)
    pointerEvents: 'none',
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.5s ease-in-out'
  };

  // Render CSS-based background
  const renderCSSBackground = () => {
    const gradientMap = {
      'design_2': `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 50%, ${colors.secondary} 100%)`, // Haldi
      'design_5': `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 50%, ${colors.secondary} 100%)`, // Pink Romance
      'design_7': `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%)`, // Sunset Orange
    };

    const gradient = gradientMap[designId] || 
      `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`;

    return (
      <div
        style={{
          ...baseStyles,
          background: gradient,
          opacity: 0.15
        }}
        className={`css-background ${className}`}
      />
    );
  };

  // Render Image-based background
  const renderImageBackground = () => {
    // For image type, we use a combination of color overlay and texture
    return (
      <div style={baseStyles} className={`image-background ${className}`}>
        {/* Color base */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${colors.primary}40, ${colors.secondary}40)`,
          }}
        />
        {/* Texture overlay (simulated) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: designId === 'design_4' 
              ? 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
              : 'none',
            opacity: 0.5
          }}
        />
      </div>
    );
  };

  // Render Hybrid background (CSS gradient + pattern overlay)
  const renderHybridBackground = () => {
    const patternMap = {
      'design_1': 'temple-motif', // Royal Temple Gold
      'design_3': 'mehendi-floral', // Mehendi Green
      'design_6': 'royal-motif', // Deep Royal Blue
      'design_8': 'divine-pattern' // Emerald Elegance
    };

    const pattern = patternMap[designId] || 'temple-motif';
    const patternSize = screenSize === 'mobile' ? '30px' : screenSize === 'tablet' ? '40px' : '50px';

    return (
      <div style={baseStyles} className={`hybrid-background ${className}`}>
        {/* Gradient Layer */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}20 100%)`,
          }}
        />
        
        {/* Pattern Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: getPatternStyle(pattern, colors),
            backgroundSize: `${patternSize} ${patternSize}`,
            opacity: 0.15
          }}
        />

        {/* Accent gradient for depth */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 30% 50%, ${colors.accent}10, transparent 70%)`,
          }}
        />
      </div>
    );
  };

  // Get pattern style based on type
  const getPatternStyle = (pattern, colors) => {
    const accentColor = colors.accent || '#FFD700';
    
    switch (pattern) {
      case 'temple-motif':
        return `repeating-linear-gradient(90deg, ${accentColor}40 0px, transparent 2px, transparent 15px),
                repeating-linear-gradient(0deg, ${accentColor}40 0px, transparent 2px, transparent 15px)`;
      
      case 'mehendi-floral':
        return `radial-gradient(circle at 25% 25%, ${accentColor}30 2px, transparent 2px),
                radial-gradient(circle at 75% 75%, ${accentColor}30 2px, transparent 2px)`;
      
      case 'royal-motif':
        return `repeating-linear-gradient(45deg, ${accentColor}20 0px, transparent 2px, transparent 20px),
                repeating-linear-gradient(-45deg, ${accentColor}20 0px, transparent 2px, transparent 20px)`;
      
      case 'divine-pattern':
        return `repeating-linear-gradient(60deg, ${accentColor}25 0px, transparent 3px, transparent 12px)`;
      
      default:
        return 'none';
    }
  };

  // Render appropriate background type
  switch (backgroundType) {
    case 'css':
      return renderCSSBackground();
    case 'image':
      return renderImageBackground();
    case 'hybrid':
      return renderHybridBackground();
    default:
      return null;
  }
};

export default EventBackgroundRenderer;
