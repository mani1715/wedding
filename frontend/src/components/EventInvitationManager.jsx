import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, ExternalLink, Copy, Edit, Trash2, X, Check } from 'lucide-react';
import { getAllThemes } from '@/config/themeSystem';
import { DEITY_OPTIONS } from '@/config/religiousAssets';
// PHASE 29E: Delete Confirmation Modal
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
// PHASE 32: Event Security Settings
import EventSecuritySettings from '@/components/EventSecuritySettings';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const EVENT_TYPES = [
  { value: 'engagement', label: 'Engagement', allowLord: true },
  { value: 'haldi', label: 'Haldi', allowLord: false },
  { value: 'mehendi', label: 'Mehendi', allowLord: false },
  { value: 'marriage', label: 'Marriage', allowLord: true },
  { value: 'reception', label: 'Reception', allowLord: true }
];

const EventInvitationManager = ({ profileId, profileSlug, onClose }) => {
  const [eventInvitations, setEventInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingInvitation, setEditingInvitation] = useState(null);
  const [formData, setFormData] = useState({
    event_type: '',
    design_id: 'royal_red',
    deity_id: null
  });
  
  // PHASE 29E: Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    invitationId: null,
    invitationName: ''
  });

  useEffect(() => {
    fetchEventInvitations();
  }, [profileId]);

  const fetchEventInvitations = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/profiles/${profileId}/event-invitations`);
      setEventInvitations(response.data);
    } catch (error) {
      console.error('Failed to fetch event invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvitation = async () => {
    try {
      await axios.post(`${API_URL}/api/admin/profiles/${profileId}/event-invitations`, formData);
      setShowCreateForm(false);
      setFormData({ event_type: '', design_id: 'royal_red', deity_id: null });
      fetchEventInvitations();
      alert('Event invitation created successfully!');
    } catch (error) {
      console.error('Failed to create event invitation:', error);
      alert(error.response?.data?.detail || 'Failed to create event invitation');
    }
  };

  const handleUpdateInvitation = async (invitationId) => {
    try {
      const updateData = {
        design_id: formData.design_id,
        deity_id: formData.deity_id,
        enabled: formData.enabled
      };
      await axios.put(`${API_URL}/api/admin/event-invitations/${invitationId}`, updateData);
      setEditingInvitation(null);
      setFormData({ event_type: '', design_id: 'royal_red', deity_id: null });
      fetchEventInvitations();
      alert('Event invitation updated successfully!');
    } catch (error) {
      console.error('Failed to update event invitation:', error);
      alert('Failed to update event invitation');
    }
  };

  const handleDeleteInvitation = async (invitation) => {
    // PHASE 29E: Show confirmation modal instead of window.confirm
    setDeleteConfirmation({
      open: true,
      invitationId: invitation.id,
      invitationName: invitation.event_type
    });
  };

  const confirmDeleteInvitation = async () => {
    try {
      await axios.delete(`${API_URL}/api/admin/event-invitations/${deleteConfirmation.invitationId}`);
      fetchEventInvitations();
      alert('Event invitation deleted successfully!');
      setDeleteConfirmation({ open: false, invitationId: null, invitationName: '' });
    } catch (error) {
      console.error('Failed to delete event invitation:', error);
      alert('Failed to delete event invitation');
    }
  };

  const copyLink = (link) => {
    const fullLink = `${window.location.origin}${link}`;
    navigator.clipboard.writeText(fullLink);
    alert('Link copied to clipboard!');
  };

  const startEdit = (invitation) => {
    setEditingInvitation(invitation.id);
    setFormData({
      event_type: invitation.event_type,
      design_id: invitation.design_id,
      deity_id: invitation.deity_id,
      enabled: invitation.enabled
    });
  };

  const cancelEdit = () => {
    setEditingInvitation(null);
    setFormData({ event_type: '', design_id: 'royal_classic', deity_id: null });
  };

  const getAvailableEventTypes = () => {
    const usedEventTypes = eventInvitations.map(ei => ei.event_type);
    return EVENT_TYPES.filter(et => !usedEventTypes.includes(et.value));
  };

  const getEventTypeConfig = (eventType) => {
    return EVENT_TYPES.find(et => et.value === eventType);
  };

  const isDeityAllowed = (eventType) => {
    const config = getEventTypeConfig(eventType);
    return config ? config.allowLord : false;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-6">
          <div className="text-center">Loading...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Manage Event Invitations</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Add Event Invitation Button */}
          {!showCreateForm && getAvailableEventTypes().length > 0 && (
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Event Invitation
            </Button>
          )}

          {/* Create Form */}
          {showCreateForm && (
            <Card className="p-4 border-2 border-blue-200 bg-blue-50">
              <h3 className="text-lg font-semibold mb-4">Create New Event Invitation</h3>
              
              {/* Event Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Event Type</label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value, deity_id: null })}
                  className="w-full border rounded-lg p-2"
                  required
                >
                  <option value="">Select Event Type</option>
                  {getAvailableEventTypes().map(et => (
                    <option key={et.value} value={et.value}>{et.label}</option>
                  ))}
                </select>
              </div>

              {/* Design Theme Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Design Theme</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {getAllThemes().map(theme => (
                    <div
                      key={theme.themeId}
                      onClick={() => setFormData({ ...formData, design_id: theme.themeId })}
                      className={`cursor-pointer border-2 rounded-lg p-3 text-center transition-all ${
                        formData.design_id === theme.themeId 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-sm font-semibold">{theme.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deity Selection (Conditional) */}
              {formData.event_type && isDeityAllowed(formData.event_type) && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Religious Background (Optional)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {DEITY_OPTIONS.map(deity => (
                      <div
                        key={deity.id}
                        onClick={() => setFormData({ ...formData, deity_id: deity.id === 'none' ? null : deity.id })}
                        className={`cursor-pointer border-2 rounded-lg p-3 text-center transition-all ${
                          (deity.id === 'none' && formData.deity_id === null) || formData.deity_id === deity.id
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <img src={deity.thumbnail} alt={deity.name} className="w-16 h-16 object-cover mx-auto rounded mb-2" />
                        <div className="text-xs font-semibold">{deity.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.event_type && !isDeityAllowed(formData.event_type) && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Lord backgrounds are not available for {formData.event_type} events.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateInvitation}
                  disabled={!formData.event_type}
                  className="flex-1"
                >
                  Create Invitation
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ event_type: '', design_id: 'royal_red', deity_id: null });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {/* Event Invitations List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Event Invitations ({eventInvitations.length})</h3>
            
            {eventInvitations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No event invitations created yet. Click "Add Event Invitation" to get started.
              </p>
            ) : (
              eventInvitations.map(invitation => (
                <Card key={invitation.id} className={`p-4 ${!invitation.enabled ? 'opacity-50' : ''}`}>
                  {editingInvitation === invitation.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold capitalize">{invitation.event_type}</h4>
                      </div>

                      {/* Design Theme Selection */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Design Theme</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {getAllThemes().map(theme => (
                            <div
                              key={theme.themeId}
                              onClick={() => setFormData({ ...formData, design_id: theme.themeId })}
                              className={`cursor-pointer border-2 rounded-lg p-3 text-center transition-all ${
                                formData.design_id === theme.themeId 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              <div className="text-sm font-semibold">{theme.name}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Deity Selection (Conditional) */}
                      {isDeityAllowed(invitation.event_type) && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Religious Background (Optional)
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {DEITY_OPTIONS.map(deity => (
                              <div
                                key={deity.id}
                                onClick={() => setFormData({ ...formData, deity_id: deity.id === 'none' ? null : deity.id })}
                                className={`cursor-pointer border-2 rounded-lg p-3 text-center transition-all ${
                                  (deity.id === 'none' && formData.deity_id === null) || formData.deity_id === deity.id
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                <img src={deity.thumbnail} alt={deity.name} className="w-16 h-16 object-cover mx-auto rounded mb-2" />
                                <div className="text-xs font-semibold">{deity.name}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Enable/Disable Toggle */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.enabled}
                          onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <label className="text-sm">Enable this invitation</label>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUpdateInvitation(invitation.id)}
                          className="flex-1"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={cancelEdit}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h4 className="text-lg font-semibold capitalize">{invitation.event_type}</h4>
                          <p className="text-sm text-gray-600">
                            Design: {getAllThemes().find(t => t.themeId === invitation.design_id)?.name || invitation.design_id}
                            {invitation.deity_id && ` | Deity: ${DEITY_OPTIONS.find(d => d.id === invitation.deity_id)?.name || invitation.deity_id}`}
                          </p>
                          <p className={`text-xs mt-1 ${invitation.enabled ? 'text-green-600' : 'text-red-600'}`}>
                            {invitation.enabled ? '✓ Enabled' : '✗ Disabled'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(invitation.invitation_link, '_blank')}
                          className="flex-1"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyLink(invitation.invitation_link)}
                          className="flex-1"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(invitation)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        {/* PHASE 32: Security Settings Button */}
                        <EventSecuritySettings 
                          invitation={invitation} 
                          onUpdate={fetchEventInvitations}
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteInvitation(invitation)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </Card>
      
      {/* PHASE 29E: Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteConfirmation.open}
        onOpenChange={(open) => setDeleteConfirmation({ ...deleteConfirmation, open })}
        onConfirm={confirmDeleteInvitation}
        title="Delete Event Invitation"
        description="Are you sure you want to delete this event invitation? This action cannot be undone and will permanently remove the invitation link."
        itemName={deleteConfirmation.invitationName}
        confirmText="Delete Invitation"
      />
    </div>
  );
};

export default EventInvitationManager;
