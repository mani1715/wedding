import React, { useState, useEffect } from 'react';

/**
 * PHASE 23: LordSettingsSelector Component
 * 
 * Provides event-level lord image configuration with:
 * - Enable/disable toggle
 * - Lord selection from library
 * - Display mode selection (hero_only vs section_based)
 * - Visibility duration slider (1-10 seconds)
 * - Live preview of selected lord
 * 
 * Rules:
 * - Engagement, Marriage, Reception: All lords available
 * - Haldi, Mehendi: Component disabled completely
 * - Auto-applies Ganesha as default
 */
const LordSettingsSelector = ({ 
  eventId, 
  eventType,
  currentSettings = {},
  onUpdate,
  adminToken 
}) => {
  const [lordLibrary, setLordLibrary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Local state for lord settings
  const [lordEnabled, setLordEnabled] = useState(currentSettings.lord_enabled || true);
  const [selectedLordId, setSelectedLordId] = useState(currentSettings.lord_id || 'ganesha');
  const [displayMode, setDisplayMode] = useState(currentSettings.lord_display_mode || 'hero_only');
  const [visibilityDuration, setVisibilityDuration] = useState(currentSettings.lord_visibility_duration || 2);
  
  // Check if lord is allowed for this event type
  const lordAllowedEvents = ['engagement', 'marriage', 'reception'];
  const isLordAllowed = lordAllowedEvents.includes(eventType?.toLowerCase());
  
  // Fetch lord library
  useEffect(() => {
    if (!isLordAllowed) return;
    
    const fetchLordLibrary = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
        const response = await fetch(
          `${backendUrl}/api/lords?event_type=${eventType}`,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch lord library');
        }
        
        const data = await response.json();
        setLordLibrary(data.lords || []);
        
        // Set default lord if none selected
        if (!selectedLordId && data.lords.length > 0) {
          const defaultLord = data.lords.find(lord => lord.is_default) || data.lords[0];
          setSelectedLordId(defaultLord.lord_id);
        }
      } catch (err) {
        console.error('Error fetching lord library:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLordLibrary();
  }, [eventType, isLordAllowed]);
  
  // Handle save settings
  const handleSaveSettings = async () => {
    if (!eventId || !adminToken) {
      alert('Missing event ID or admin token');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(
        `${backendUrl}/api/admin/events/${eventId}/lord-settings`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({
            lord_enabled: lordEnabled,
            lord_id: lordEnabled ? selectedLordId : null,
            lord_display_mode: displayMode,
            lord_visibility_duration: visibilityDuration
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update lord settings');
      }
      
      const data = await response.json();
      
      // Notify parent component
      if (onUpdate) {
        onUpdate({
          lord_enabled: lordEnabled,
          lord_id: data.lord_id,
          lord_display_mode: displayMode,
          lord_visibility_duration: visibilityDuration
        });
      }
      
      alert('Lord settings updated successfully!');
    } catch (err) {
      console.error('Error saving lord settings:', err);
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  // If lord not allowed for this event type
  if (!isLordAllowed) {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">
          Lord images are not available for {eventType} events
        </p>
      </div>
    );
  }
  
  // Get selected lord details
  const selectedLord = lordLibrary.find(lord => lord.lord_id === selectedLordId);
  
  return (
    <div className="lord-settings-selector space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Lord Image Settings</h3>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={lordEnabled}
            onChange={(e) => setLordEnabled(e.target.checked)}
            className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
          />
          <span className="text-sm font-medium text-gray-700">Enable Lord Image</span>
        </label>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Loading lord library...</p>
        </div>
      ) : (
        <>
          {/* Lord Selection */}
          {lordEnabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Lord/Deity
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {lordLibrary.map((lord) => (
                    <div
                      key={lord.lord_id}
                      onClick={() => setSelectedLordId(lord.lord_id)}
                      className={`
                        cursor-pointer border-2 rounded-lg p-3 transition-all
                        ${selectedLordId === lord.lord_id 
                          ? 'border-orange-600 bg-orange-50 shadow-md' 
                          : 'border-gray-300 hover:border-orange-400 bg-white'
                        }
                      `}
                    >
                      <div className="aspect-square mb-2 overflow-hidden rounded">
                        <img
                          src={lord.thumbnail}
                          alt={lord.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-semibold text-gray-800 mb-1">
                          {lord.name}
                        </div>
                        {lord.is_default && (
                          <div className="text-xs text-orange-600 font-medium">Default</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Display Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setDisplayMode('hero_only')}
                    className={`
                      cursor-pointer border-2 rounded-lg p-4 transition-all
                      ${displayMode === 'hero_only'
                        ? 'border-orange-600 bg-orange-50'
                        : 'border-gray-300 hover:border-orange-400 bg-white'
                      }
                    `}
                  >
                    <div className="font-semibold text-sm mb-1">Hero Only</div>
                    <div className="text-xs text-gray-600">
                      Show lord in hero section only (top of page)
                    </div>
                  </div>
                  
                  <div
                    onClick={() => setDisplayMode('section_based')}
                    className={`
                      cursor-pointer border-2 rounded-lg p-4 transition-all
                      ${displayMode === 'section_based'
                        ? 'border-orange-600 bg-orange-50'
                        : 'border-gray-300 hover:border-orange-400 bg-white'
                      }
                    `}
                  >
                    <div className="font-semibold text-sm mb-1">Section Based</div>
                    <div className="text-xs text-gray-600">
                      Show in hero + event details sections
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Visibility Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visibility Duration: {visibilityDuration} seconds
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={visibilityDuration}
                  onChange={(e) => setVisibilityDuration(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1s</span>
                  <span>10s</span>
                </div>
              </div>
              
              {/* Preview */}
              {selectedLord && (
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
                  <div className="text-sm font-medium text-gray-700 mb-2 text-center">
                    Preview: {selectedLord.name}
                  </div>
                  <div className="max-w-xs mx-auto">
                    <img
                      src={selectedLord.thumbnail}
                      alt={selectedLord.name}
                      className="w-full rounded-lg shadow-md"
                    />
                  </div>
                  <div className="text-xs text-gray-600 text-center mt-2">
                    {selectedLord.description}
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className={`
                w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors
                ${saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700'
                }
              `}
            >
              {saving ? 'Saving...' : 'Save Lord Settings'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default LordSettingsSelector;
