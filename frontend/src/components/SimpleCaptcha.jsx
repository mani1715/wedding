import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

/**
 * PHASE 32: Simple Math CAPTCHA Component
 * 
 * Lightweight CAPTCHA using math challenges
 * Features:
 * - Simple addition/subtraction challenges
 * - Refresh capability
 * - No external services required
 * - Clean, accessible UI
 */
const SimpleCaptcha = ({ onVerified, onError }) => {
  const [challengeId, setChallengeId] = useState(null);
  const [challengeText, setChallengeText] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Generate new challenge on mount
  useEffect(() => {
    generateChallenge();
  }, []);
  
  const generateChallenge = async () => {
    setIsLoading(true);
    setError('');
    setAnswer('');
    
    try {
      const response = await axios.post(`${API_URL}/captcha/generate`);
      setChallengeId(response.data.challenge_id);
      setChallengeText(response.data.challenge);
    } catch (err) {
      console.error('Failed to generate CAPTCHA:', err);
      setError('Failed to load challenge. Please try again.');
      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerify = async () => {
    if (!answer.trim()) {
      setError('Please enter your answer');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/captcha/verify`, {
        challenge_id: challengeId,
        answer: answer.trim()
      });
      
      if (response.data.valid) {
        if (onVerified) {
          onVerified(challengeId);
        }
      } else {
        setError(response.data.message || 'Incorrect answer. Please try again.');
        // Generate new challenge
        setTimeout(() => generateChallenge(), 1000);
      }
    } catch (err) {
      console.error('Failed to verify CAPTCHA:', err);
      setError('Verification failed. Please try again.');
      if (onError) {
        onError(err);
      }
      // Generate new challenge
      setTimeout(() => generateChallenge(), 1000);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAnswerChange = (e) => {
    const value = e.target.value;
    // Only allow numeric input (including negative numbers)
    if (/^-?\d*$/.test(value)) {
      setAnswer(value);
      setError('');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };
  
  return (
    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">
          Security Check
        </h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={generateChallenge}
          disabled={isLoading}
          className="h-8 px-2"
          title="Refresh challenge"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-700">
          Please solve this simple math problem:
        </p>
        
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center justify-center bg-white border-2 border-blue-300 rounded-lg p-4">
            <span className="text-2xl font-bold text-gray-900 font-mono">
              {challengeText || '...'}
            </span>
            <span className="text-2xl font-bold text-gray-900 mx-2">=</span>
            <Input
              type="text"
              inputMode="numeric"
              value={answer}
              onChange={handleAnswerChange}
              onKeyPress={handleKeyPress}
              placeholder="?"
              className="w-20 text-2xl text-center font-mono"
              disabled={isLoading || !challengeText}
              autoComplete="off"
            />
          </div>
        </div>
        
        {error && (
          <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}
        
        <Button
          type="button"
          onClick={handleVerify}
          disabled={isLoading || !answer || !challengeText}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </Button>
      </div>
    </div>
  );
};

export default SimpleCaptcha;
