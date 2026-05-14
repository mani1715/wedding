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
import { Clock, AlertTriangle } from 'lucide-react';

/**
 * PHASE 32: Expire invitation confirmation modal
 * 
 * Warns admin before expiring invitation
 * Explains invitation becomes inaccessible after event date
 * Requires explicit confirmation
 */
export function ExpireInvitationConfirm({
  open,
  onOpenChange,
  onConfirm,
  invitationName = null,
  eventDate = null,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <AlertDialogTitle className="text-lg">Expire Invitation?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-4">
            {invitationName && (
              <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-sm font-medium text-gray-900">Invitation:</p>
                <p className="text-sm text-gray-700 mt-1">{invitationName}</p>
                {eventDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Event Date: {new Date(eventDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
            <p className="text-gray-700 mb-3">
              Expiring this invitation will mark it as past and prevent further guest access. This is typically done after the event is over.
            </p>
            <div className="mt-3 flex items-start gap-2 p-3 bg-purple-50 rounded-md border border-purple-200">
              <AlertTriangle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-purple-800">
                <p className="font-medium">What happens:</p>
                <ul className="mt-1 ml-4 list-disc space-y-1">
                  <li>Invitation becomes inactive</li>
                  <li>Guests cannot RSVP anymore</li>
                  <li>All data is preserved for records</li>
                  <li>You can unexpire if needed</li>
                </ul>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-600"
          >
            Expire Invitation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
