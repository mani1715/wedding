import React from 'react';
import { Image, Video, MessageCircle, Calendar, Gift } from 'lucide-react';

const EmptyState = ({ type = 'gallery', message = '' }) => {
  const getIcon = () => {
    switch (type) {
      case 'gallery':
        return <Image className="w-12 h-12 text-gray-400" />;
      case 'video':
        return <Video className="w-12 h-12 text-gray-400" />;
      case 'wishes':
        return <MessageCircle className="w-12 h-12 text-gray-400" />;
      case 'events':
        return <Calendar className="w-12 h-12 text-gray-400" />;
      case 'gifts':
        return <Gift className="w-12 h-12 text-gray-400" />;
      default:
        return <Image className="w-12 h-12 text-gray-400" />;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'gallery':
        return 'No photos available yet';
      case 'video':
        return 'No videos available yet';
      case 'wishes':
        return 'No wishes yet. Be the first to share your blessings!';
      case 'events':
        return 'No events scheduled';
      case 'gifts':
        return 'No gifts registered yet';
      default:
        return 'No content available';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Icon Container */}
      <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mb-4">
        {getIcon()}
      </div>

      {/* Message */}
      <p className="text-gray-600 font-medium mb-2">
        {message || getDefaultMessage()}
      </p>

      {/* Subtitle */}
      <p className="text-sm text-gray-500 max-w-sm">
        {type === 'wishes' && 'Your heartfelt message will appear here after approval.'}
        {type === 'gallery' && 'Photos will be added soon. Check back later!'}
        {type === 'video' && 'Videos will be added soon. Check back later!'}
      </p>

      {/* Decorative dots */}
      <div className="mt-6 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-gray-300" />
        <div className="w-2 h-2 rounded-full bg-gray-200" />
        <div className="w-2 h-2 rounded-full bg-gray-100" />
      </div>
    </div>
  );
};

export default EmptyState;
