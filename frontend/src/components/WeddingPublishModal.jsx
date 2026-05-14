import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, AlertCircle, CheckCircle, Sparkles, Rocket } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const PublishModal = ({ wedding, onClose, onPublishSuccess }) => {
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);

  const handlePublish = async () => {
    try {
      setPublishing(true);
      setError(null);

      const response = await axios.post(
        `${API_URL}/api/weddings/${wedding.id}/publish`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        onPublishSuccess(response.data);
      }
    } catch (err) {
      console.error('Publish error:', err);
      setError(err.response?.data?.detail || 'Failed to publish wedding');
    } finally {
      setPublishing(false);
    }
  };

  const totalCost = wedding.estimated_cost || 0;
  const availableCredits = wedding.admin_credits?.available || 0;
  const remainingCredits = availableCredits - totalCost;
  const canAfford = remainingCredits >= 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Publish Wedding</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Wedding Info */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-2">{wedding.title}</h3>
            <p className="text-sm text-purple-700">
              Slug: <span className="font-mono font-medium">/{wedding.slug}</span>
            </p>
          </div>

          {/* Design Selection */}
          {wedding.selected_design_key && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Selected Design</h4>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-sm text-gray-900 font-medium">
                  {wedding.selected_design_key}
                </p>
              </div>
            </div>
          )}

          {/* Features */}
          {wedding.selected_features && wedding.selected_features.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Selected Features</h4>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <ul className="space-y-1">
                  {wedding.selected_features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Credit Breakdown */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h4 className="font-semibold text-amber-900">Credit Summary</h4>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Total Credits Required:</span>
                <span className="font-bold text-gray-900">{totalCost} credits</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Your Available Credits:</span>
                <span className="font-bold text-blue-600">{availableCredits} credits</span>
              </div>
              <div className="h-px bg-amber-200 my-2"></div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Remaining After Publish:</span>
                <span className={`font-bold ${remainingCredits >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {remainingCredits} credits
                </span>
              </div>
            </div>
          </div>

          {/* Warning or Success Message */}
          {!canAfford && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">Insufficient Credits</p>
                <p className="text-sm text-red-700 mt-1">
                  You need {Math.abs(remainingCredits)} more credits to publish this wedding.
                  Please contact your administrator to add more credits.
                </p>
              </div>
            </div>
          )}

          {canAfford && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-900">Ready to Publish</p>
                <p className="text-sm text-green-700 mt-1">
                  Your wedding is ready to be published. Click confirm to make it live.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={publishing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={publishing || !canAfford}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            {publishing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Publishing...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                Confirm Publish
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PublishModal;
