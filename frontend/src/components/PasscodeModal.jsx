import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, AlertCircle } from 'lucide-react';

/**
 * PHASE 32: Passcode Modal Component
 * 
 * Modal for entering passcode to access private events
 * Features:
 * - 4-6 digit numeric passcode input
 * - Attempt tracking (5 attempts max)
 * - Temporary blocking after failed attempts
 * - Clean, user-friendly UI
 */
const PasscodeModal = ({
  isOpen,
  onClose,
  onVerify,
  eventName = 'this event',
  remainingAttempts = 5,
  blockedUntil = null,
  error = null,
}) => {
  const [passcode, setPasscode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [localError, setLocalError] = useState('');
  
  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);
  
  useEffect(() => {
    // Clear passcode when modal opens/closes
    if (isOpen) {
      setPasscode('');
      setLocalError('');
    }
  }, [isOpen]);
  
  const handlePasscodeChange = (e) => {
    const value = e.target.value;
    // Only allow numeric input, max 6 digits
    if (/^\d{0,6}$/.test(value)) {
      setPasscode(value);
      setLocalError('');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passcode
    if (passcode.length < 4) {
      setLocalError('Passcode must be at least 4 digits');
      return;
    }
    
    if (passcode.length > 6) {
      setLocalError('Passcode must be at most 6 digits');
      return;
    }
    
    setIsVerifying(true);
    setLocalError('');
    
    try {
      await onVerify(passcode);
    } catch (err) {
      setLocalError(err.message || 'Failed to verify passcode');
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };
  
  // Check if currently blocked
  const isBlocked = blockedUntil && new Date(blockedUntil) > new Date();
  const blockTimeRemaining = isBlocked
    ? Math.ceil((new Date(blockedUntil) - new Date()) / 1000 / 60) // minutes
    : 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-xl">Private Event</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            {eventName} is password protected. Please enter the passcode to continue.
          </DialogDescription>
        </DialogHeader>
        
        {isBlocked ? (
          <div className="py-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900">
                  Too many failed attempts
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Access temporarily blocked. Please try again in {blockTimeRemaining} {blockTimeRemaining === 1 ? 'minute' : 'minutes'}.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div>
              <label htmlFor="passcode" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Passcode
              </label>
              <Input
                id="passcode"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={passcode}
                onChange={handlePasscodeChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter 4-6 digit passcode"
                className="text-center text-2xl tracking-widest font-mono"
                autoFocus
                disabled={isVerifying}
              />
              <p className="text-xs text-gray-500 mt-2">
                4-6 digit numeric passcode
              </p>
            </div>
            
            {localError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{localError}</p>
              </div>
            )}
            
            {remainingAttempts < 5 && remainingAttempts > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">{remainingAttempts}</span> {remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining
                </p>
              </div>
            )}
          </form>
        )}
        
        <DialogFooter className="gap-2">
          {!isBlocked && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isVerifying}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isVerifying || passcode.length < 4}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                {isVerifying ? 'Verifying...' : 'Submit'}
              </Button>
            </>
          )}
          {isBlocked && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PasscodeModal;
