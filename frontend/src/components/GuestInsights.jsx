import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

/**
 * PHASE 26: Guest Insights Component
 * Displays AI-generated insights about guest RSVP behavior
 */
const GuestInsights = ({ profileId }) => {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!profileId) return;

      try {
        setIsLoading(true);
        setError(null);

        // Get admin token
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          throw new Error('Admin authentication required');
        }

        const response = await axios.get(
          `${BACKEND_URL}/api/admin/guest-insights/${profileId}`,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`
            }
          }
        );

        setInsights(response.data);
      } catch (err) {
        console.error('Error fetching guest insights:', err);
        if (err.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else {
          setError('Failed to load insights');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [profileId]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-rose-500 border-t-transparent"></div>
          <span className="text-gray-600">Analyzing guest data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-6">
        <div className="flex items-center gap-2 text-red-700">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!insights || insights.total_rsvps === 0) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-600 font-medium">No RSVP data yet</p>
          <p className="text-sm text-gray-500 mt-1">Insights will appear once guests start responding</p>
        </div>
      </div>
    );
  }

  const confirmationRate = Math.round((insights.confirmed / insights.total_rsvps) * 100);

  return (
    <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg border border-rose-200 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          Guest Insights
        </h3>
        <span className="text-xs text-gray-500">
          AI-powered analysis
        </span>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-rose-100">
          <div className="text-2xl font-bold text-rose-600">{insights.total_rsvps}</div>
          <div className="text-xs text-gray-600 mt-1">Total RSVPs</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-green-100">
          <div className="text-2xl font-bold text-green-600">{insights.confirmed}</div>
          <div className="text-xs text-gray-600 mt-1">Confirmed</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-amber-100">
          <div className="text-2xl font-bold text-amber-600">{insights.pending}</div>
          <div className="text-xs text-gray-600 mt-1">Pending</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="text-2xl font-bold text-gray-600">{insights.declined}</div>
          <div className="text-xs text-gray-600 mt-1">Declined</div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-600">{insights.early_responses}</div>
          <div className="text-xs text-gray-600">Quick responses (within 24h)</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-purple-600">{insights.with_messages}</div>
          <div className="text-xs text-gray-600">With personal messages</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-teal-600">{confirmationRate}%</div>
          <div className="text-xs text-gray-600">Confirmation rate</div>
        </div>
      </div>

      {/* AI Insights Text */}
      <div className="bg-white rounded-lg p-4 border border-rose-100">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Key Insights</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {insights.insights_text}
            </p>
          </div>
        </div>
      </div>

      {/* Timestamp */}
      <div className="text-xs text-gray-500 text-center">
        Generated {new Date(insights.generated_at).toLocaleString()}
      </div>
    </div>
  );
};

export default GuestInsights;
