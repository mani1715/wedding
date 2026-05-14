import React from 'react';

/**
 * PHASE 29D: Skip to Content Component
 * 
 * Provides a keyboard-accessible skip link that becomes visible on focus.
 * Allows keyboard users to bypass navigation and jump directly to main content.
 * 
 * WCAG 2.4.1 - Bypass Blocks (Level A)
 */
const SkipToContent = () => {
  return (
    <a
      href="#main-content"
      className="skip-to-content"
      style={{
        position: 'absolute',
        left: '-9999px',
        zIndex: 9999,
        padding: '1rem 1.5rem',
        backgroundColor: '#1f2937',
        color: '#ffffff',
        textDecoration: 'none',
        borderRadius: '0.375rem',
        fontSize: '1rem',
        fontWeight: '600',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease'
      }}
      onFocus={(e) => {
        e.target.style.left = '1rem';
        e.target.style.top = '1rem';
      }}
      onBlur={(e) => {
        e.target.style.left = '-9999px';
        e.target.style.top = 'auto';
      }}
    >
      Skip to main content
    </a>
  );
};

export default SkipToContent;
