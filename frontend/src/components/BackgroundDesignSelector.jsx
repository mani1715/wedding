import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getDesignsByEventType, getDefaultDesignForEvent, applyBackgroundDesign } from '../config/designSystem';

/**
 * PHASE 22: Background Design Selector Component
 * 
 * Allows admins to select premium background designs for each event
 * - Shows 8 design options filtered by event type
 * - Preview thumbnails with hover effects
 * - Auto-applies default if none selected
 * - Validates lord decoration compatibility
 */
const BackgroundDesignSelector = ({ 
  event, 
  onDesignUpdate,
  isEditMode = false 
}) => {
  const [designs, setDesigns] = useState([]);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [previewDesign, setPreviewDesign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customColors, setCustomColors] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  // Load designs filtered by event type
  useEffect(() => {
    if (event && event.event_type) {
      const filteredDesigns = getDesignsByEventType(event.event_type);
      setDesigns(filteredDesigns);

      // Set initial selected design or default
      if (event.background_design_id) {
        const currentDesign = filteredDesigns.find(d => d.design_id === event.background_design_id);
        setSelectedDesign(currentDesign);
        if (event.color_palette) {
          setCustomColors(event.color_palette);
        }
      } else if (isEditMode) {
        // Auto-apply default design for existing events without design
        const defaultDesign = getDefaultDesignForEvent(event.event_type);
        if (defaultDesign) {
          setSelectedDesign(defaultDesign);
          setCustomColors(defaultDesign.default_colors);
        }
      }
    }
  }, [event, isEditMode]);

  // Apply design selection
  const handleApplyDesign = async (design) => {
    if (!isEditMode || !event.event_id) {
      // For new events, just update locally
      setSelectedDesign(design);
      setCustomColors(design.default_colors);
      if (onDesignUpdate) {
        onDesignUpdate({
          background_design_id: design.design_id,
          background_type: design.background_type,
          color_palette: design.default_colors
        });
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      const colors = customColors || design.default_colors;

      const response = await axios.put(
        `${backendUrl}/api/admin/events/${event.event_id}/background`,
        {
          background_design_id: design.design_id,
          background_type: design.background_type,
          color_palette: colors
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setSelectedDesign(design);
        if (onDesignUpdate) {
          onDesignUpdate({
            background_design_id: design.design_id,
            background_type: design.background_type,
            color_palette: colors
          });
        }
        alert('Background design updated successfully!');
      }
    } catch (err) {
      console.error('Error updating background design:', err);
      setError(err.response?.data?.detail || 'Failed to update background design');
      alert('Failed to update background design: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Update color palette
  const handleColorUpdate = (colorKey, value) => {
    setCustomColors(prev => ({
      ...(prev || selectedDesign?.default_colors || {}),
      [colorKey]: value
    }));
  };

  // Apply custom colors
  const handleApplyColors = async () => {
    if (!selectedDesign) return;
    
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');

      const response = await axios.put(
        `${backendUrl}/api/admin/events/${event.event_id}/background`,
        {
          background_design_id: selectedDesign.design_id,
          background_type: selectedDesign.background_type,
          color_palette: customColors
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        if (onDesignUpdate) {
          onDesignUpdate({
            background_design_id: selectedDesign.design_id,
            background_type: selectedDesign.background_type,
            color_palette: customColors
          });
        }
        alert('Color palette updated successfully!');
      }
    } catch (err) {
      console.error('Error updating colors:', err);
      setError(err.response?.data?.detail || 'Failed to update colors');
      alert('Failed to update colors: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!event) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Background Design
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Current Selection */}
      {selectedDesign && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Design</p>
              <p className="font-semibold text-gray-900">{selectedDesign.name}</p>
              <p className="text-xs text-gray-500 mt-1">{selectedDesign.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              {selectedDesign.supports_lord && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                  Lord Supported
                </span>
              )}
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                {selectedDesign.background_type.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Color Palette Display */}
          {(customColors || selectedDesign.default_colors) && (
            <div className="mt-3 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600">Colors:</span>
                {Object.entries(customColors || selectedDesign.default_colors).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-1">
                    <div 
                      className="w-6 h-6 rounded border-2 border-white shadow-sm"
                      style={{ backgroundColor: value }}
                    />
                    <span className="text-xs text-gray-500 capitalize">{key}</span>
                  </div>
                ))}
              </div>
              {isEditMode && (
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  {showColorPicker ? 'Hide' : 'Customize'} Colors
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Color Picker */}
      {showColorPicker && isEditMode && selectedDesign && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Customize Colors</h4>
          <div className="grid grid-cols-3 gap-4">
            {['primary', 'secondary', 'accent'].map(colorKey => (
              <div key={colorKey}>
                <label className="block text-xs font-medium text-gray-700 mb-1 capitalize">
                  {colorKey}
                </label>
                <input
                  type="color"
                  value={customColors?.[colorKey] || selectedDesign.default_colors[colorKey]}
                  onChange={(e) => handleColorUpdate(colorKey, e.target.value)}
                  className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleApplyColors}
            disabled={loading}
            className="mt-3 w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 text-sm font-medium"
          >
            {loading ? 'Applying...' : 'Apply Custom Colors'}
          </button>
        </div>
      )}

      {/* Design Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {designs.map(design => (
          <div
            key={design.design_id}
            className={`relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all duration-200 ${
              selectedDesign?.design_id === design.design_id
                ? 'border-purple-500 shadow-lg ring-2 ring-purple-200'
                : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
            }`}
            onMouseEnter={() => setPreviewDesign(design)}
            onMouseLeave={() => setPreviewDesign(null)}
            onClick={() => handleApplyDesign(design)}
          >
            {/* Design Preview */}
            <div 
              className="h-32 w-full relative"
              style={applyBackgroundDesign(design)}
            >
              {/* Fallback color display if no image */}
              {design.background_type === 'css' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black bg-opacity-30 px-2 py-1 rounded">
                    {design.background_type.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Design Info */}
            <div className="p-2 bg-white">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {design.name}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">
                  {design.background_type}
                </span>
                {design.supports_lord && (
                  <span className="text-xs text-yellow-600">★</span>
                )}
              </div>
            </div>

            {/* Selected Indicator */}
            {selectedDesign?.design_id === design.design_id && (
              <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Preview Panel */}
      {previewDesign && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            {previewDesign.name}
          </h4>
          <p className="text-xs text-gray-600 mb-2">{previewDesign.description}</p>
          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
              {previewDesign.background_type}
            </span>
            {previewDesign.supports_lord && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                Lord Compatible
              </span>
            )}
            {previewDesign.is_default && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                Default
              </span>
            )}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
        <p className="font-medium mb-1">💡 Design Tips:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Click on any design to apply it instantly</li>
          <li>Designs are filtered based on event type compatibility</li>
          <li>★ indicates designs that support lord decorations</li>
          <li>Customize colors after selecting a design</li>
        </ul>
      </div>
    </div>
  );
};

export default BackgroundDesignSelector;
