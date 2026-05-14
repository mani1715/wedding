import React from 'react';
import { Check, Save } from 'lucide-react';

/**
 * PHASE 29E: Auto-Save Indicator
 * 
 * Subtle indicator showing auto-save status.
 * Non-intrusive, appears only when relevant.
 * 
 * @param {Date} lastSaved - Last save timestamp
 * @param {boolean} isSaving - Whether currently saving
 */
const AutoSaveIndicator = ({ lastSaved, isSaving }) => {
  if (!lastSaved && !isSaving) return null;

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    
    const now = new Date();
    const diffSeconds = Math.floor((now - lastSaved) / 1000);
    
    if (diffSeconds < 5) return 'just now';
    if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`
        flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg text-sm
        transition-all duration-300 transform
        ${isSaving 
          ? 'bg-blue-600 text-white scale-100' 
          : 'bg-green-600 text-white scale-100'
        }
      `}>
        {isSaving ? (
          <>
            <Save className="w-4 h-4 animate-pulse" />
            <span>Saving draft...</span>
          </>
        ) : (
          <>
            <Check className="w-4 h-4" />
            <span>Draft saved {formatLastSaved()}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default AutoSaveIndicator;
