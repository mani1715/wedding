import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

/**
 * PHASE 29E: Delete Confirmation Modal
 * 
 * Reusable confirmation dialog for destructive actions.
 * Forces explicit confirmation before deletion.
 * 
 * @param {boolean} open - Whether modal is open
 * @param {function} onOpenChange - Callback when modal open state changes
 * @param {function} onConfirm - Callback when delete is confirmed
 * @param {string} title - Modal title
 * @param {string} description - Warning description
 * @param {string} itemName - Name of item being deleted
 * @param {string} confirmText - Confirm button text (default: "Delete")
 * @param {boolean} isDangerous - Whether to show danger styling (default: true)
 */
const DeleteConfirmationModal = ({
  open,
  onOpenChange,
  onConfirm,
  title = "Confirm Deletion",
  description = "This action cannot be undone.",
  itemName = "",
  confirmText = "Delete",
  isDangerous = true
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`rounded-full p-2 ${isDangerous ? 'bg-red-100' : 'bg-orange-100'}`}>
              <AlertTriangle className={`w-5 h-5 ${isDangerous ? 'text-red-600' : 'text-orange-600'}`} />
            </div>
            <AlertDialogTitle className="text-lg font-semibold">
              {title}
            </AlertDialogTitle>
          </div>
          
          <AlertDialogDescription className="text-base leading-relaxed pt-2">
            {itemName && (
              <div className="font-medium text-gray-900 mb-2">
                {itemName}
              </div>
            )}
            <div className="text-gray-600">
              {description}
            </div>
            <div className={`mt-3 px-3 py-2 rounded-md ${isDangerous ? 'bg-red-50 text-red-800' : 'bg-orange-50 text-orange-800'} text-sm font-medium`}>
              ⚠️ This action is irreversible
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="px-4 py-2">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={`px-4 py-2 ${
              isDangerous 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationModal;
