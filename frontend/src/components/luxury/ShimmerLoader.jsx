import React from 'react';

/**
 * ShimmerLoader — luxe gold shimmer skeleton block.
 */
const ShimmerLoader = ({ className = '', style = {}, rounded = '0.6rem' }) => (
  <div
    className={`relative overflow-hidden ${className}`}
    style={{
      background: 'rgba(255,248,220,0.04)',
      borderRadius: rounded,
      ...style,
    }}
  >
    <div
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.18) 50%, transparent 100%)',
        animation: 'lux-shimmer-line 1.8s linear infinite',
      }}
    />
  </div>
);

export default ShimmerLoader;
