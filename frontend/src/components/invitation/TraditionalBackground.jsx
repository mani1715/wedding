import React from 'react';

export const TraditionalBackground = ({ design, deity }) => {
  const deityImages = {
    ganesha: 'https://images.unsplash.com/photo-1607604760190-ec9ccc12156e',
    venkateswara: 'https://images.unsplash.com/photo-1707833685224-9fcce62dcd3c',
    shiva: 'https://images.unsplash.com/photo-1566890910598-c5768889e83e'
  };

  const getOpacityByDesign = () => {
    const opacities = {
      temple: 0.15,
      royal: 0.12,
      floral: 0.18,
      divine: 0.2,
      cinematic: 0.08,
      scroll: 0.15,
      art: 0.15,
      modern: 0.1
    };
    return opacities[design] || 0.15;
  };

  const getColorByDesign = () => {
    const colors = {
      temple: { primary: '#ff6b35', secondary: '#f7931e', accent: '#ffd700' },
      royal: { primary: '#9b59b6', secondary: '#e91e63', accent: '#ffd700' },
      floral: { primary: '#ec407a', secondary: '#66bb6a', accent: '#ffb74d' },
      divine: { primary: '#ffd54f', secondary: '#90a4ae', accent: '#ffab40' },
      cinematic: { primary: '#455a64', secondary: '#ffc107', accent: '#ef5350' },
      scroll: { primary: '#d4a574', secondary: '#8d6e63', accent: '#d84315' },
      art: { primary: '#f44336', secondary: '#26a69a', accent: '#ab47bc' },
      modern: { primary: '#42a5f5', secondary: '#26c6da', accent: '#ec407a' }
    };
    return colors[design] || colors.divine;
  };

  const colors = getColorByDesign();
  const opacity = getOpacityByDesign();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Main Mandala Pattern - Center */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: opacity * 0.5 }}
      >
        <svg width="800" height="800" viewBox="0 0 200 200" className="animate-spin-slow">
          <defs>
            <radialGradient id="mandalaGradient">
              <stop offset="0%" stopColor={colors.primary} stopOpacity="0.3" />
              <stop offset="100%" stopColor={colors.accent} stopOpacity="0.1" />
            </radialGradient>
          </defs>
          {/* Mandala Pattern */}
          <circle cx="100" cy="100" r="80" fill="none" stroke="url(#mandalaGradient)" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="url(#mandalaGradient)" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="url(#mandalaGradient)" strokeWidth="0.5" />
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = 100 + 40 * Math.cos(angle);
            const y1 = 100 + 40 * Math.sin(angle);
            const x2 = 100 + 80 * Math.cos(angle);
            const y2 = 100 + 80 * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="url(#mandalaGradient)"
                strokeWidth="0.5"
              />
            );
          })}
          {/* Petal patterns */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180;
            const cx = 100 + 65 * Math.cos(angle);
            const cy = 100 + 65 * Math.sin(angle);
            return (
              <circle
                key={`petal-${i}`}
                cx={cx}
                cy={cy}
                r="8"
                fill={colors.secondary}
                opacity="0.15"
              />
            );
          })}
        </svg>
      </div>

      {/* Top Deity Section */}
      {deity !== 'none' && deityImages[deity] && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2" style={{ opacity: opacity * 2 }}>
          <div className="relative">
            {/* Decorative arch above deity */}
            <svg width="200" height="60" viewBox="0 0 200 60" className="absolute -top-12 left-1/2 transform -translate-x-1/2">
              <path
                d="M 10 50 Q 10 10, 50 10 L 150 10 Q 190 10, 190 50"
                fill="none"
                stroke={colors.accent}
                strokeWidth="2"
                opacity="0.3"
              />
              <path
                d="M 20 50 Q 20 20, 50 20 L 150 20 Q 180 20, 180 50"
                fill="none"
                stroke={colors.primary}
                strokeWidth="1.5"
                opacity="0.3"
              />
            </svg>

            {/* Deity Image */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl mx-auto">
              <img
                src={deityImages[deity]}
                alt="Divine Blessing"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Om Symbol above */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <span className="text-3xl" style={{ color: colors.accent, opacity: 0.6 }}>ॐ</span>
            </div>
          </div>
        </div>
      )}

      {/* Lotus Flowers - Top Corners */}
      <div className="absolute top-24 left-8 md:left-16" style={{ opacity: opacity * 1.5 }}>
        <svg width="80" height="80" viewBox="0 0 100 100" className="animate-float">
          <path
            d="M 50 10 Q 45 30, 50 50 Q 55 30, 50 10"
            fill={colors.secondary}
            opacity="0.4"
          />
          <path
            d="M 50 10 Q 35 25, 40 50 Q 45 30, 50 10"
            fill={colors.primary}
            opacity="0.3"
          />
          <path
            d="M 50 10 Q 65 25, 60 50 Q 55 30, 50 10"
            fill={colors.primary}
            opacity="0.3"
          />
          <circle cx="50" cy="50" r="8" fill={colors.accent} opacity="0.6" />
        </svg>
      </div>

      <div className="absolute top-24 right-8 md:right-16" style={{ opacity: opacity * 1.5 }}>
        <svg width="80" height="80" viewBox="0 0 100 100" className="animate-float" style={{ animationDelay: '1s' }}>
          <path
            d="M 50 10 Q 45 30, 50 50 Q 55 30, 50 10"
            fill={colors.secondary}
            opacity="0.4"
          />
          <path
            d="M 50 10 Q 35 25, 40 50 Q 45 30, 50 10"
            fill={colors.primary}
            opacity="0.3"
          />
          <path
            d="M 50 10 Q 65 25, 60 50 Q 55 30, 50 10"
            fill={colors.primary}
            opacity="0.3"
          />
          <circle cx="50" cy="50" r="8" fill={colors.accent} opacity="0.6" />
        </svg>
      </div>

      {/* Bells - Hanging from top */}
      <div className="absolute top-32 left-1/4" style={{ opacity: opacity * 1.2 }}>
        <svg width="40" height="60" viewBox="0 0 40 60" className="animate-swing">
          <line x1="20" y1="0" x2="20" y2="30" stroke={colors.accent} strokeWidth="1" />
          <path
            d="M 10 30 Q 10 45, 20 50 Q 30 45, 30 30 Z"
            fill={colors.primary}
            opacity="0.4"
          />
          <circle cx="20" cy="52" r="3" fill={colors.secondary} opacity="0.5" />
        </svg>
      </div>

      <div className="absolute top-32 right-1/4" style={{ opacity: opacity * 1.2 }}>
        <svg width="40" height="60" viewBox="0 0 40 60" className="animate-swing" style={{ animationDelay: '0.5s' }}>
          <line x1="20" y1="0" x2="20" y2="30" stroke={colors.accent} strokeWidth="1" />
          <path
            d="M 10 30 Q 10 45, 20 50 Q 30 45, 30 30 Z"
            fill={colors.primary}
            opacity="0.4"
          />
          <circle cx="20" cy="52" r="3" fill={colors.secondary} opacity="0.5" />
        </svg>
      </div>

      {/* Bottom Decorative Elements */}
      {/* Temple Pillars */}
      <div className="absolute bottom-0 left-0 right-0" style={{ opacity: opacity }}>
        <svg width="100%" height="200" viewBox="0 0 1200 200" preserveAspectRatio="xMidYMax slice">
          {/* Left Pillar */}
          <rect x="50" y="80" width="40" height="120" fill={colors.accent} opacity="0.2" />
          <rect x="55" y="75" width="30" height="10" fill={colors.primary} opacity="0.3" />
          <rect x="52" y="200" width="36" height="15" fill={colors.primary} opacity="0.3" />
          
          {/* Right Pillar */}
          <rect x="1110" y="80" width="40" height="120" fill={colors.accent} opacity="0.2" />
          <rect x="1115" y="75" width="30" height="10" fill={colors.primary} opacity="0.3" />
          <rect x="1112" y="200" width="36" height="15" fill={colors.primary} opacity="0.3" />

          {/* Decorative base pattern */}
          <path
            d="M 0 180 Q 200 160, 400 180 Q 600 200, 800 180 Q 1000 160, 1200 180 L 1200 250 L 0 250 Z"
            fill={colors.secondary}
            opacity="0.1"
          />
        </svg>
      </div>

      {/* Lotus Flowers - Bottom Corners */}
      <div className="absolute bottom-32 left-12 md:left-24" style={{ opacity: opacity * 1.5 }}>
        <svg width="100" height="60" viewBox="0 0 100 60" className="animate-float" style={{ animationDelay: '2s' }}>
          <ellipse cx="50" cy="50" rx="45" ry="8" fill={colors.secondary} opacity="0.3" />
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180;
            const x = 50 + 30 * Math.cos(angle);
            const y = 35 + 20 * Math.sin(angle);
            return (
              <ellipse
                key={i}
                cx={x}
                cy={y}
                rx="12"
                ry="20"
                fill={colors.primary}
                opacity="0.4"
                transform={`rotate(${i * 45} ${x} ${y})`}
              />
            );
          })}
          <circle cx="50" cy="35" r="10" fill={colors.accent} opacity="0.5" />
        </svg>
      </div>

      <div className="absolute bottom-32 right-12 md:right-24" style={{ opacity: opacity * 1.5 }}>
        <svg width="100" height="60" viewBox="0 0 100 60" className="animate-float" style={{ animationDelay: '3s' }}>
          <ellipse cx="50" cy="50" rx="45" ry="8" fill={colors.secondary} opacity="0.3" />
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180;
            const x = 50 + 30 * Math.cos(angle);
            const y = 35 + 20 * Math.sin(angle);
            return (
              <ellipse
                key={i}
                cx={x}
                cy={y}
                rx="12"
                ry="20"
                fill={colors.primary}
                opacity="0.4"
                transform={`rotate(${i * 45} ${x} ${y})`}
              />
            );
          })}
          <circle cx="50" cy="35" r="10" fill={colors.accent} opacity="0.5" />
        </svg>
      </div>

      {/* Peacock Decorations - Bottom */}
      <div className="absolute bottom-8 left-8 hidden md:block" style={{ opacity: opacity * 1.3 }}>
        <svg width="120" height="100" viewBox="0 0 120 100">
          {/* Peacock feather fan */}
          {Array.from({ length: 5 }).map((_, i) => (
            <g key={i} transform={`translate(60, 80) rotate(${-40 + i * 20})`}>
              <ellipse
                cx="0"
                cy="-30"
                rx="8"
                ry="35"
                fill={colors.primary}
                opacity="0.3"
              />
              <circle cx="0" cy="-50" r="6" fill={colors.secondary} opacity="0.4" />
              <circle cx="0" cy="-50" r="3" fill={colors.accent} opacity="0.5" />
            </g>
          ))}
          {/* Peacock body */}
          <ellipse cx="60" cy="85" rx="12" ry="15" fill={colors.primary} opacity="0.4" />
          <circle cx="60" cy="75" r="8" fill={colors.secondary} opacity="0.5" />
        </svg>
      </div>

      <div className="absolute bottom-8 right-8 hidden md:block" style={{ opacity: opacity * 1.3 }}>
        <svg width="120" height="100" viewBox="0 0 120 100" transform="scale(-1, 1)">
          {/* Peacock feather fan */}
          {Array.from({ length: 5 }).map((_, i) => (
            <g key={i} transform={`translate(60, 80) rotate(${-40 + i * 20})`}>
              <ellipse
                cx="0"
                cy="-30"
                rx="8"
                ry="35"
                fill={colors.primary}
                opacity="0.3"
              />
              <circle cx="0" cy="-50" r="6" fill={colors.secondary} opacity="0.4" />
              <circle cx="0" cy="-50" r="3" fill={colors.accent} opacity="0.5" />
            </g>
          ))}
          {/* Peacock body */}
          <ellipse cx="60" cy="85" rx="12" ry="15" fill={colors.primary} opacity="0.4" />
          <circle cx="60" cy="75" r="8" fill={colors.secondary} opacity="0.5" />
        </svg>
      </div>

      {/* Small Flower Decorations - Scattered */}
      {Array.from({ length: 12 }).map((_, i) => {
        const positions = [
          { top: '15%', left: '10%', delay: 0 },
          { top: '20%', right: '15%', delay: 1 },
          { top: '35%', left: '5%', delay: 2 },
          { top: '40%', right: '8%', delay: 1.5 },
          { top: '55%', left: '12%', delay: 0.5 },
          { top: '60%', right: '10%', delay: 2.5 },
          { top: '70%', left: '15%', delay: 1 },
          { top: '75%', right: '12%', delay: 0.3 },
          { top: '25%', left: '25%', delay: 1.8 },
          { top: '30%', right: '22%', delay: 0.7 },
          { top: '50%', left: '20%', delay: 2.2 },
          { top: '65%', right: '18%', delay: 1.3 }
        ];
        const pos = positions[i];
        return (
          <div
            key={i}
            className="absolute animate-float hidden md:block"
            style={{
              ...pos,
              opacity: opacity * 0.8,
              animationDelay: `${pos.delay}s`
            }}
          >
            <svg width="25" height="25" viewBox="0 0 50 50">
              {Array.from({ length: 6 }).map((_, j) => (
                <circle
                  key={j}
                  cx={25 + 12 * Math.cos((j * 60 * Math.PI) / 180)}
                  cy={25 + 12 * Math.sin((j * 60 * Math.PI) / 180)}
                  r="6"
                  fill={j % 2 === 0 ? colors.primary : colors.secondary}
                  opacity="0.3"
                />
              ))}
              <circle cx="25" cy="25" r="5" fill={colors.accent} opacity="0.4" />
            </svg>
          </div>
        );
      })}
    </div>
  );
};

export default TraditionalBackground;
