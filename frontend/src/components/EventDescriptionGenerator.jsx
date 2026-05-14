import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

/**
 * PHASE 26: AI Event Description Generator Component
 * Allows admin to generate event descriptions using AI
 */
const EventDescriptionGenerator = ({ 
  eventType, 
  coupleNames = '', 
  date = '', 
  venue = '',
  onDescriptionGenerated 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [rateLimit, setRateLimit] = useState(null);

  const generateDescription = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setRateLimit(null);

      // Get admin token
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('Admin authentication required');
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/admin/generate-event-description`,
        {
          event_type: eventType,
          couple_names: coupleNames || null,
          date: date || null,
          venue: venue || null
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        }
      );

      const description = response.data.description;
      onDescriptionGenerated(description);

    } catch (err) {
      console.error('Description generation error:', err);
      
      if (err.response?.status === 429) {
        setRateLimit('AI generation limit reached. You can generate up to 5 descriptions per hour.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to generate description. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Description
          </label>
          <p className="text-xs text-gray-500">
            Let AI generate an elegant description, or write your own
          </p>
        </div>
        
        <button
          type="button"
          onClick={generateDescription}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Generate with AI</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {rateLimit && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-700 text-sm rounded-lg border border-amber-200">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{rateLimit}</span>
        </div>
      )}

      <div className="flex items-start gap-2 p-3 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-200">
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="font-medium mb-1">How it works:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>AI generates a 2-3 sentence description</li>
            <li>You can edit the generated text before saving</li>
            <li>Limit: 5 generations per hour</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EventDescriptionGenerator;
