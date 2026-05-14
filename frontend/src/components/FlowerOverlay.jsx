import React, { useEffect, useState, useCallback } from 'react';

/**
 * PHASE 17: FlowerOverlay Component (Enhanced)
 * 
 * FLOWER OVERLAY ON FIRST SCROLL:
 * - Soft flower petals appear ONLY on first scroll interaction
 * - Low opacity, calm motion
 * - Automatically disabled on low-end devices
 * - No heavy animations
 * - NO flowers for Reception events (per PHASE 17 rules)
 * - Respects prefers-reduced-motion
 * 
 * DESIGN RULES:
 * - Premium, divine aesthetic
 * - Minimal performance impact
 * - Elegant and subtle
 * - Trigger once per visit
 */
const FlowerOverlay = ({ eventType, enabled = true, decorativeEffects = true }) => {
  const [flowers, setFlowers] = useState([]);
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [lastScrollTime, setLastScrollTime] = useState(0);
  const [hasTriggered, setHasTriggered] = useState(false);
  
  // Get flower style based on event type
  const getFlowerStyle = (eventType) => {
    const eventTypeLower = eventType ? eventType.toLowerCase() : '';
    
    const styles = {
      engagement: {
        color: '#FFB6C1', // Light pink
        emoji: '🌸',
        size: 20
      },
      haldi: {
        color: '#FFD700', // Gold/Yellow
        emoji: '🌼',
        size: 18
      },
      mehendi: {
        color: '#90EE90', // Light green
        emoji: '🍃',
        size: 16
      },
      marriage: {
        color: '#FF6347', // Red
        emoji: '🌺',
        size: 22
      },
      reception: {
        color: '#DDA0DD', // Plum
        emoji: '🌹',
        size: 20
      }
    };
    
    return styles[eventTypeLower] || styles.engagement;
  };
  
  const flowerStyle = getFlowerStyle(eventType);
  
  // Check for prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // PHASE 17: Reception should not have flowers
  const shouldShowFlowers = () => {
    const eventTypeLower = eventType ? eventType.toLowerCase() : '';
    // NO flowers for Reception events
    if (eventTypeLower === 'reception') {
      return false;
    }
    return true;
  };
  
  // Create multiple flowers in a burst (only on first scroll)
  const createFlowerBurst = useCallback(() => {
    if (hasTriggered) return;
    
    setHasTriggered(true);
    
    // Create 8-12 flowers at random positions
    const flowerCount = 8 + Math.floor(Math.random() * 5);
    const newFlowers = [];
    
    for (let i = 0; i < flowerCount; i++) {
      newFlowers.push({
        id: Math.random(),
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        rotation: Math.random() * 360,
        delay: i * 0.1 + Math.random() * 0.3,
        duration: 2 + Math.random() * 1
      });
    }
    
    setFlowers(newFlowers);
    
    // Auto-remove all flowers after animations complete
    setTimeout(() => {
      setFlowers([]);
    }, 4000);
  }, [hasTriggered]);
  
  // Detect low-end device
  useEffect(() => {
    const checkDevicePerformance = () => {
      // Check for low-end device indicators
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const cores = navigator.hardwareConcurrency || 2;
      const memory = navigator.deviceMemory || 2;
      
      // Consider low-end if: mobile with <= 2 cores or <= 2GB memory
      const isLowEnd = isMobile && (cores <= 2 || memory <= 2);
      setIsLowEndDevice(isLowEnd);
    };
    
    checkDevicePerformance();
  }, []);
  
  // PHASE 17: Handle FIRST scroll only
  useEffect(() => {
    if (isLowEndDevice || !enabled || hasTriggered || prefersReducedMotion || !shouldShowFlowers()) {
      return;
    }
    
    const handleFirstScroll = () => {
      // Only trigger if user has scrolled more than 50px
      if (window.scrollY > 50 && !hasTriggered) {
        createFlowerBurst();
      }
    };
    
    window.addEventListener('scroll', handleFirstScroll, { passive: true, once: true });
    return () => window.removeEventListener('scroll', handleFirstScroll);
  }, [createFlowerBurst, isLowEndDevice, enabled, hasTriggered, prefersReducedMotion]);
  
  // Don't render on low-end devices, if disabled, reduced motion, or Reception event
  if (isLowEndDevice || !enabled || !decorativeEffects || prefersReducedMotion || !shouldShowFlowers()) {
    return null;
  }
  
  return (
    <div 
      className="flower-overlay-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
        overflow: 'hidden'
      }}
    >
      {flowers.map(flower => (
        <div
          key={flower.id}
          style={{
            position: 'absolute',
            left: `${flower.x}px`,
            top: `${flower.y}px`,
            fontSize: `${flowerStyle.size}px`,
            opacity: 0,
            transform: `rotate(${flower.rotation}deg)`,
            animation: `flowerFade ${flower.duration}s ease-out ${flower.delay}s forwards`,
            pointerEvents: 'none'
          }}
        >
          {flowerStyle.emoji}
        </div>
      ))}
      
      {/* CSS Animation */}
      <style>
        {`
          @keyframes flowerFade {
            0% {
              opacity: 0;
              transform: translateY(0) rotate(0deg) scale(0.5);
            }
            20% {
              opacity: 0.6;
            }
            80% {
              opacity: 0.4;
              transform: translateY(-50px) rotate(180deg) scale(1);
            }
            100% {
              opacity: 0;
              transform: translateY(-80px) rotate(360deg) scale(0.3);
            }
          }
        `}
      </style>
    </div>
  );
};

export default FlowerOverlay;
