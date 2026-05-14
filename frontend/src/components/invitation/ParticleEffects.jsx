import { useEffect, useState } from 'react';

export const ParticleEffects = ({ design }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const handleTouch = (e) => {
      const touch = e.touches?.[0] || e;
      createParticle(touch.clientX, touch.clientY);
    };

    const handleMouseMove = (e) => {
      if (Math.random() > 0.95) { // Only create particles occasionally on mouse move
        createParticle(e.clientX, e.clientY);
      }
    };

    const createParticle = (x, y) => {
      const id = Date.now() + Math.random();
      const particle = {
        id,
        x,
        y,
        char: getParticleChar()
      };

      setParticles((prev) => [...prev.slice(-20), particle]); // Keep max 20 particles

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== id));
      }, 2000);
    };

    const getParticleChar = () => {
      const chars = {
        temple: ['✦', '❀', '✧', '⚛'],
        royal: ['♔', '❖', '✦', '◈'],
        floral: ['❀', '✿', '🌸', '🌺'],
        divine: ['✦', '✧', '◆', '❖'],
        cinematic: ['✦', '★', '✧', '◆'],
        scroll: ['✦', '❖', '◈', '✧'],
        art: ['❀', '✦', '◆', '⚛'],
        modern: ['✦', '◆', '✧', '●']
      };

      const designChars = chars[design] || chars.divine;
      return designChars[Math.floor(Math.random() * designChars.length)];
    };

    // Touch events for mobile
    window.addEventListener('touchstart', handleTouch);
    // Mouse events for desktop
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [design]);

  const getParticleColor = () => {
    const colors = {
      temple: 'text-orange-400',
      royal: 'text-purple-400',
      floral: 'text-pink-400',
      divine: 'text-amber-400',
      cinematic: 'text-amber-300',
      scroll: 'text-amber-500',
      art: 'text-red-400',
      modern: 'text-blue-400'
    };
    return colors[design] || colors.divine;
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute text-2xl ${getParticleColor()} animate-float-petal`}
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {particle.char}
        </div>
      ))}
    </div>
  );
};

export default ParticleEffects;
