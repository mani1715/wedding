import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, RotateCcw, Clock, User, AlertTriangle } from 'lucide-react';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/**
 * PHASE 29E: Version history panel
 * 
 * Shows last 5 versions of profile
 * One-click restore to previous version
 * Displays version metadata (timestamp, type, admin)
 */
export function VersionHistoryPanel({ profileId, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);

  useEffect(() => {
    if (profileId) {
      fetchVersions();
    }
  }, [profileId]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API}/admin/profiles/${profileId}/versions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setVersions(response.data.versions || []);
    } catch (error) {
      console.error('Failed to fetch versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedVersion) return;

    try {
      setRestoring(selectedVersion.id);
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/admin/profiles/${profileId}/restore`,
        { version_id: selectedVersion.id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Success - notify parent and refresh
      if (onRestore) {
        onRestore();
      }
      await fetchVersions();
      setShowRestoreConfirm(false);
      setSelectedVersion(null);
      
      // Show success message
      alert('Version restored successfully!');
    } catch (error) {
      console.error('Failed to restore version:', error);
      alert(error.response?.data?.detail || 'Failed to restore version. Please try again.');
    } finally {
      setRestoring(null);
    }
  };

  const getVersionTypeLabel = (type) => {
    const labels = {
      manual_save: 'Manual Save',
      publish: 'Published',
      auto_save: 'Auto-saved',
    };
    return labels[type] || type;
  };

  const getVersionTypeBadge = (type) => {
    const variants = {
      manual_save: 'default',
      publish: 'success',
      auto_save: 'secondary',
    };
    return variants[type] || 'default';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Loading versions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Version History
          </CardTitle>
          <CardDescription>
            Last 5 saved versions. Restore any previous version with one click.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {versions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No version history available yet</p>
              <p className="text-xs text-gray-400 mt-1">Versions are created on save and publish</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getVersionTypeBadge(version.version_type)}>
                        {getVersionTypeLabel(version.version_type)}
                      </Badge>
                      {index === 0 && (
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          Current
                        </Badge>
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        Version {version.version_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(version.created_at).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Admin
                      </div>
                    </div>
                  </div>
                  {index !== 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedVersion(version);
                        setShowRestoreConfirm(true);
                      }}
                      disabled={restoring === version.id}
                      className="ml-4"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {restoring === version.id ? 'Restoring...' : 'Restore'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restore Confirmation Modal */}
      <DeleteConfirmModal
        open={showRestoreConfirm}
        onOpenChange={setShowRestoreConfirm}
        onConfirm={handleRestore}
        title="Restore Version"
        description="Are you sure you want to restore this version? Your current changes will be replaced with this saved version."
        itemName={selectedVersion ? `Version ${selectedVersion.version_number} - ${getVersionTypeLabel(selectedVersion.version_type)} from ${new Date(selectedVersion.created_at).toLocaleString()}` : null}
        confirmText="Restore Version"
        cancelText="Cancel"
      />
    </>
  );
}
