import React, { useMemo } from 'react';
import { getDesignById, applyBackgroundDesign } from '../config/designSystem';

/**
 * PHASE 22: Background Renderer Component
 * 
 * Renders event-specific background designs on the public invitation page
 * - Supports CSS, image, and hybrid backgrounds
 * - No flicker during transitions
 * - Fully responsive
 * - Works with existing hero and gallery sections
 */
const BackgroundRenderer = ({ 
  event, 
  children, 
  className = '',
  enableTransitions = true 
}) => {
  // Get design configuration and styles
  const backgroundStyles = useMemo(() => {
    if (!event || !event.background_design_id) {
      // No design selected, return transparent/default
      return {
        background: 'transparent'
      };
    }

    const design = getDesignById(event.background_design_id);
    if (!design) {
      return {
        background: 'transparent'
      };
    }

    // Get color palette (custom or default)
    const colorPalette = event.color_palette || design.default_colors;

    // Apply background design
    return applyBackgroundDesign(design, colorPalette);
  }, [event]);

  // Generate CSS class based on design
  const designClassName = useMemo(() => {
    if (!event || !event.background_design_id) {
      return '';
    }

    const design = getDesignById(event.background_design_id);
    return design?.css_class || '';
  }, [event]);

  // Combine all class names
  const combinedClassName = [
    'event-background-container',
    designClassName,
    enableTransitions ? 'transition-all duration-500 ease-in-out' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={combinedClassName}
      style={backgroundStyles}
    >
      {children}
    </div>
  );
};

/**
 * Wrapper component for full-page event background
 */
export const EventPageBackground = ({ 
  event, 
  children 
}) => {
  return (
    <BackgroundRenderer
      event={event}
      className="min-h-screen w-full relative"
      enableTransitions={true}
    >
      {/* Background overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-5 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </BackgroundRenderer>
  );
};

/**
 * Section-specific background wrapper
 */
export const SectionBackground = ({ 
  event, 
  children,
  opacity = 0.8,
  className = '' 
}) => {
  return (
    <BackgroundRenderer
      event={event}
      className={`relative ${className}`}
      enableTransitions={true}
    >
      {/* Optional opacity overlay */}
      {opacity < 1 && (
        <div 
          className="absolute inset-0 bg-white pointer-events-none"
          style={{ opacity: 1 - opacity }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </BackgroundRenderer>
  );
};

/**
 * Hero section with background design
 */
export const HeroBackground = ({ 
  event, 
  children,
  overlay = true 
}) => {
  const backgroundStyles = useMemo(() => {
    if (!event || !event.background_design_id) {
      return {};
    }

    const design = getDesignById(event.background_design_id);
    if (!design) {
      return {};
    }

    const colorPalette = event.color_palette || design.default_colors;
    return applyBackgroundDesign(design, colorPalette);
  }, [event]);

  return (
    <div 
      className="relative w-full transition-all duration-500"
      style={backgroundStyles}
    >
      {/* Gradient overlay for better text visibility */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/10" />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default BackgroundRenderer;
