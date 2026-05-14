import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * PHASE 29E: Preview before publish modal
 * 
 * Forces admin to review invitation before publishing
 * Requires explicit confirmation checkbox
 * Shows preview of public invitation
 */
export function PreviewPublishModal({
  open,
  onOpenChange,
  onConfirm,
  profileData,
  previewUrl,
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!confirmed) return;
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
      setConfirmed(false);
    }
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      setConfirmed(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-lg">Preview Before Publishing</DialogTitle>
              <DialogDescription className="mt-1">
                Review your invitation before making it live
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Preview Section */}
        <div className="flex-1 overflow-auto border rounded-lg bg-gray-50">
          {previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full h-[500px] border-0"
              title="Invitation Preview"
              sandbox="allow-same-origin allow-scripts"
            />
          ) : (
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Preview Summary</h4>
                  <div className="mt-2 space-y-2 text-sm text-gray-700">
                    <p><strong>Couple:</strong> {profileData?.groom_name} & {profileData?.bride_name}</p>
                    <p><strong>Event Date:</strong> {profileData?.event_date ? new Date(profileData.event_date).toLocaleDateString() : 'Not set'}</p>
                    <p><strong>Venue:</strong> {profileData?.venue || 'Not set'}</p>
                    <p><strong>Events:</strong> {profileData?.events?.filter(e => e.visible).length || 0} visible events</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Checklist */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              Please review all details carefully. Once published, guests will be able to view this invitation.
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 bg-white rounded-lg border">
            <Checkbox
              id="confirm-review"
              checked={confirmed}
              onCheckedChange={setConfirmed}
              className="mt-1"
            />
            <label
              htmlFor="confirm-review"
              className="text-sm font-medium leading-relaxed cursor-pointer select-none"
            >
              I have reviewed this invitation and confirm all details are correct
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Go Back & Edit
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!confirmed || isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Publishing...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirm & Publish
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
