import React, { useState, useMemo } from 'react';
import {
  getAllDesigns,
  getDesignsForEvent,
  getDefaultDesignForEvent,
  isLordAllowedForEvent,
  isLordMandatoryForEvent,
  EVENT_TYPES
} from '../config/designRegistry';

/**
 * DesignSelector Component
 * 
 * Admin panel component to select event design
 * - Shows 8 design thumbnails
 * - Auto-suggests designs based on event type
 * - Allows manual override
 * - Enforces lord rules
 */
const DesignSelector = ({ eventType, selectedDesignId, onDesignChange, className = '' }) => {
  const [showAllDesigns, setShowAllDesigns] = useState(false);

  // Get suggested designs for this event type
  const suggestedDesigns = useMemo(() => {
    return getDesignsForEvent(eventType);
  }, [eventType]);

  // Get all designs for manual selection
  const allDesigns = useMemo(() => {
    return getAllDesigns();
  }, []);

  // Determine which designs to display
  const displayedDesigns = showAllDesigns ? allDesigns : suggestedDesigns;

  // Lord rules for this event
  const lordAllowed = isLordAllowedForEvent(eventType);
  const lordMandatory = isLordMandatoryForEvent(eventType);

  // Auto-select default design if none selected
  useMemo(() => {
    if (!selectedDesignId && suggestedDesigns.length > 0) {
      const defaultDesign = getDefaultDesignForEvent(eventType);
      if (defaultDesign && onDesignChange) {
        onDesignChange(defaultDesign.id);
      }
    }
  }, [eventType, selectedDesignId, suggestedDesigns, onDesignChange]);

  const handleDesignSelect = (designId) => {
    if (onDesignChange) {
      onDesignChange(designId);
    }
  };

  return (
    <div className={`design-selector ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Select Event Design
        </h3>
        <p className="text-sm text-gray-600">
          {suggestedDesigns.length > 0
            ? `${suggestedDesigns.length} design${suggestedDesigns.length > 1 ? 's' : ''} recommended for ${eventType}`
            : 'Choose a design for your event'}
        </p>
        
        {/* Lord Rules Info */}
        {lordMandatory && (
          <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700 font-medium">
              ⚠️ Lord image is mandatory for {eventType} events
            </p>
          </div>
        )}
        {lordAllowed && !lordMandatory && (
          <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              ℹ️ Lord image is optional for {eventType} events
            </p>
          </div>
        )}
        {!lordAllowed && (
          <div className="mt-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-700">
              🚫 Lord image is not allowed for {eventType} events
            </p>
          </div>
        )}
      </div>

      {/* Design Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {displayedDesigns.map((design) => (
          <DesignThumbnail
            key={design.id}
            design={design}
            selected={selectedDesignId === design.id}
            onSelect={handleDesignSelect}
            lordAllowed={lordAllowed}
          />
        ))}
      </div>

      {/* Toggle All Designs */}
      {!showAllDesigns && allDesigns.length > suggestedDesigns.length && (
        <button
          onClick={() => setShowAllDesigns(true)}
          className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200"
        >
          Show All {allDesigns.length} Designs
        </button>
      )}
      
      {showAllDesigns && (
        <button
          onClick={() => setShowAllDesigns(false)}
          className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200"
        >
          Show Recommended Only
        </button>
      )}
    </div>
  );
};

/**
 * DesignThumbnail Component
 */
const DesignThumbnail = ({ design, selected, onSelect, lordAllowed }) => {
  const handleClick = () => {
    onSelect(design.id);
  };

  // Check if design is compatible with lord rules
  const isCompatible = lordAllowed ? true : !design.lord_allowed;
  const showWarning = !lordAllowed && design.lord_allowed;

  return (
    <div
      onClick={handleClick}
      className={`
        design-thumbnail relative rounded-lg overflow-hidden cursor-pointer
        transition-all duration-200 transform hover:scale-105
        ${selected ? 'ring-4 ring-purple-500 shadow-xl' : 'ring-2 ring-gray-200 hover:ring-purple-300'}
        ${!isCompatible ? 'opacity-50' : ''}
      `}
      style={{ aspectRatio: '3/4' }}
    >
      {/* Gradient Preview */}
      <div
        className="absolute inset-0"
        style={{
          background: design.background.base
        }}
      />
      
      {/* Overlay Preview */}
      {design.background.overlay && (
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: design.background.overlay
          }}
        />
      )}

      {/* Design Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <p className="text-white text-sm font-semibold truncate">
          {design.name}
        </p>
        <div className="flex items-center gap-1 mt-1">
          {design.decorations.flowers.enabled && (
            <span className="text-xs text-white/80">🌸</span>
          )}
          {design.decorations.gantalu.enabled && (
            <span className="text-xs text-white/80">🔔</span>
          )}
          {design.decorations.dheepalu.enabled && (
            <span className="text-xs text-white/80">🪔</span>
          )}
          {design.lord_allowed && (
            <span className="text-xs text-white/80">🙏</span>
          )}
        </div>
      </div>

      {/* Selected Badge */}
      {selected && (
        <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Warning Badge */}
      {showWarning && (
        <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
          Lord Not Allowed
        </div>
      )}
    </div>
  );
};

export default DesignSelector;
