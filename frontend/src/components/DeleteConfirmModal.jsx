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
 * PHASE 29E: Reusable delete confirmation modal
 * 
 * Safety modal for all delete actions in admin panel
 * Clearly states action is irreversible
 * Requires explicit confirmation
 */
export function DeleteConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  title = 'Confirm Delete',
  description = 'This action cannot be undone. Are you sure you want to delete this item?',
  itemName = null,
  confirmText = 'Delete',
  cancelText = 'Cancel',
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-4">
            {itemName && (
              <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-sm font-medium text-gray-900">Item to delete:</p>
                <p className="text-sm text-gray-700 mt-1">{itemName}</p>
              </div>
            )}
            <p className="text-gray-700">{description}</p>
            <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 rounded-md border border-red-200">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800 font-medium">
                This action is irreversible and cannot be undone.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="mt-0">{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
