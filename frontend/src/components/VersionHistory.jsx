import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { History, RotateCcw, Clock, Save, Upload, AlertCircle } from 'lucide-react';
import axios from 'axios';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

/**
 * PHASE 29E: Version History Component
 * 
 * Displays profile version history with rollback capability.
 * Shows last 5 versions with timestamps and restore buttons.
 * 
 * @param {string} profileId - Profile ID
 * @param {function} onRestore - Callback when version is restored
 */
const VersionHistory = ({ profileId, onRestore }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState('');
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);

  // Fetch version history
  useEffect(() => {
    if (!profileId) return;

    const fetchVersions = async () => {
      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get(
          `${API_URL}/api/admin/profiles/${profileId}/versions`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setVersions(response.data.versions || []);
      } catch (err) {
        console.error('Error fetching versions:', err);
        setError('Failed to load version history');
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [profileId]);

  // Handle restore version
  const handleRestoreClick = (version) => {
    setSelectedVersion(version);
    setShowRestoreConfirm(true);
  };

  const handleRestoreConfirm = async () => {
    if (!selectedVersion) return;

    setRestoring(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        `${API_URL}/api/admin/profiles/${profileId}/restore`,
        { version_id: selectedVersion.id },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setShowRestoreConfirm(false);
      setSelectedVersion(null);

      // Notify parent component
      if (onRestore) {
        onRestore();
      }

      // Show success message
      alert('Profile restored successfully! The page will reload.');
      window.location.reload();
    } catch (err) {
      console.error('Error restoring version:', err);
      setError(err.response?.data?.detail || 'Failed to restore version');
    } finally {
      setRestoring(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get version type icon
  const getVersionIcon = (type) => {
    switch (type) {
      case 'publish':
        return <Upload className="w-4 h-4" />;
      case 'manual_save':
        return <Save className="w-4 h-4" />;
      case 'auto_save':
        return <Clock className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  // Get version type label
  const getVersionLabel = (type) => {
    switch (type) {
      case 'publish':
        return 'Published';
      case 'manual_save':
        return 'Manual Save';
      case 'auto_save':
        return 'Auto-saved';
      default:
        return 'Saved';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-gray-600">
          <History className="w-5 h-5 animate-spin" />
          <span>Loading version history...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </Card>
    );
  }

  if (versions.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No version history available yet</p>
          <p className="text-xs mt-1">Versions are saved automatically when you publish</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold">Version History</h3>
          <span className="ml-auto text-sm text-gray-500">
            Last {versions.length} version{versions.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-3">
          {versions.map((version, index) => (
            <div
              key={version.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
            >
              <div className={`p-2 rounded-full ${
                index === 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {getVersionIcon(version.version_type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    Version {version.version_number}
                  </span>
                  {index === 0 && (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                      Current
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span>{getVersionLabel(version.version_type)}</span>
                  <span>•</span>
                  <span>{formatDate(version.created_at)}</span>
                </div>
              </div>

              {index !== 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestoreClick(version)}
                  className="flex-shrink-0"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Restore
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Auto-backup:</strong> Versions are saved automatically when you publish or make major updates. Up to 5 versions are kept.
            </div>
          </div>
        </div>
      </Card>

      <DeleteConfirmationModal
        open={showRestoreConfirm}
        onOpenChange={setShowRestoreConfirm}
        onConfirm={handleRestoreConfirm}
        title="Restore Version?"
        description="This will replace your current invitation with the selected version. Your current state will be saved as a backup before restoring."
        itemName={selectedVersion ? `Version ${selectedVersion.version_number}` : ''}
        confirmText={restoring ? 'Restoring...' : 'Restore Version'}
        isDangerous={false}
      />
    </>
  );
};

export default VersionHistory;
