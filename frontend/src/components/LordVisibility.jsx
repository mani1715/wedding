import React, { useEffect, useState } from 'react';

/**
 * PHASE 23: LordVisibility Component (Updated)
 * 
 * LORD VISIBILITY TIMING RULES:
 * - For Engagement, Marriage, Reception: Show lord based on lord_display_mode
 * - Auto-hide after lord_visibility_duration seconds in hero section
 * - Support hero_only and section_based display modes
 * - For Haldi & Mehndi: Completely disabled (no lord images)
 * 
 * DESIGN RULES:
 * - No lord + background overlap
 * - Clean separation of lord and background layers
 * - Premium Indian wedding aesthetic
 * - Lazy loading with WebP first, PNG fallback
 * - No CLS shift
 */
const LordVisibility = ({ 
  lordSettings = {},
  eventType,
  section = 'hero' // 'hero', 'details', 'couple', etc.
}) => {
  const [lordData, setLordData] = useState(null);
  const [lordImage, setLordImage] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const {
    lord_enabled = false,
    lord_id = null,
    lord_display_mode = 'hero_only',
    lord_visibility_duration = 2
  } = lordSettings;
  
  // PHASE 23: Lord visibility rules - only Engagement, Marriage, Reception
  const lordEnabledEvents = ['engagement', 'marriage', 'reception'];
  const eventTypeLower = eventType ? eventType.toLowerCase() : '';
  const shouldShowLordForEvent = lordEnabledEvents.includes(eventTypeLower) && lord_enabled && lord_id;
  
  // Fetch lord data from API
  useEffect(() => {
    if (!shouldShowLordForEvent || !lord_id) {
      return;
    }
    
    const fetchLordData = async () => {
      setLoading(true);
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
        const response = await fetch(`${backendUrl}/api/lords/${lord_id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch lord data');
        }
        
        const data = await response.json();
        setLordData(data);
      } catch (error) {
        console.error('Error fetching lord data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLordData();
  }, [lord_id, shouldShowLordForEvent]);
  
  // Load lord image with lazy loading
  useEffect(() => {
    if (!lordData || !lordData.image_webp) {
      return;
    }
    
    const isMobile = window.innerWidth < 768;
    const img = new Image();
    
    // Try WebP first
    img.src = isMobile ? lordData.image_webp_mobile : lordData.image_webp;
    
    img.onload = () => {
      setLordImage(img.src);
      setImageLoaded(true);
    };
    
    // Fallback to PNG if WebP fails
    img.onerror = () => {
      if (lordData.image_png_fallback) {
        const fallbackImg = new Image();
        fallbackImg.src = lordData.image_png_fallback;
        fallbackImg.onload = () => {
          setLordImage(fallbackImg.src);
          setImageLoaded(true);
        };
      }
    };
  }, [lordData]);
  
  // PHASE 23: Auto-hide after lord_visibility_duration seconds in hero section
  useEffect(() => {
    if (!shouldShowLordForEvent || !imageLoaded) {
      return;
    }
    
    if (section === 'hero') {
      const timer = setTimeout(() => {
        setVisible(false);
      }, lord_visibility_duration * 1000); // Convert seconds to milliseconds
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    } else if (section !== 'hero' && lord_display_mode === 'section_based') {
      // For section_based mode, show in other sections
      setVisible(true);
    }
  }, [section, imageLoaded, shouldShowLordForEvent, lord_visibility_duration, lord_display_mode]);
  
  // Don't show if:
  // 1. Not enabled for this event type
  // 2. Lord not enabled
  // 3. In non-hero section and display mode is hero_only
  if (!shouldShowLordForEvent) {
    return null;
  }
  
  if (section !== 'hero' && lord_display_mode === 'hero_only') {
    return null;
  }
  
  // Don't render if loading or image not loaded
  if (loading || !lordImage || !imageLoaded) {
    return null;
  }
  
  // Section-specific styles
  const getSectionStyles = () => {
    const baseStyles = {
      transition: 'opacity 0.6s ease-in-out',
      opacity: visible ? 1 : 0,
      pointerEvents: 'none',
      zIndex: 5,
      willChange: 'opacity' // Optimize for animation
    };
    
    if (section === 'hero') {
      return {
        ...baseStyles,
        position: 'fixed',
        top: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '200px',
        height: '200px',
        maxWidth: '200px',
        maxHeight: '200px'
      };
    } else {
      // For other sections (section_based mode), show as centered element
      return {
        ...baseStyles,
        position: 'relative',
        margin: '2rem auto',
        width: '150px',
        height: '150px',
        maxWidth: '150px',
        maxHeight: '150px'
      };
    }
  };
  
  return (
    <div 
      className="lord-visibility-container"
      style={getSectionStyles()}
    >
      <picture>
        <source 
          srcSet={lordData?.image_webp || lordImage} 
          type="image/webp" 
        />
        <img
          src={lordData?.image_png_fallback || lordImage}
          alt={lordData?.name || 'Divine Deity'}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
            imageRendering: '-webkit-optimize-contrast'
          }}
        />
      </picture>
    </div>
  );
};

export default LordVisibility;
