import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PublishModal = ({ isOpen, onClose, weddingId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [weddingDetails, setWeddingDetails] = useState(null);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    if (isOpen && weddingId) {
      fetchWeddingDetails();
    }
  }, [isOpen, weddingId]);

  const fetchWeddingDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/weddings/${weddingId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setWeddingDetails(response.data);
    } catch (err) {
      setError('Failed to load wedding details');
      console.error(err);
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/weddings/${weddingId}/publish`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        onSuccess(response.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to publish wedding');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const wedding = weddingDetails?.wedding;
  const costBreakdown = weddingDetails?.cost_breakdown;
  const adminCredits = weddingDetails?.admin_credits;
  const canPublish = weddingDetails?.can_publish;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Publish Wedding</h2>
          <p className="text-sm text-gray-600 mt-1">
            Review details and confirm publication
          </p>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {!weddingDetails ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading wedding details...</p>
            </div>
          ) : (
            <>
              {/* Wedding Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Wedding Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Title:</span>
                    <span className="font-medium text-gray-900">{wedding?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Couple:</span>
                    <span className="font-medium text-gray-900">
                      {wedding?.groom_name} & {wedding?.bride_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Slug:</span>
                    <span className="font-medium text-blue-600">{wedding?.slug}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Design:</span>
                    <span className="font-medium text-gray-900">
                      {wedding?.selected_design_key || wedding?.design_id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              {costBreakdown && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-3">Credit Cost Breakdown</h3>
                  <div className="space-y-2">
                    {costBreakdown.breakdown?.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-purple-700">{item.item}</span>
                        <span className="font-medium text-purple-900">{item.cost} credits</span>
                      </div>
                    ))}
                    <div className="border-t border-purple-300 pt-2 mt-2 flex justify-between font-bold text-lg">
                      <span className="text-purple-900">Total Cost:</span>
                      <span className="text-purple-900">{costBreakdown.total} credits</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Credits */}
              {adminCredits && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">Your Credits</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Available Credits:</span>
                      <span className="font-bold text-blue-900 text-lg">{adminCredits.available}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">After Publication:</span>
                      <span className={`font-bold text-lg ${
                        adminCredits.available - (costBreakdown?.total || 0) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {adminCredits.available - (costBreakdown?.total || 0)} credits
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Insufficient Credits Warning */}
              {!canPublish && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2">Insufficient Credits</h3>
                  <p className="text-sm text-red-700">
                    You don't have enough credits to publish this wedding. Please contact the
                    Super Admin to add more credits to your account.
                  </p>
                </div>
              )}

              {/* Confirmation Message */}
              {canPublish && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    ✓ All requirements met. Once published, the credits will be deducted and the
                    wedding will be publicly accessible.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={loading || !canPublish || !weddingDetails}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Publishing...
              </span>
            ) : (
              'Confirm & Publish'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishModal;
