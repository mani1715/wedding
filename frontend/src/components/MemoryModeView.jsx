import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * PHASE 27: Memory Mode View Component
 * 
 * Displays thank you message and wedding album for guests
 * - Calm, nostalgic UI
 * - Read-only album view
 * - Thank you message prominently displayed
 */
const MemoryModeView = ({ slugUrl }) => {
  const [thankYouMessage, setThankYouMessage] = useState(null);
  const [albumMedia, setAlbumMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [loading, setLoading] = useState(true);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    fetchMemoryModeData();
  }, [slugUrl]);

  const fetchMemoryModeData = async () => {
    try {
      // Fetch thank you message
      const thankYouResponse = await axios.get(
        `${backendUrl}/api/profiles/${slugUrl}/thank-you`
      );
      if (thankYouResponse.data.exists !== false) {
        setThankYouMessage(thankYouResponse.data);
      }

      // Fetch wedding album
      const albumResponse = await axios.get(
        `${backendUrl}/api/profiles/${slugUrl}/album-media`
      );
      setAlbumMedia(albumResponse.data.media || []);
    } catch (error) {
      console.error('Error fetching memory mode data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (media) => {
    setSelectedMedia(media);
  };

  const closeLightbox = () => {
    setSelectedMedia(null);
  };

  const navigateLightbox = (direction) => {
    const currentIndex = albumMedia.findIndex(m => m.id === selectedMedia.id);
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % albumMedia.length
      : (currentIndex - 1 + albumMedia.length) % albumMedia.length;
    setSelectedMedia(albumMedia[newIndex]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading memories...</div>
      </div>
    );
  }

  return (
    <div className="memory-mode-container">
      {/* Thank You Message Section */}
      {thankYouMessage && thankYouMessage.enabled && (
        <section className="thank-you-section py-12 px-4 bg-gradient-to-b from-rose-50 to-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-6">
              Thank You 💝
            </h2>

            {thankYouMessage.message_type === 'text' ? (
              <div className="prose prose-lg mx-auto">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {thankYouMessage.message_text}
                </p>
              </div>
            ) : thankYouMessage.video_url ? (
              <div className="max-w-3xl mx-auto">
                <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-xl">
                  <video
                    src={`${backendUrl}${thankYouMessage.video_url}`}
                    controls
                    className="w-full h-full"
                    poster={thankYouMessage.video_thumbnail ? `${backendUrl}${thankYouMessage.video_thumbnail}` : undefined}
                  />
                </div>
              </div>
            ) : null}

            <div className="mt-8 text-sm text-gray-500">
              With love and gratitude
            </div>
          </div>
        </section>
      )}

      {/* Wedding Album Section */}
      {albumMedia.length > 0 && (
        <section className="wedding-album-section py-12 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif text-gray-800 text-center mb-8">
              Our Wedding Album 📸
            </h2>

            {/* Album Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {albumMedia.map((media, idx) => (
                <div
                  key={media.id}
                  className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow"
                  onClick={() => openLightbox(media)}
                >
                  {media.media_type === 'photo' ? (
                    <img
                      src={`${backendUrl}${media.media_url}`}
                      alt={media.caption || `Wedding photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <>
                      <video
                        src={`${backendUrl}${media.media_url}`}
                        className="w-full h-full object-cover"
                        poster={media.thumbnail_url ? `${backendUrl}${media.thumbnail_url}` : undefined}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-white bg-opacity-90 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Caption Overlay */}
                  {media.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                      <p className="text-xs text-white truncate">{media.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
            className="absolute left-4 text-white hover:text-gray-300 z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
            className="absolute right-4 text-white hover:text-gray-300 z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="max-w-6xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {selectedMedia.media_type === 'photo' ? (
              <img
                src={`${backendUrl}${selectedMedia.media_url}`}
                alt={selectedMedia.caption || 'Wedding photo'}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            ) : (
              <video
                src={`${backendUrl}${selectedMedia.media_url}`}
                controls
                autoPlay
                className="max-w-full max-h-[90vh] rounded-lg"
              />
            )}

            {selectedMedia.caption && (
              <p className="text-white text-center mt-4 text-lg">{selectedMedia.caption}</p>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!thankYouMessage && albumMedia.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No memories available yet.
        </div>
      )}
    </div>
  );
};

export default MemoryModeView;
