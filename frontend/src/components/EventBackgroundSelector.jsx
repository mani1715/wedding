/**
 * PHASE 22 – Event Background Selector Component
 * Admin interface to select premium background designs for each event
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const EventBackgroundSelector = ({ 
  eventId, 
  eventType, 
  currentDesignId,
  currentBackgroundType,
  currentColorPalette,
  onSave 
}) => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(!!currentDesignId);

  // Fetch designs for this event type
  useEffect(() => {
    fetchDesigns();
  }, [eventType]);

  // Set initial selection
  useEffect(() => {
    if (currentDesignId && designs.length > 0) {
      const design = designs.find(d => d.design_id === currentDesignId);
      setSelectedDesign(design);
    } else if (designs.length > 0 && !currentDesignId) {
      // Auto-select default design
      const defaultDesign = designs.find(d => d.is_default) || designs[0];
      setSelectedDesign(defaultDesign);
    }
  }, [currentDesignId, designs]);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/designs`, {
        params: { event_type: eventType }
      });
      setDesigns(response.data.designs || []);
    } catch (error) {
      console.error('Failed to fetch designs:', error);
      alert('Failed to load background designs');
    } finally {
      setLoading(false);
    }
  };

  const handleDesignSelect = (design) => {
    setSelectedDesign(design);
  };

  const handleSave = async () => {
    if (!selectedDesign) {
      alert('Please select a background design');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      
      const payload = {
        background_design_id: selectedDesign.design_id,
        background_type: selectedDesign.background_type,
        color_palette: selectedDesign.default_colors
      };

      await axios.put(
        `${BACKEND_URL}/api/admin/events/${eventId}/background`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Background design saved successfully!');
      onSave && onSave(payload);
    } catch (error) {
      console.error('Failed to save background design:', error);
      alert(error.response?.data?.detail || 'Failed to save background design');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (checked) => {
    setEnabled(checked);
    if (!checked) {
      setSelectedDesign(null);
    } else if (designs.length > 0) {
      const defaultDesign = designs.find(d => d.is_default) || designs[0];
      setSelectedDesign(defaultDesign);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        <p className="mt-2 text-sm text-gray-600">Loading background designs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-white">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Background Design
          </h3>
          <p className="text-sm text-gray-500">
            Select a premium background for this event
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor={`bg-toggle-${eventId}`} className="text-sm">
            {enabled ? 'Enabled' : 'Disabled'}
          </Label>
          <Switch
            id={`bg-toggle-${eventId}`}
            checked={enabled}
            onCheckedChange={handleToggle}
          />
        </div>
      </div>

      {enabled && (
        <>
          {/* Design Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {designs.map((design) => (
              <Card
                key={design.design_id}
                onClick={() => handleDesignSelect(design)}
                className={`
                  cursor-pointer transition-all hover:shadow-lg
                  ${selectedDesign?.design_id === design.design_id
                    ? 'ring-2 ring-pink-500 shadow-md'
                    : 'hover:ring-2 hover:ring-pink-300'
                  }
                `}
              >
                <div className="p-3 space-y-2">
                  {/* Design Preview */}
                  <div
                    className="w-full h-24 rounded-md overflow-hidden relative"
                    style={{
                      background: design.gradient || 
                        `linear-gradient(135deg, ${design.default_colors.primary}, ${design.default_colors.secondary})`,
                    }}
                  >
                    {/* Pattern Overlay for Hybrid */}
                    {design.background_type === 'hybrid' && (
                      <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: design.pattern === 'temple-motif' 
                            ? 'repeating-linear-gradient(90deg, #ffffff 0px, transparent 2px, transparent 15px)'
                            : design.pattern === 'mehendi-floral'
                            ? 'radial-gradient(circle, #ffffff 10%, transparent 20%)'
                            : design.pattern === 'divine-pattern'
                            ? 'repeating-linear-gradient(45deg, #ffffff 0px, transparent 5px, transparent 15px)'
                            : 'none',
                          backgroundSize: '40px 40px'
                        }}
                      />
                    )}
                    
                    {/* Type Badge */}
                    <div className="absolute top-1 right-1">
                      <span className="text-xs bg-white/80 px-2 py-0.5 rounded-full font-medium">
                        {design.background_type}
                      </span>
                    </div>

                    {/* Lord Support Badge */}
                    {design.supports_lord && (
                      <div className="absolute bottom-1 left-1">
                        <span className="text-xs bg-yellow-500/80 text-white px-2 py-0.5 rounded-full font-medium">
                          🕉️ Divine
                        </span>
                      </div>
                    )}

                    {/* Default Badge */}
                    {design.is_default && (
                      <div className="absolute top-1 left-1">
                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">
                          Default
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Design Name */}
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {design.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {design.description}
                    </p>
                  </div>

                  {/* Color Palette Preview */}
                  <div className="flex gap-1 justify-center">
                    <div
                      className="w-6 h-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: design.default_colors.primary }}
                      title="Primary"
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: design.default_colors.secondary }}
                      title="Secondary"
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: design.default_colors.accent }}
                      title="Accent"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Selected Design Info */}
          {selectedDesign && (
            <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{selectedDesign.name}</p>
                  <p className="text-sm text-gray-600">{selectedDesign.description}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-600">
                    <span>Type: <span className="font-medium">{selectedDesign.background_type}</span></span>
                    <span>•</span>
                    <span>Lord Support: <span className="font-medium">{selectedDesign.supports_lord ? 'Yes' : 'No'}</span></span>
                  </div>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  size="sm"
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  {saving ? 'Saving...' : 'Apply Design'}
                </Button>
              </div>
            </div>
          )}

          {/* No Designs Available */}
          {designs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No background designs available for this event type.</p>
            </div>
          )}
        </>
      )}

      {!enabled && (
        <div className="text-center py-8 text-gray-400">
          <p>Background design is disabled for this event</p>
        </div>
      )}
    </div>
  );
};

export default EventBackgroundSelector;
