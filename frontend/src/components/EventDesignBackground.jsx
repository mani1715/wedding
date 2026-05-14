/**
 * PHASE 15 – Event Design Background Component
 * Renders the selected design with color variant
 * Responsive and lord-image compatible
 */

import React, { useEffect, useState } from 'react';
import {
  getDesignById,
  getColorPalette,
  getResponsiveSettings,
  generateGradient,
  generatePatternOverlay,
  DESIGN_TYPES,
} from '../config/eventDesignSystem';

const EventDesignBackground = ({ designType, colorVariant, className = '' }) => {
  const [screenSize, setScreenSize] = useState('mobile');

  // Get design configuration
  const design = getDesignById(designType || DESIGN_TYPES.ROYAL_TEMPLE);
  const colors = getColorPalette(colorVariant || design.defaultColor);
  const responsiveSettings = getResponsiveSettings(designType, screenSize);

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

  // Generate gradient background
  const gradientBg = generateGradient(colors, 'to bottom');

  // Generate pattern overlay
  const patternOverlay = generatePatternOverlay(design.pattern, colors, 0.15);

  // Base styles
  const baseStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    pointerEvents: 'none',
  };

  // Layer styles
  const gradientLayerStyle = {
    ...baseStyles,
    background: gradientBg,
    opacity: 0.3,
  };

  const patternLayerStyle = {
    ...baseStyles,
    background: patternOverlay,
    backgroundSize: `${100 * responsiveSettings.patternScale}px ${100 * responsiveSettings.patternScale}px`,
    opacity: 0.2,
  };

  // Decorative borders based on design type
  const renderDecorativeBorders = () => {
    if (design.features.hasOrnateTop) {
      return (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '120px',
            background: `linear-gradient(to bottom, ${colors.accent}40, transparent)`,
            borderBottom: `3px solid ${colors.accent}30`,
          }}
        />
      );
    }

    if (design.features.hasRichBorder) {
      return (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '8px',
              background: `linear-gradient(to right, ${colors.primary}, ${colors.accent}, ${colors.primary})`,
              opacity: 0.4,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '8px',
              background: `linear-gradient(to right, ${colors.primary}, ${colors.accent}, ${colors.primary})`,
              opacity: 0.4,
            }}
          />
        </>
      );
    }

    if (design.features.hasMinimalBorder) {
      return (
        <>
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              right: '20px',
              bottom: '20px',
              border: `1px solid ${colors.accent}30`,
              borderRadius: '8px',
              pointerEvents: 'none',
            }}
          />
        </>
      );
    }

    return null;
  };

  // Render corner decorations
  const renderCornerDecorations = () => {
    if (!design.features.hasCornerDesign) return null;

    const cornerStyle = {
      position: 'absolute',
      width: screenSize === 'mobile' ? '60px' : '100px',
      height: screenSize === 'mobile' ? '60px' : '100px',
      opacity: 0.3,
    };

    return (
      <>
        {/* Top-left corner */}
        <div
          style={{
            ...cornerStyle,
            top: 0,
            left: 0,
            background: `radial-gradient(circle at top left, ${colors.primary}, transparent)`,
          }}
        />
        {/* Top-right corner */}
        <div
          style={{
            ...cornerStyle,
            top: 0,
            right: 0,
            background: `radial-gradient(circle at top right, ${colors.primary}, transparent)`,
          }}
        />
        {/* Bottom-left corner */}
        <div
          style={{
            ...cornerStyle,
            bottom: 0,
            left: 0,
            background: `radial-gradient(circle at bottom left, ${colors.accent}, transparent)`,
          }}
        />
        {/* Bottom-right corner */}
        <div
          style={{
            ...cornerStyle,
            bottom: 0,
            right: 0,
            background: `radial-gradient(circle at bottom right, ${colors.accent}, transparent)`,
          }}
        />
      </>
    );
  };

  // Render center clear area (for lord image)
  const renderCenterClearArea = () => {
    if (!design.features.centerClear) return null;

    return (
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: screenSize === 'mobile' ? '280px' : screenSize === 'tablet' ? '350px' : '450px',
          height: screenSize === 'mobile' ? '350px' : screenSize === 'tablet' ? '420px' : '520px',
          background: `radial-gradient(circle at center, ${colors.light}10, transparent 70%)`,
          borderRadius: '50%',
          opacity: 0.5,
        }}
      />
    );
  };

  // Render floral accents (for floral designs)
  const renderFloralAccents = () => {
    if (!design.features.hasFloralBorder) return null;

    const floralPositions = [
      { top: '10%', left: '5%' },
      { top: '10%', right: '5%' },
      { top: '40%', left: '3%' },
      { top: '40%', right: '3%' },
      { bottom: '15%', left: '8%' },
      { bottom: '15%', right: '8%' },
    ];

    return floralPositions.map((pos, idx) => (
      <div
        key={idx}
        style={{
          position: 'absolute',
          ...pos,
          width: screenSize === 'mobile' ? '40px' : '60px',
          height: screenSize === 'mobile' ? '40px' : '60px',
          background: `radial-gradient(circle, ${colors.primary}40, transparent)`,
          borderRadius: '50%',
          opacity: 0.5,
        }}
      />
    ));
  };

  return (
    <div className={`event-design-background ${className}`} style={baseStyles}>
      {/* Gradient Layer */}
      <div style={gradientLayerStyle} />

      {/* Pattern Layer */}
      <div style={patternLayerStyle} />

      {/* Decorative Elements Container */}
      <div style={baseStyles}>
        {renderDecorativeBorders()}
        {renderCornerDecorations()}
        {renderCenterClearArea()}
        {renderFloralAccents()}
      </div>

      {/* Design-specific elements */}
      {design.features.hasMandala && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: screenSize === 'mobile' ? '200px' : '350px',
            height: screenSize === 'mobile' ? '200px' : '350px',
            background: `radial-gradient(circle, transparent 45%, ${colors.accent}08 45%, ${colors.accent}10 48%, transparent 48%)`,
            borderRadius: '50%',
            opacity: 0.3,
          }}
        />
      )}

      {design.features.hasGarlandPattern && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: 0,
              right: 0,
              height: '40px',
              background: `repeating-linear-gradient(90deg, ${colors.primary}20 0px, ${colors.accent}30 10px, ${colors.primary}20 20px)`,
              opacity: 0.4,
            }}
          />
        </>
      )}

      {design.features.hasRingMotif && (
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80px',
            height: '80px',
            border: `3px solid ${colors.accent}40`,
            borderRadius: '50%',
            opacity: 0.5,
          }}
        />
      )}
    </div>
  );
};

export default EventDesignBackground;
