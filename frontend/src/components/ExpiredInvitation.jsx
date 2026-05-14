import React from 'react';
import { Calendar, Mail, Phone, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ExpiredInvitation = ({ errorType = '404', message = '' }) => {
  const isExpired = errorType === '410';
  const isNotFound = errorType === '404';

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Decorative Header */}
        <div className="h-2 bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400" />
        
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center">
              <Calendar className="w-12 h-12 text-rose-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {isExpired && 'Invitation Expired'}
            {isNotFound && 'Invitation Not Found'}
            {!isExpired && !isNotFound && 'Unable to Load Invitation'}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            {message || (
              isExpired
                ? 'This invitation link has expired. The event may have already taken place or the host has disabled this invitation.'
                : isNotFound
                ? 'We could not find the invitation you are looking for. Please check the link and try again.'
                : 'There was an issue loading this invitation. Please contact the host for assistance.'
            )}
          </p>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6 mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Need help? Contact the host:
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:host@example.com"
                className="inline-flex items-center justify-center gap-2 text-sm text-rose-600 hover:text-rose-700 font-medium"
              >
                <Mail className="w-4 h-4" />
                Email Host
              </a>
              <a
                href="tel:+1234567890"
                className="inline-flex items-center justify-center gap-2 text-sm text-rose-600 hover:text-rose-700 font-medium"
              >
                <Phone className="w-4 h-4" />
                Call Host
              </a>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={() => window.location.href = '/'}
            className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white flex items-center justify-center gap-2 mx-auto"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </Button>

          {/* Decorative Elements */}
          <div className="mt-8 flex justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-300 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-pink-300 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 rounded-full bg-purple-300 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpiredInvitation;
