import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

/**
 * PHASE 35: Guest Referral CTA Component
 * Shows on public invitation pages to encourage guests to create their own
 * NO SPAM, NO POPUPS - Just a subtle, premium CTA
 */
const GuestReferralCTA = ({ profileSlug, referralCode }) => {
  const handleCreateOwn = () => {
    const baseUrl = window.location.origin;
    const url = referralCode 
      ? `${baseUrl}/admin/login?ref=${referralCode}`
      : `${baseUrl}/admin/login`;
    
    window.open(url, '_blank');
  };

  return (
    <div className="mt-12 mb-8">
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl p-8 border-2 border-purple-200 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Love this invitation?
            </h3>
            <p className="text-gray-600 mb-4">
              Create your own beautiful wedding invitation in minutes! 
              {referralCode && (
                <span className="block mt-1 text-purple-600 font-medium">
                  Use code <code className="bg-white px-2 py-1 rounded font-bold">{referralCode}</code> and get 50 free credits! 🎁
                </span>
              )}
            </p>
            
            <button
              onClick={handleCreateOwn}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
            >
              Create Your Invitation
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-purple-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">✨ Beautiful designs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">📱 Mobile-friendly</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">🚀 Ready in minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestReferralCTA;
