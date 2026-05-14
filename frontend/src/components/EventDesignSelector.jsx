/**
 * PHASE 15 – Event Design Selector Component
 * Admin interface to select design and color variant for events
 */

import React, { useState } from 'react';
import {
  getAllDesigns,
  getAllowedColors,
  getColorPalette,
  DESIGN_TYPES,
} from '../config/eventDesignSystem';

const EventDesignSelector = ({ selectedDesign, selectedColor, onDesignChange, onColorChange }) => {
  const [previewDesign, setPreviewDesign] = useState(selectedDesign);
  const [previewColor, setPreviewColor] = useState(selectedColor);

  const designs = getAllDesigns();

  // Handle design selection
  const handleDesignSelect = (designId) => {
    setPreviewDesign(designId);
    onDesignChange(designId);

    // Reset color to default for this design
    const design = designs.find(d => d.id === designId);
    if (design && !design.allowedColors.includes(previewColor)) {
      setPreviewColor(design.defaultColor);
      onColorChange(design.defaultColor);
    }
  };

  // Handle color selection
  const handleColorSelect = (colorName) => {
    setPreviewColor(colorName);
    onColorChange(colorName);
  };

  // Get allowed colors for current design
  const allowedColors = previewDesign ? getAllowedColors(previewDesign) : [];

  return (
    <div className="event-design-selector space-y-6">
      {/* Design Selection Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          Select Background Design
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {designs.map((design) => (
            <div
              key={design.id}
              onClick={() => handleDesignSelect(design.id)}
              className={`
                cursor-pointer rounded-lg border-2 p-4 transition-all
                hover:shadow-lg
                ${
                  previewDesign === design.id
                    ? 'border-pink-500 bg-pink-50 shadow-md'
                    : 'border-gray-300 bg-white hover:border-pink-300'
                }
              `}
            >
              {/* Design Preview */}
              <div
                className="w-full h-24 rounded-md mb-2 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${
                    getColorPalette(design.defaultColor).light
                  }, ${getColorPalette(design.defaultColor).primary})`,
                }}
              >
                {/* Pattern indicator */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: design.pattern === 'temple'
                      ? 'repeating-linear-gradient(90deg, #00000020 0px, transparent 2px, transparent 15px)'
                      : design.pattern === 'floral'
                      ? 'radial-gradient(circle, #00000020 10%, transparent 20%)'
                      : design.pattern === 'marigold'
                      ? 'repeating-linear-gradient(45deg, #00000015 0px, transparent 5px, transparent 15px)'
                      : 'none',
                  }}
                />
                
                {/* Center indicator for lord-clear area */}
                {design.features.centerClear && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-12 h-12 rounded-full border-2 border-white border-dashed opacity-50" />
                  </div>
                )}
              </div>

              {/* Design Name */}
              <p className="text-sm font-medium text-gray-800 text-center mb-1">
                {design.name}
              </p>

              {/* Design Description */}
              <p className="text-xs text-gray-500 text-center line-clamp-2">
                {design.description}
              </p>

              {/* Selected Indicator */}
              {previewDesign === design.id && (
                <div className="mt-2 flex justify-center">
                  <span className="text-xs bg-pink-500 text-white px-3 py-1 rounded-full">
                    Selected
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Color Variant Selection Section */}
      {previewDesign && allowedColors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Select Color Variant
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {allowedColors.map(({ name, palette }) => (
              <div
                key={name}
                onClick={() => handleColorSelect(name)}
                className={`
                  cursor-pointer rounded-lg border-2 p-3 transition-all
                  hover:shadow-md
                  ${
                    previewColor === name
                      ? 'border-pink-500 shadow-md'
                      : 'border-gray-300 hover:border-pink-300'
                  }
                `}
              >
                {/* Color Preview */}
                <div className="flex flex-col gap-1 mb-2">
                  <div
                    className="w-full h-8 rounded"
                    style={{ backgroundColor: palette.primary }}
                  />
                  <div className="flex gap-1">
                    <div
                      className="flex-1 h-4 rounded"
                      style={{ backgroundColor: palette.secondary }}
                    />
                    <div
                      className="flex-1 h-4 rounded"
                      style={{ backgroundColor: palette.accent }}
                    />
                  </div>
                </div>

                {/* Color Name */}
                <p className="text-xs font-medium text-gray-700 text-center capitalize">
                  {name.replace(/([A-Z])/g, ' $1').trim()}
                </p>

                {/* Selected Indicator */}
                {previewColor === name && (
                  <div className="mt-1 flex justify-center">
                    <div className="w-2 h-2 bg-pink-500 rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Section */}
      {previewDesign && previewColor && (
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2 text-gray-700">
            Live Preview
          </h3>
          <div
            className="w-full h-32 rounded-lg relative overflow-hidden"
            style={{
              background: `linear-gradient(to bottom, ${
                getColorPalette(previewColor).light
              }, ${getColorPalette(previewColor).primary})`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white bg-opacity-80 px-6 py-3 rounded-lg shadow-lg">
                <p className="text-sm font-medium text-gray-800">
                  {designs.find(d => d.id === previewDesign)?.name}
                </p>
                <p className="text-xs text-gray-600 capitalize">
                  {previewColor.replace(/([A-Z])/g, ' $1').trim()} Theme
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> The lord image (if enabled) will appear in the hero section.
          The background design is optimized to keep the center area clear for better visibility.
        </p>
      </div>
    </div>
  );
};

export default EventDesignSelector;
