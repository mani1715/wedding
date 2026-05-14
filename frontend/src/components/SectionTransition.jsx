import React, { useEffect, useRef, useState } from 'react';

/**
 * PHASE 17: SectionTransition Component
 * 
 * Smooth background fade transitions between sections using Intersection Observer
 * - Observes section visibility
 * - Applies subtle background transitions
 * - Performance optimized with Intersection Observer API
 * - Respects prefers-reduced-motion
 * - No sliding or bouncing effects
 */
const SectionTransition = ({ children, sectionId, className = '', style = {} }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  
  // Check for prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  useEffect(() => {
    const currentSection = sectionRef.current;
    
    if (!currentSection || prefersReducedMotion) {
      // If reduced motion, just show the section immediately
      setIsVisible(true);
      return;
    }
    
    // Create Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Section is visible when at least 20% is in viewport
          if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: [0, 0.2, 0.5],
        rootMargin: '-50px 0px -50px 0px' // Trigger slightly before section enters viewport
      }
    );
    
    observer.observe(currentSection);
    
    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, [prefersReducedMotion]);
  
  return (
    <div
      ref={sectionRef}
      id={sectionId}
      className={`section-transition ${className}`}
      style={{
        opacity: isVisible ? 1 : 0.7,
        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
        transition: prefersReducedMotion 
          ? 'none' 
          : 'opacity 0.6s ease-out, transform 0.6s ease-out',
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default SectionTransition;
