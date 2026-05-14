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
import { AlertTriangle, Images } from 'lucide-react';

/**
 * PHASE 32: Delete gallery confirmation modal
 * 
 * Warns admin before deleting entire gallery
 * Shows count of items being deleted
 * Emphasizes irreversibility
 * Requires explicit confirmation
 */
export function DeleteGalleryConfirm({
  open,
  onOpenChange,
  onConfirm,
  galleryName = 'Gallery',
  itemCount = 0,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Images className="w-5 h-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-lg">Delete Entire Gallery?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-4">
            <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm font-medium text-gray-900">Gallery:</p>
              <p className="text-sm text-gray-700 mt-1">{galleryName}</p>
              {itemCount > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold text-red-600">{itemCount}</span> {itemCount === 1 ? 'item' : 'items'} will be deleted
                </p>
              )}
            </div>
            <p className="text-gray-700 mb-3">
              You are about to delete the entire gallery including all photos, videos, and other media. All guest views and interactions will be lost.
            </p>
            <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 rounded-md border border-red-200">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium">⚠️ This action is IRREVERSIBLE</p>
                <ul className="mt-1 ml-4 list-disc space-y-1">
                  <li>All {itemCount || ''} items will be permanently deleted</li>
                  <li>Cannot be recovered or undone</li>
                  <li>Guests will no longer see this content</li>
                </ul>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Delete Gallery
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
