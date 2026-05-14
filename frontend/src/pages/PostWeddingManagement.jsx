import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import ThankYouMessageEditor from '@/components/ThankYouMessageEditor';
import WeddingAlbumUploader from '@/components/WeddingAlbumUploader';

/**
 * PHASE 27: Post-Wedding Management Page
 * 
 * Admin page for managing post-wedding features:
 * - Thank you message (text or video)
 * - Wedding album (final photos/videos)
 */
const PostWeddingManagement = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { admin } = useAuth();

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
    }
  }, [admin, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Post-Wedding Management
          </h1>
          <p className="mt-2 text-gray-600">
            PHASE 27: Create lasting memories with thank you messages and wedding albums
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">
            ✨ Post-Wedding Features
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Thank You Message:</strong> Send gratitude to all guests (text or video)</li>
            <li>• <strong>Wedding Album:</strong> Upload final photos/videos with lifetime access</li>
            <li>• <strong>Memory Mode:</strong> Automatically activates after wedding date</li>
            <li>• <strong>Same URL:</strong> Everything accessible from the same invitation link</li>
          </ul>
        </div>

        {/* Thank You Message Section */}
        <div className="mb-8">
          <ThankYouMessageEditor profileId={profileId} />
        </div>

        {/* Wedding Album Section */}
        <div className="mb-8">
          <WeddingAlbumUploader profileId={profileId} />
        </div>

        {/* Memory Mode Info */}
        <div className="bg-gradient-to-r from-rose-50 to-purple-50 border border-rose-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🌙 About Memory Mode
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            After your wedding date passes, the invitation automatically switches to <strong>Memory Mode</strong>:
          </p>
          <ul className="mt-3 text-sm text-gray-700 space-y-2">
            <li>• RSVP form is automatically hidden</li>
            <li>• Countdown timer disappears</li>
            <li>• Focus shifts to photos, videos, and your thank you message</li>
            <li>• Calm, nostalgic UI replaces event urgency</li>
            <li>• Guests can revisit memories anytime, forever</li>
          </ul>
          <p className="mt-4 text-sm text-gray-600 italic">
            Your invitation becomes a permanent digital memory, not just a one-time event page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PostWeddingManagement;
