import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * PHASE 25: Quick Reaction Bar
 * 
 * Lightweight reaction system allowing guests to express emotions
 * - ❤️ Love it
 * - 🙏 Blessings
 * - 🎉 Excited
 * - One reaction per device (tracked by IP)
 * - Shows aggregate counts only
 */
const ReactionBar = ({ eventId, enabled = true, position = 'bottom' }) => {
  const [reactions, setReactions] = useState({
    love_count: 0,
    blessings_count: 0,
    excited_count: 0,
    total_reactions: 0
  });
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasReacted, setHasReacted] = useState(false);

  const reactionButtons = [
    { type: 'love', emoji: '❤️', label: 'Love it', color: 'from-red-500 to-pink-500' },
    { type: 'blessings', emoji: '🙏', label: 'Blessings', color: 'from-purple-500 to-indigo-500' },
    { type: 'excited', emoji: '🎉', label: 'Excited', color: 'from-yellow-500 to-orange-500' }
  ];

  // Fetch reaction stats on mount
  useEffect(() => {
    if (enabled && eventId) {
      fetchReactions();
      checkIfUserReacted();
    }
  }, [eventId, enabled]);

  const fetchReactions = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await axios.get(`${backendUrl}/api/events/${eventId}/reactions`);
      setReactions(response.data);
    } catch (err) {
      console.error('Error fetching reactions:', err);
    }
  };

  const checkIfUserReacted = () => {
    // Check localStorage to see if user already reacted
    const reactedEvents = JSON.parse(localStorage.getItem('reactedEvents') || '{}');
    if (reactedEvents[eventId]) {
      setHasReacted(true);
      setSelectedReaction(reactedEvents[eventId]);
    }
  };

  const handleReaction = async (reactionType) => {
    if (hasReacted || loading) return;

    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      await axios.post(`${backendUrl}/api/events/${eventId}/reactions`, {
        reaction_type: reactionType
      });

      // Update local state
      setHasReacted(true);
      setSelectedReaction(reactionType);

      // Store in localStorage
      const reactedEvents = JSON.parse(localStorage.getItem('reactedEvents') || '{}');
      reactedEvents[eventId] = reactionType;
      localStorage.setItem('reactedEvents', JSON.stringify(reactedEvents));

      // Refresh stats
      await fetchReactions();
    } catch (err) {
      if (err.response?.status === 409) {
        // User already reacted
        setHasReacted(true);
        const reactedType = err.response.data.existing_reaction;
        setSelectedReaction(reactedType);
      } else {
        console.error('Error submitting reaction:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!enabled) {
    return null;
  }

  const positionClasses = position === 'bottom'
    ? 'bottom-6 left-1/2 -translate-x-1/2'
    : 'top-1/2 right-6 -translate-y-1/2 flex-col';

  return (
    <div className={`fixed ${positionClasses} z-40`}>
      <div className="bg-white dark:bg-gray-800 rounded-full shadow-2xl p-2 border border-gray-200 dark:border-gray-700">
        <div className={`flex ${position === 'side' ? 'flex-col' : 'flex-row'} items-center gap-2`}>
          {reactionButtons.map((reaction) => {
            const count = reactions[`${reaction.type}_count`] || 0;
            const isSelected = selectedReaction === reaction.type;

            return (
              <button
                key={reaction.type}
                onClick={() => handleReaction(reaction.type)}
                disabled={hasReacted || loading}
                className={`group relative flex items-center gap-2 rounded-full transition-all duration-300 active:scale-95 ${
                  isSelected
                    ? `bg-gradient-to-r ${reaction.color} text-white scale-110 shadow-lg`
                    : hasReacted
                    ? 'bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed'
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gradient-to-r hover:' + reaction.color + ' hover:text-white hover:scale-105'
                }`}
                style={{
                  minWidth: '52px',
                  minHeight: '52px',
                  padding: '12px 16px',
                  touchAction: 'manipulation'
                }}
                title={reaction.label}
              >
                {/* Emoji */}
                <span className={`text-2xl transition-transform ${isSelected ? 'animate-bounce' : 'group-hover:scale-125'}`}>
                  {reaction.emoji}
                </span>

                {/* Count Badge */}
                {count > 0 && (
                  <span className={`text-sm font-semibold ${
                    isSelected 
                      ? 'text-white' 
                      : 'text-gray-700 dark:text-gray-300 group-hover:text-white'
                  }`}>
                    {count}
                  </span>
                )}

                {/* Tooltip - Only on desktop */}
                <span className="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {reaction.label}
                </span>
              </button>
            );
          })}

          {/* Total Count */}
          {reactions.total_reactions > 0 && (
            <div className="ml-2 px-3 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full">
              <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                {reactions.total_reactions}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Thank you message after reaction */}
      {hasReacted && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm px-4 py-2 rounded-full shadow-lg animate-fade-in whitespace-nowrap">
          ✨ Thanks for reacting!
        </div>
      )}
    </div>
  );
};

export default ReactionBar;
