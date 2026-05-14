import React, { useState, useEffect } from 'react';
import { Lock, Check, Sparkles } from 'lucide-react';
import axios from 'axios';
import { MASTER_THEMES, getCategoryLabel, getPlanLabel } from '../themes/masterThemes';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

/**
 * PHASE 34: Theme Selector Component
 * Visual grid for selecting master themes with plan-based gating
 */
const ThemeSelector = ({
  profileId,
  currentThemeId = 'royal_heritage',
  userPlan = 'FREE',
  onThemeSelect,
  onPreview
}) => {
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(currentThemeId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThemes();
  }, [userPlan]);

  const fetchThemes = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/themes`, {
        params: { plan_type: userPlan }
      });
      setThemes(response.data.themes || []);
    } catch (error) {
      console.error('Error fetching themes:', error);
      // Fallback to local themes
      setThemes(Object.values(MASTER_THEMES));
    } finally {
      setLoading(false);
    }
  };

  const handleThemeClick = (theme) => {
    const isAccessible = theme.planRequired === 'FREE' || 
      (userPlan === 'SILVER' && ['FREE', 'SILVER'].includes(theme.planRequired)) ||
      (userPlan === 'GOLD' && ['FREE', 'SILVER', 'GOLD'].includes(theme.planRequired)) ||
      userPlan === 'PLATINUM';

    if (!isAccessible) {
      alert(`This theme requires ${getPlanLabel(theme.planRequired)} plan or higher`);
      return;
    }

    setSelectedTheme(theme.id);
    if (onThemeSelect) {
      onThemeSelect(theme.id);
    }
  };

  const handlePreview = (theme, e) => {
    e.stopPropagation();
    if (onPreview) {
      onPreview(theme);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  // Group themes by category
  const themesByCategory = themes.reduce((acc, theme) => {
    if (!acc[theme.category]) {
      acc[theme.category] = [];
    }
    acc[theme.category].push(theme);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(themesByCategory).map(([category, categoryThemes]) => (
        <div key={category}>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-600" />
            {getCategoryLabel(category)}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryThemes.map((theme) => {
              const isAccessible = theme.planRequired === 'FREE' ||
                (userPlan === 'SILVER' && ['FREE', 'SILVER'].includes(theme.planRequired)) ||
                (userPlan === 'GOLD' && ['FREE', 'SILVER', 'GOLD'].includes(theme.planRequired)) ||
                userPlan === 'PLATINUM';
              
              const isSelected = selectedTheme === theme.id;

              return (
                <div
                  key={theme.id}
                  onClick={() => handleThemeClick(theme)}
                  className={`
                    relative cursor-pointer rounded-xl overflow-hidden
                    border-2 transition-all duration-300
                    ${isSelected
                      ? 'border-rose-600 shadow-xl scale-105'
                      : isAccessible
                        ? 'border-gray-200 hover:border-rose-400 hover:shadow-lg'
                        : 'border-gray-200 opacity-60 cursor-not-allowed'
                    }
                  `}
                >
                  {/* Preview Image / Color Gradient */}
                  <div
                    className="h-32 flex items-center justify-center relative"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`
                    }}
                  >
                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg">
                        <Check className="w-4 h-4 text-rose-600" />
                      </div>
                    )}

                    {/* Locked Badge */}
                    {!isAccessible && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Lock className="w-8 h-8 mx-auto mb-2" />
                          <span className="text-sm font-medium">{getPlanLabel(theme.planRequired)}+</span>
                        </div>
                      </div>
                    )}

                    {/* Typography Preview */}
                    <div
                      className="text-white text-center p-4"
                      style={{ fontFamily: theme.typography.heading }}
                    >
                      <div className="text-2xl font-bold drop-shadow-lg">Aa</div>
                      <div className="text-sm opacity-90" style={{ fontFamily: theme.typography.body }}>Wedding</div>
                    </div>
                  </div>

                  {/* Theme Info */}
                  <div className="p-4 bg-white">
                    <h4 className="font-semibold text-gray-900 mb-1">{theme.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{theme.description}</p>

                    {/* Plan Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`
                        text-xs px-2 py-1 rounded-full
                        ${theme.planRequired === 'FREE'
                          ? 'bg-gray-100 text-gray-700'
                          : theme.planRequired === 'SILVER'
                            ? 'bg-gray-200 text-gray-800'
                            : theme.planRequired === 'GOLD'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-purple-100 text-purple-800'
                        }
                      `}>
                        {getPlanLabel(theme.planRequired)}
                      </span>

                      {/* Preview Button */}
                      {isAccessible && (
                        <button
                          onClick={(e) => handlePreview(theme, e)}
                          className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                        >
                          Preview
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Current Plan Info */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Your Current Plan: {getPlanLabel(userPlan)}</h4>
            <p className="text-sm text-gray-600">
              {userPlan === 'PLATINUM'
                ? 'You have access to all premium themes'
                : `Upgrade to access more premium themes`
              }
            </p>
          </div>
          {userPlan !== 'PLATINUM' && (
            <button className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium">
              Upgrade Plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
