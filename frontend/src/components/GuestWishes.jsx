import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * PHASE 25: Guest Wishes Component
 * PHASE 29D: Enhanced with improved accessibility and semantic HTML
 * 
 * Allows guests to leave wishes/messages for the event
 * - Max 200 characters
 * - Optional emoji selection
 * - Display latest wishes first
 * - Rate limited (5 per IP per day)
 * - Fully accessible forms with proper labels and ARIA attributes
 */
const GuestWishes = ({ eventId, enabled = true }) => {
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const emojis = ['❤️', '🙏', '🎉', '💐', '🌟', '✨'];

  // Fetch wishes on mount
  useEffect(() => {
    if (enabled && eventId) {
      fetchWishes();
    }
  }, [eventId, enabled]);

  const fetchWishes = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await axios.get(`${backendUrl}/api/events/${eventId}/wishes`);
      setWishes(response.data.wishes || []);
    } catch (err) {
      console.error('Error fetching wishes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    if (message.length > 200) {
      setError('Message must be 200 characters or less');
      return;
    }

    setSubmitting(true);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await axios.post(`${backendUrl}/api/events/${eventId}/wishes`, {
        guest_name: guestName.trim() || 'Anonymous',
        message: message.trim(),
        emoji: selectedEmoji
      });

      setSuccess('✨ Your wish has been posted!');
      setGuestName('');
      setMessage('');
      setSelectedEmoji(null);

      // Refresh wishes
      setTimeout(() => {
        fetchWishes();
        setSuccess('');
      }, 1500);
    } catch (err) {
      if (err.response?.status === 429) {
        setError('You\'ve reached the maximum wishes for today (5)');
      } else if (err.response?.status === 400) {
        setError(err.response.data.detail || 'Message contains inappropriate content');
      } else {
        setError('Failed to post wish. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!enabled) {
    return null;
  }

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-8" aria-labelledby="guest-wishes-heading">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl shadow-lg p-6 md:p-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h2 id="guest-wishes-heading" className="text-3xl md:text-4xl font-bold text-purple-900 dark:text-purple-100 mb-2">
            💬 Guest Wishes
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
            Share your blessings and warm wishes for the couple
          </p>
        </header>

        {/* Wish Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="guest-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Name (Optional)
              </label>
              <input
                id="guest-name"
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Leave empty for Anonymous"
                maxLength={50}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Message Input */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Wish <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your heartfelt wishes here..."
                maxLength={200}
                rows={3}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none"
              />
              <p className="text-right text-xs text-gray-500 mt-1">
                {message.length}/200 characters
              </p>
            </div>

            {/* Emoji Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Add an Emoji (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(selectedEmoji === emoji ? null : emoji)}
                    className={`text-2xl p-2 rounded-lg transition-all ${
                      selectedEmoji === emoji
                        ? 'bg-purple-200 dark:bg-purple-700 scale-110 ring-2 ring-purple-500'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm" role="alert" aria-live="assertive">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm" role="status" aria-live="polite">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !message.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus-visible:from-purple-700 focus-visible:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg focus-visible:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-300"
              aria-disabled={submitting || !message.trim()}
            >
              {submitting ? 'Posting...' : '✨ Post Wish'}
            </button>
          </form>
        </div>

        {/* Wishes Display */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Recent Wishes ({wishes.length})
          </h3>

          {loading ? (
            <div className="text-center py-8" role="status" aria-live="polite">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
              <span className="sr-only">Loading wishes...</span>
            </div>
          ) : wishes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-lg">No wishes yet. Be the first to share your blessings!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto" role="list" aria-label="Guest wishes">
              {wishes.map((wish) => (
                <article
                  key={wish.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                  role="listitem"
                >
                  <div className="flex items-start gap-3">
                    {wish.emoji && (
                      <span className="text-2xl flex-shrink-0" aria-hidden="true">{wish.emoji}</span>
                    )}
                    <div className="flex-1">
                      <p className="text-gray-800 dark:text-gray-200 mb-1">{wish.message}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">{wish.guest_name}</span>
                        <span aria-hidden="true">•</span>
                        <time dateTime={wish.created_at}>
                          {new Date(wish.created_at).toLocaleDateString()}
                        </time>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GuestWishes;
