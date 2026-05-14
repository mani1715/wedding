import React, { useState, useEffect, useRef } from 'react';
import useFocusTrap from '@/hooks/useFocusTrap';

/**
 * PHASE 21: Event-Wise Photo Gallery Component
 * PHASE 29D: Enhanced with full accessibility & keyboard navigation
 * 
 * Features:
 * - Responsive grid (2 cols mobile, 3-4 cols desktop)
 * - Lazy loading with blur placeholder
 * - Fullscreen viewer with navigation
 * - Swipe support on mobile
 * - Clean, premium design
 * - Full keyboard accessibility (Tab, Enter, Space, Arrow keys, ESC)
 * - Focus trapping in fullscreen viewer
 * - Focus restoration on close
 * - ARIA labels and semantic HTML
 */

const EventGallery = ({ gallery_images = [], eventType = '', onGalleryOpen = null }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const imageRefs = useRef([]);
  const thumbnailRefs = useRef([]);

  // Sort images by order
  const sortedImages = [...gallery_images].sort((a, b) => a.order - b.order);

  // Focus trap for fullscreen viewer
  const modalRef = useFocusTrap(selectedImageIndex !== null, closeFullscreen);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    // Don't run if no images
    if (!sortedImages || sortedImages.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.src;
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px',
      }
    );

    imageRefs.current.forEach((img) => {
      if (img) observer.observe(img);
    });

    return () => {
      observer.disconnect();
    };
  }, [sortedImages]);

  // Handle keyboard navigation in fullscreen
  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedImageIndex(null);
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex]);

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const goToPrevious = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedImageIndex < sortedImages.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const openFullscreen = (index) => {
    setSelectedImageIndex(index);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
    
    // PHASE 30: Track gallery opened
    if (onGalleryOpen) {
      onGalleryOpen();
    }
  };

  const closeFullscreen = () => {
    setSelectedImageIndex(null);
    document.body.style.overflow = ''; // Restore scroll
    
    // Restore focus to the thumbnail that was clicked
    if (thumbnailRefs.current[selectedImageIndex]) {
      thumbnailRefs.current[selectedImageIndex].focus();
    }
  };

  const API_URL = process.env.REACT_APP_BACKEND_URL || '';

  // Don't render if no images (after all hooks)
  if (!sortedImages || sortedImages.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-8 px-4" aria-labelledby="gallery-heading">
      {/* Gallery Header */}
      <header className="text-center mb-6">
        <h3 id="gallery-heading" className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Photo Gallery
        </h3>
        <div className="w-16 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full" aria-hidden="true"></div>
      </header>

      {/* Image Grid - Responsive */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 max-w-6xl mx-auto" role="list">
        {sortedImages.map((img, index) => (
          <button
            key={img.id}
            ref={(el) => (thumbnailRefs.current[index] = el)}
            className="relative aspect-square group overflow-hidden rounded-lg shadow-md hover:shadow-xl focus-visible:shadow-xl transition-shadow duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500"
            onClick={() => openFullscreen(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openFullscreen(index);
              }
            }}
            aria-label={`View photo ${index + 1} of ${sortedImages.length} in fullscreen`}
            role="listitem"
          >
            {/* Blur Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
            
            {/* Lazy Loaded Image */}
            <img
              ref={(el) => (imageRefs.current[index] = el)}
              data-src={`${API_URL}${img.image_url}`}
              alt={`Gallery photo ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 group-focus:scale-110"
              loading="lazy"
            />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 group-focus:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <span className="text-white text-3xl opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300" aria-hidden="true">
                🔍
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Fullscreen Viewer */}
      {selectedImageIndex !== null && (
        <div
          ref={modalRef}
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-labelledby="fullscreen-image-title"
          aria-describedby="fullscreen-image-desc"
        >
          {/* Screen reader announcements */}
          <h2 id="fullscreen-image-title" className="sr-only">
            Fullscreen photo viewer
          </h2>
          <p id="fullscreen-image-desc" className="sr-only">
            Photo {selectedImageIndex + 1} of {sortedImages.length}. Use arrow keys to navigate, escape to close.
          </p>

          {/* Close Button */}
          <button
            onClick={closeFullscreen}
            className="absolute top-6 right-6 z-50 bg-white rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-200 focus-visible:bg-gray-200 active:scale-95 transition-all text-2xl font-bold shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500"
            style={{
              width: '48px',
              height: '48px',
              minWidth: '48px',
              minHeight: '48px',
              touchAction: 'manipulation'
            }}
            aria-label="Close fullscreen viewer"
          >
            ×
          </button>

          {/* Image Counter */}
          <div 
            className="absolute top-6 left-6 z-50 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm"
            aria-live="polite"
            aria-atomic="true"
          >
            {selectedImageIndex + 1} / {sortedImages.length}
          </div>

          {/* Previous Button */}
          {selectedImageIndex > 0 && (
            <button
              onClick={goToPrevious}
              className="absolute left-6 z-50 bg-white rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-200 focus-visible:bg-gray-200 active:scale-95 transition-all text-3xl font-bold shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500"
              style={{
                width: '56px',
                height: '56px',
                minWidth: '56px',
                minHeight: '56px',
                top: '50%',
                transform: 'translateY(-50%)',
                touchAction: 'manipulation'
              }}
              aria-label="Previous photo"
            >
              <span aria-hidden="true">‹</span>
            </button>
          )}

          {/* Image */}
          <img
            src={`${API_URL}${sortedImages[selectedImageIndex].image_url}`}
            alt={`Fullscreen photo ${selectedImageIndex + 1}`}
            className="max-w-full max-h-full object-contain p-4"
          />

          {/* Next Button */}
          {selectedImageIndex < sortedImages.length - 1 && (
            <button
              onClick={goToNext}
              className="absolute right-6 z-50 bg-white rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-200 focus-visible:bg-gray-200 active:scale-95 transition-all text-3xl font-bold shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500"
              style={{
                width: '56px',
                height: '56px',
                minWidth: '56px',
                minHeight: '56px',
                top: '50%',
                transform: 'translateY(-50%)',
                touchAction: 'manipulation'
              }}
              aria-label="Next photo"
            >
              <span aria-hidden="true">›</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default EventGallery;
