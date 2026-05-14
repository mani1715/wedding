import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

/**
 * PHASE 26: RSVP Suggestions Component
 * Displays AI-generated message suggestions for RSVP
 */
const RSVPSuggestions = ({ eventType = 'marriage', onSelectSuggestion }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get(`${BACKEND_URL}/api/rsvp-suggestions`, {
          params: { event_type: eventType }
        });

        setSuggestions(response.data.suggestions || []);
      } catch (err) {
        console.error('Error fetching RSVP suggestions:', err);
        setError('Failed to load suggestions');
        // Set fallback suggestions
        setSuggestions([
          "Can't wait to celebrate with you! 🎉",
          "Blessings to the beautiful couple ❤️",
          "Excited for your special day! 💐"
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [eventType]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-rose-500 border-t-transparent"></div>
        <span>Loading suggestions...</span>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        Quick message ideas
      </p>
      
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelectSuggestion(suggestion)}
            className="inline-flex items-center px-3 py-2 text-sm bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 transition-colors"
          >
            <span>{suggestion}</span>
          </button>
        ))}
      </div>
      
      <p className="text-xs text-gray-500 italic">
        Click a suggestion to use it, or write your own message
      </p>
    </div>
  );
};

export default RSVPSuggestions;
