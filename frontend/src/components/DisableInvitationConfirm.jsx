import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

/**
 * PHASE 32: Disable invitation confirmation modal
 * 
 * Warns admin before disabling published invitation
 * Explains impact: guests cannot access invitation
 * Requires explicit confirmation
 */
export function DisableInvitationConfirm({
  open,
  onOpenChange,
  onConfirm,
  invitationName = null,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <AlertDialogTitle className="text-lg">Disable Invitation?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-4">
            {invitationName && (
              <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-sm font-medium text-gray-900">Invitation:</p>
                <p className="text-sm text-gray-700 mt-1">{invitationName}</p>
              </div>
            )}
            <p className="text-gray-700 mb-3">
              Disabling this invitation will make it inaccessible to all guests. The invitation link will no longer work.
            </p>
            <div className="mt-3 flex items-start gap-2 p-3 bg-orange-50 rounded-md border border-orange-200">
              <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-800">
                <p className="font-medium">What happens:</p>
                <ul className="mt-1 ml-4 list-disc space-y-1">
                  <li>Guests cannot view the invitation</li>
                  <li>Existing RSVPs are preserved</li>
                  <li>You can re-enable it later</li>
                </ul>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
          >
            Disable Invitation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
