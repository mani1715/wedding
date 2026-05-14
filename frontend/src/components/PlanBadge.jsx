import React from 'react';

/**
 * PHASE 33: Plan Badge Component
 * Displays the current plan with color coding
 */
const PlanBadge = ({ plan, size = 'md', showIcon = true }) => {
  const planConfig = {
    FREE: {
      label: 'Free',
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: '🆓',
      gradient: 'from-gray-100 to-gray-200'
    },
    SILVER: {
      label: 'Silver',
      color: 'bg-blue-50 text-blue-700 border-blue-300',
      icon: '🥈',
      gradient: 'from-blue-50 to-blue-100'
    },
    GOLD: {
      label: 'Gold',
      color: 'bg-yellow-50 text-yellow-700 border-yellow-300',
      icon: '🥇',
      gradient: 'from-yellow-50 to-yellow-100'
    },
    PLATINUM: {
      label: 'Platinum',
      color: 'bg-purple-50 text-purple-700 border-purple-300',
      icon: '💎',
      gradient: 'from-purple-50 to-purple-100'
    }
  };

  const config = planConfig[plan] || planConfig.FREE;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <span 
      className={`
        inline-flex items-center gap-1 rounded-full border font-medium
        ${config.color} ${sizeClasses[size]}
      `}
    >
      {showIcon && <span className="text-sm">{config.icon}</span>}
      {config.label}
    </span>
  );
};

export default PlanBadge;
