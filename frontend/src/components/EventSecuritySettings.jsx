import React, { useState } from 'react';
import axios from 'axios';
import { Shield, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

/**
 * PHASE 32: Event Security Settings Component
 * 
 * Manage visibility and passcode for event invitations
 * Features:
 * - Visibility mode selector (public/unlisted/private)
 * - Passcode input (4-6 digits for private events)
 * - Visual indicators for security level
 * - Validation and error handling
 */
const EventSecuritySettings = ({ invitation, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [visibilityMode, setVisibilityMode] = useState(invitation.visibility_mode || 'public');
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setVisibilityMode(invitation.visibility_mode || 'public');
    setPasscode('');
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setError('');
    setSuccess(false);
  };

  const handleSave = async () => {
    setError('');
    setSuccess(false);

    // Validate passcode if private mode
    if (visibilityMode === 'private') {
      if (!passcode || passcode.trim() === '') {
        setError('Passcode is required for private events');
        return;
      }

      if (!/^\d{4,6}$/.test(passcode)) {
        setError('Passcode must be 4-6 digits numeric only');
        return;
      }
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('visibility_mode', visibilityMode);
      if (visibilityMode === 'private' && passcode) {
        formData.append('passcode', passcode);
      } else {
        formData.append('passcode', '');
      }

      await axios.put(
        `${API_URL}/api/admin/event-invitations/${invitation.id}/security`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess(true);
      
      // Notify parent component
      if (onUpdate) {
        onUpdate();
      }

      // Close after short delay to show success message
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (err) {
      console.error('Failed to update security settings:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to update security settings';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const getSecurityLabel = (mode) => {
    switch (mode) {
      case 'public':
        return { text: 'Public', color: 'text-green-600', icon: Eye };
      case 'unlisted':
        return { text: 'Unlisted', color: 'text-yellow-600', icon: EyeOff };
      case 'private':
        return { text: 'Private', color: 'text-red-600', icon: Lock };
      default:
        return { text: 'Public', color: 'text-green-600', icon: Eye };
    }
  };

  const currentSecurity = getSecurityLabel(invitation.visibility_mode || 'public');
  const CurrentIcon = currentSecurity.icon;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="flex items-center gap-2"
      >
        <Shield className="w-4 h-4" />
        Security
        <span className={`text-xs ${currentSecurity.color}`}>
          ({currentSecurity.text})
        </span>
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">Security Settings</DialogTitle>
                <DialogDescription className="text-sm">
                  {invitation.event_type.charAt(0).toUpperCase() + invitation.event_type.slice(1)} Event
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Visibility Mode Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Visibility Mode
              </label>
              <div className="space-y-2">
                {/* Public Option */}
                <div
                  onClick={() => setVisibilityMode('public')}
                  className={`cursor-pointer border-2 rounded-lg p-3 transition-all ${
                    visibilityMode === 'public'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Public</div>
                      <div className="text-sm text-gray-600">
                        Anyone with the link can access. Indexed by search engines.
                      </div>
                    </div>
                    {visibilityMode === 'public' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </div>

                {/* Unlisted Option */}
                <div
                  onClick={() => setVisibilityMode('unlisted')}
                  className={`cursor-pointer border-2 rounded-lg p-3 transition-all ${
                    visibilityMode === 'unlisted'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <EyeOff className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Unlisted</div>
                      <div className="text-sm text-gray-600">
                        Only people with the link can access. Not indexed by search engines.
                      </div>
                    </div>
                    {visibilityMode === 'unlisted' && (
                      <CheckCircle className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                </div>

                {/* Private Option */}
                <div
                  onClick={() => setVisibilityMode('private')}
                  className={`cursor-pointer border-2 rounded-lg p-3 transition-all ${
                    visibilityMode === 'private'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Private</div>
                      <div className="text-sm text-gray-600">
                        Requires passcode to access. Maximum security.
                      </div>
                    </div>
                    {visibilityMode === 'private' && (
                      <CheckCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Passcode Input (only for private mode) */}
            {visibilityMode === 'private' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set Passcode *
                </label>
                <Input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={passcode}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numeric input
                    if (/^\d{0,6}$/.test(value)) {
                      setPasscode(value);
                      setError('');
                    }
                  }}
                  placeholder="Enter 4-6 digit passcode"
                  className="text-center text-xl tracking-widest font-mono"
                />
                <p className="text-xs text-gray-500 mt-2">
                  4-6 digit numeric passcode. Guests will need this to access the event.
                </p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">Settings Updated!</p>
                  <p className="text-xs text-green-700 mt-1">
                    Security settings have been saved successfully.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isLoading || success}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventSecuritySettings;
