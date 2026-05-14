import React, { useState, useEffect } from 'react';

/**
 * PHASE 25: Event Countdown Widget
 * 
 * Displays countdown to event in days, hours, and minutes
 * - Auto-updates every minute
 * - Hides after event time passes
 * - Mobile-first responsive design
 */
const CountdownWidget = ({ eventDate, eventTime, enabled = true }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isEventPassed, setIsEventPassed] = useState(false);

  useEffect(() => {
    if (!enabled || !eventDate) return;

    const calculateTimeLeft = () => {
      // Combine date and time
      const eventDateTime = new Date(`${eventDate}T${eventTime || '00:00'}`);
      const now = new Date();
      const difference = eventDateTime - now;

      if (difference <= 0) {
        setIsEventPassed(true);
        return null;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      return { days, hours, minutes };
    };

    // Calculate immediately
    const time = calculateTimeLeft();
    setTimeLeft(time);

    // Update every minute
    const timer = setInterval(() => {
      const time = calculateTimeLeft();
      setTimeLeft(time);
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [eventDate, eventTime, enabled]);

  if (!enabled || isEventPassed || !timeLeft) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-2xl shadow-2xl p-1">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
              ⏰ Countdown to the Big Day
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              The celebration begins in...
            </p>
          </div>

          {/* Countdown Display */}
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            {/* Days */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-600 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 md:p-8 shadow-xl">
                  <div className="text-4xl md:text-6xl font-bold text-white text-center">
                    {timeLeft.days}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300">
                Days
              </p>
            </div>

            {/* Hours */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-pink-600 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-pink-500 to-pink-700 rounded-2xl p-6 md:p-8 shadow-xl">
                  <div className="text-4xl md:text-6xl font-bold text-white text-center">
                    {timeLeft.hours}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300">
                Hours
              </p>
            </div>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-600 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-6 md:p-8 shadow-xl">
                  <div className="text-4xl md:text-6xl font-bold text-white text-center">
                    {timeLeft.minutes}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300">
                Minutes
              </p>
            </div>
          </div>

          {/* Footer Message */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center justify-center gap-2">
              <span>✨</span>
              <span>Can't wait to celebrate with you!</span>
              <span>✨</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownWidget;
