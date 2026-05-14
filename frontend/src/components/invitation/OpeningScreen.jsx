import { useEffect, useState } from 'react';

export const OpeningScreen = ({ design, deity }) => {
  const [line, setLine] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setLine(1), 300),
      setTimeout(() => setLine(2), 1200),
      setTimeout(() => setLine(3), 2000)
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const getBackgroundStyle = () => {
    const styles = {
      temple: 'bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-50',
      royal: 'bg-gradient-to-br from-purple-100 via-pink-50 to-amber-50',
      floral: 'bg-gradient-to-br from-rose-100 via-pink-50 to-green-50',
      divine: 'bg-gradient-to-br from-white via-amber-50 to-gray-50',
      cinematic: 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900',
      scroll: 'bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-50',
      art: 'bg-gradient-to-br from-red-100 via-teal-50 to-purple-50',
      modern: 'bg-gradient-to-br from-blue-100 via-cyan-50 to-pink-50'
    };
    return styles[design] || styles.divine;
  };

  const getTextColor = () => {
    return design === 'cinematic' ? 'text-amber-100' : 'text-gray-700';
  };

  const getDeityText = () => {
    const deities = {
      ganesha: 'ॐ गं गणपतये नमः',
      venkateswara: 'ॐ नमो वेंकटेशाय',
      shiva: 'ॐ नमः शिवाय',
      none: ''
    };
    return deities[deity] || deities.ganesha;
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center ${getBackgroundStyle()} animate-fade-in`}>
      <div className="text-center px-6 max-w-2xl">
        {/* Deity Blessing */}
        {line >= 1 && deity !== 'none' && (
          <div className={`font-traditional text-2xl md:text-3xl ${getTextColor()} mb-8 animate-slide-in-top`}>
            {getDeityText()}
          </div>
        )}

        {/* Main Opening Text */}
        {line >= 2 && (
          <div className={`font-elegant text-3xl md:text-5xl font-semibold ${getTextColor()} mb-4 animate-fade-in-up`}>
            With Divine Blessings
          </div>
        )}

        {line >= 3 && (
          <div className={`font-script text-lg md:text-xl ${getTextColor()} italic animate-scale-in`}>
            We joyfully invite you to celebrate a sacred union
          </div>
        )}

        {/* Decorative Element */}
        {line >= 2 && (
          <div className={`mt-8 flex justify-center gap-3 animate-pulse-soft`}>
            <span className={`text-2xl ${getTextColor()}`}>✦</span>
            <span className={`text-3xl ${getTextColor()}`}>❖</span>
            <span className={`text-2xl ${getTextColor()}`}>✦</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpeningScreen;
