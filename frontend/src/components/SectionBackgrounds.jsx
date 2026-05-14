import React, { useEffect, useState } from 'react';

/**
 * PHASE 14: SectionBackgrounds Component
 * 
 * SECTION-BASED BACKGROUND SWITCHING:
 * - Each scroll section loads its own background
 * - Smooth fade transition (no heavy animation)
 * - Backgrounds are event-specific
 * - Background remains static (no movement/parallax)
 * 
 * DESIGN RULES:
 * - No lord + background overlap
 * - Background layer independent from content
 * - Premium, calm aesthetic
 */
const SectionBackgrounds = ({ 
  eventType, 
  backgroundConfig,
  sections = ['hero', 'welcome', 'couple', 'events', 'photos', 'greetings']
}) => {
  const [currentSection, setCurrentSection] = useState('hero');
  const [currentBackground, setCurrentBackground] = useState(null);
  
  // PHASE 14: Event-specific background configurations
  const getEventBackgrounds = (eventType) => {
    const eventTypeLower = eventType ? eventType.toLowerCase() : '';
    
    // Default backgrounds per section for each event type
    const backgrounds = {
      engagement: {
        hero: backgroundConfig?.hero_background_id || '/assets/backgrounds/engagement-rings.jpg',
        welcome: '/assets/backgrounds/engagement-flowers.jpg',
        couple: '/assets/backgrounds/engagement-rings.jpg',
        events: '/assets/backgrounds/engagement-flowers.jpg',
        photos: '/assets/backgrounds/engagement-rings.jpg',
        greetings: '/assets/backgrounds/engagement-flowers.jpg'
      },
      haldi: {
        hero: backgroundConfig?.hero_background_id || '/assets/backgrounds/haldi-turmeric.jpg',
        welcome: '/assets/backgrounds/haldi-bindelu.jpg',
        couple: '/assets/backgrounds/haldi-yellow-florals.jpg',
        events: '/assets/backgrounds/haldi-abstract.jpg',
        photos: '/assets/backgrounds/haldi-turmeric.jpg',
        greetings: '/assets/backgrounds/haldi-bindelu.jpg'
      },
      mehendi: {
        hero: backgroundConfig?.hero_background_id || '/assets/backgrounds/mehendi-pattern.jpg',
        welcome: '/assets/backgrounds/mehendi-green-leaves.jpg',
        couple: '/assets/backgrounds/mehendi-paisley.jpg',
        events: '/assets/backgrounds/mehendi-abstract.jpg',
        photos: '/assets/backgrounds/mehendi-pattern.jpg',
        greetings: '/assets/backgrounds/mehendi-green-leaves.jpg'
      },
      marriage: {
        hero: backgroundConfig?.hero_background_id || '/assets/backgrounds/marriage-lord.jpg',
        welcome: '/assets/backgrounds/marriage-temple.jpg',
        couple: '/assets/backgrounds/marriage-divine.jpg',
        events: '/assets/backgrounds/marriage-traditional.jpg',
        photos: '/assets/backgrounds/marriage-lord.jpg',
        greetings: '/assets/backgrounds/marriage-temple.jpg'
      },
      reception: {
        hero: backgroundConfig?.hero_background_id || '/assets/backgrounds/reception-royal.jpg',
        welcome: '/assets/backgrounds/reception-elegant.jpg',
        couple: '/assets/backgrounds/reception-classy.jpg',
        events: '/assets/backgrounds/reception-formal.jpg',
        photos: '/assets/backgrounds/reception-royal.jpg',
        greetings: '/assets/backgrounds/reception-elegant.jpg'
      }
    };
    
    return backgrounds[eventTypeLower] || backgrounds.engagement;
  };
  
  const eventBackgrounds = getEventBackgrounds(eventType);
  
  // Detect current section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Calculate which section is currently in view
      const sectionElements = sections.map(section => {
        const element = document.getElementById(`section-${section}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + scrollPosition;
          const elementHeight = rect.height;
          
          return {
            section,
            top: elementTop,
            bottom: elementTop + elementHeight,
            inView: rect.top < windowHeight / 2 && rect.bottom > windowHeight / 2
          };
        }
        return null;
      }).filter(Boolean);
      
      // Find the section currently in the center of viewport
      const activeSection = sectionElements.find(s => s.inView);
      if (activeSection && activeSection.section !== currentSection) {
        setCurrentSection(activeSection.section);
      }
    };
    
    // Debounce scroll handler
    let scrollTimeout;
    const debouncedHandleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    };
    
    window.addEventListener('scroll', debouncedHandleScroll);
    handleScroll(); // Initial check
    
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [sections, currentSection]);
  
  // Update background when section changes
  useEffect(() => {
    const newBackground = eventBackgrounds[currentSection] || eventBackgrounds.hero;
    if (newBackground !== currentBackground) {
      setCurrentBackground(newBackground);
    }
  }, [currentSection, eventBackgrounds, currentBackground]);
  
  return (
    <div 
      className="section-backgrounds-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    >
      {/* Background Image Layer */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed', // Static, no parallax
          opacity: 0.2,
          transition: 'opacity 0.8s ease-in-out, background-image 0.8s ease-in-out',
          filter: 'blur(2px)' // Subtle blur for premium feel
        }}
      />
      
      {/* Gradient Overlay for Better Text Readability */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.3) 100%)',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default SectionBackgrounds;
