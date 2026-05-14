import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

/**
 * PHASE 32: Math CAPTCHA Component
 * 
 * Simple math challenge to prevent spam and bot submissions
 * Features:
 * - Generates simple arithmetic challenges (addition, subtraction)
 * - 5-minute expiry
 * - Refresh capability
 * - Clean, accessible UI
 * - Automatic verification on submit
 */
const MathCaptcha = ({ onVerify, className = '' }) => {
  const [challenge, setChallenge] = useState(null);
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    generateChallenge();
  }, []);

  const generateChallenge = async () => {
    setIsLoading(true);
    setError('');
    setAnswer('');

    try {
      const response = await axios.post(`${API_URL}/api/captcha/generate`);
      setChallenge(response.data);
    } catch (err) {
      console.error('Failed to generate CAPTCHA:', err);
      setError('Failed to load CAPTCHA. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!answer || answer.trim() === '') {
      setError('Please enter your answer');
      return;
    }

    if (!challenge) {
      setError('No challenge available. Please refresh.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/captcha/verify`, {
        challenge_id: challenge.id,
        answer: answer.trim()
      });

      if (response.data.verified) {
        // Success! Pass the challenge ID and answer to parent
        onVerify({
          captcha_id: challenge.id,
          captcha_answer: answer.trim(),
          verified: true
        });
      } else {
        setError('Incorrect answer. Please try again.');
        generateChallenge(); // Get new challenge
      }
    } catch (err) {
      console.error('CAPTCHA verification failed:', err);
      const errorMsg = err.response?.data?.detail || 'Verification failed. Please try again.';
      setError(errorMsg);
      generateChallenge(); // Get new challenge
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  if (isLoading && !challenge) {
    return (
      <div className={`p-4 border rounded-lg bg-gray-50 ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-sm text-gray-600">Loading verification...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 border-2 border-blue-200 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 ${className}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center space-x-2 pb-2 border-b border-blue-200">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-800">Verification Required</h3>
        </div>

        {/* Challenge Display */}
        {challenge && (
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-3 py-2">
              <span className="text-2xl font-bold text-gray-800 bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-200">
                {challenge.challenge}
              </span>
              <span className="text-xl text-gray-600">=</span>
              <Input
                type="number"
                inputMode="numeric"
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder="?"
                className="w-24 text-center text-xl font-semibold"
                disabled={isLoading}
                autoFocus
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateChallenge}
                disabled={isLoading}
                className="flex-shrink-0"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                type="button"
                onClick={handleVerify}
                disabled={isLoading || !answer}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-start space-x-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Help Text */}
        <p className="text-xs text-gray-500 text-center">
          Solve the simple math problem to continue
        </p>
      </div>
    </div>
  );
};

export default MathCaptcha;
