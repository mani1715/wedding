import React from 'react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

/**
 * PHASE 25: Engagement Settings Component
 * 
 * Admin component to toggle guest engagement features per event:
 * - Guest Wishes
 * - Guest Reactions
 * - Event Countdown
 */
const EngagementSettings = ({ eventId, settings = {}, onSettingsChange }) => {
  const {
    wishes_enabled = true,
    reactions_enabled = true,
    countdown_enabled = true
  } = settings;

  const handleToggle = (field, value) => {
    if (onSettingsChange) {
      onSettingsChange({
        ...settings,
        [field]: value
      });
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
          🎯 Guest Engagement
        </h3>
        <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-2 py-1 rounded-full">
          PHASE 25
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Enable interactive features to boost guest engagement and time on page.
      </p>

      <div className="space-y-3">
        {/* Guest Wishes Toggle */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">💬</span>
            <div>
              <Label htmlFor="wishes-toggle" className="font-medium text-sm">
                Guest Wishes
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Let guests leave messages (max 200 chars)
              </p>
            </div>
          </div>
          <Switch
            id="wishes-toggle"
            checked={wishes_enabled}
            onCheckedChange={(checked) => handleToggle('wishes_enabled', checked)}
          />
        </div>

        {/* Guest Reactions Toggle */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">❤️</span>
            <div>
              <Label htmlFor="reactions-toggle" className="font-medium text-sm">
                Guest Reactions
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Quick emoji reactions (❤️ 🙏 🎉)
              </p>
            </div>
          </div>
          <Switch
            id="reactions-toggle"
            checked={reactions_enabled}
            onCheckedChange={(checked) => handleToggle('reactions_enabled', checked)}
          />
        </div>

        {/* Event Countdown Toggle */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⏰</span>
            <div>
              <Label htmlFor="countdown-toggle" className="font-medium text-sm">
                Event Countdown
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Show countdown timer (days/hours/mins)
              </p>
            </div>
          </div>
          <Switch
            id="countdown-toggle"
            checked={countdown_enabled}
            onCheckedChange={(checked) => handleToggle('countdown_enabled', checked)}
          />
        </div>
      </div>

      <div className="pt-2 border-t border-purple-200 dark:border-purple-800">
        <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
          <span>✨</span>
          <span>These features are auto-saved when you save the event</span>
        </p>
      </div>
    </div>
  );
};

export default EngagementSettings;
