import React from 'react';

/**
 * PHASE 14: EventContentFields Component
 * 
 * Event-type specific content fields with validation
 * 
 * VALIDATION RULES:
 * - Engagement: Bride & Groom names mandatory
 * - Haldi: Bride side & Groom side names mandatory
 * - Mehndi: Bride name mandatory
 * - Marriage: Additional details (handled via muhurtham_time in main form)
 * - Reception: Additional details (handled via dress_code in main form)
 */
const EventContentFields = ({ eventType, eventContent = {}, onChange }) => {
  const eventTypeLower = eventType ? eventType.toLowerCase() : '';
  
  const handleChange = (field, value) => {
    onChange({
      ...eventContent,
      [field]: value
    });
  };
  
  // Render fields based on event type
  const renderFields = () => {
    switch (eventTypeLower) {
      case 'engagement':
        return (
          <div className="space-y-4 bg-pink-50 border border-pink-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span className="w-1 h-5 bg-pink-500 rounded"></span>
              Engagement Details
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bride Name *
                </label>
                <input
                  type="text"
                  value={eventContent.bride_name || ''}
                  onChange={(e) => handleChange('bride_name', e.target.value)}
                  placeholder="Bride's full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  required
                />
                <p className="text-xs text-red-500 mt-1">Required for Engagement</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Groom Name *
                </label>
                <input
                  type="text"
                  value={eventContent.groom_name || ''}
                  onChange={(e) => handleChange('groom_name', e.target.value)}
                  placeholder="Groom's full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  required
                />
                <p className="text-xs text-red-500 mt-1">Required for Engagement</p>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parents Names (Optional)
                </label>
                <textarea
                  value={eventContent.parents_names || ''}
                  onChange={(e) => handleChange('parents_names', e.target.value)}
                  placeholder="Bride's parents & Groom's parents names"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        );
      
      case 'haldi':
        return (
          <div className="space-y-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span className="w-1 h-5 bg-yellow-500 rounded"></span>
              Haldi Ceremony Details
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bride Side Name *
                </label>
                <input
                  type="text"
                  value={eventContent.bride_side_name || ''}
                  onChange={(e) => handleChange('bride_side_name', e.target.value)}
                  placeholder="Bride's family name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  required
                />
                <p className="text-xs text-red-500 mt-1">Required for Haldi</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Groom Side Name *
                </label>
                <input
                  type="text"
                  value={eventContent.groom_side_name || ''}
                  onChange={(e) => handleChange('groom_side_name', e.target.value)}
                  placeholder="Groom's family name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  required
                />
                <p className="text-xs text-red-500 mt-1">Required for Haldi</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dress Color Theme
                </label>
                <input
                  type="text"
                  value={eventContent.dress_color || ''}
                  onChange={(e) => handleChange('dress_color', e.target.value)}
                  placeholder="e.g., Yellow, Turmeric, Golden"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Function Timing
                </label>
                <input
                  type="text"
                  value={eventContent.function_timing || ''}
                  onChange={(e) => handleChange('function_timing', e.target.value)}
                  placeholder="e.g., Morning Ceremony"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        );
      
      case 'mehendi':
        return (
          <div className="space-y-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span className="w-1 h-5 bg-green-500 rounded"></span>
              Mehndi Ceremony Details
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bride Name *
                </label>
                <input
                  type="text"
                  value={eventContent.bride_name || ''}
                  onChange={(e) => handleChange('bride_name', e.target.value)}
                  placeholder="Bride's full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  required
                />
                <p className="text-xs text-red-500 mt-1">Required for Mehndi</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Groom Name (Optional)
                </label>
                <input
                  type="text"
                  value={eventContent.groom_name || ''}
                  onChange={(e) => handleChange('groom_name', e.target.value)}
                  placeholder="Groom's full name (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Music/Playlist (Optional)
                </label>
                <input
                  type="url"
                  value={eventContent.music_playlist_url || ''}
                  onChange={(e) => handleChange('music_playlist_url', e.target.value)}
                  placeholder="Spotify/YouTube playlist URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Add a link to your favorite mehndi songs playlist</p>
              </div>
            </div>
          </div>
        );
      
      case 'marriage':
        return (
          <div className="space-y-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-500 rounded"></span>
              Marriage Ceremony Details
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parents Names
                </label>
                <textarea
                  value={eventContent.parents_names || ''}
                  onChange={(e) => handleChange('parents_names', e.target.value)}
                  placeholder="Bride's parents & Groom's parents names"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priest Name (Optional)
                </label>
                <input
                  type="text"
                  value={eventContent.priest_name || ''}
                  onChange={(e) => handleChange('priest_name', e.target.value)}
                  placeholder="Priest/Pandit name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ceremony Type
                </label>
                <input
                  type="text"
                  value={eventContent.ceremony_type || ''}
                  onChange={(e) => handleChange('ceremony_type', e.target.value)}
                  placeholder="e.g., Hindu, South Indian, North Indian"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Note: Muhurtham time is configured in the main form above as it's mandatory for marriage events.
            </p>
          </div>
        );
      
      case 'reception':
        return (
          <div className="space-y-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span className="w-1 h-5 bg-purple-500 rounded"></span>
              Reception Details
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reception Theme/Style
                </label>
                <input
                  type="text"
                  value={eventContent.reception_theme || ''}
                  onChange={(e) => handleChange('reception_theme', e.target.value)}
                  placeholder="e.g., Royal, Elegant, Garden Party, Formal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Notes
                </label>
                <textarea
                  value={eventContent.special_notes || ''}
                  onChange={(e) => handleChange('special_notes', e.target.value)}
                  placeholder="Any special instructions for guests"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Note: Dress code is configured in the main form above as it's optional for reception events.
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  if (!eventTypeLower) {
    return null;
  }
  
  return (
    <div className="event-content-fields">
      {renderFields()}
    </div>
  );
};

export default EventContentFields;
