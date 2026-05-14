import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles } from 'lucide-react';
import WaxSealOpening from '@/components/luxury/WaxSealOpening';
import PetalConfetti from '@/components/luxury/PetalConfetti';
import AmbientMusicPlayer from '@/components/luxury/AmbientMusicPlayer';
import AIStoryComposer from '@/components/luxury/AIStoryComposer';
import '@/styles/luxury.css';

/**
 * Luxury Preview Page
 * Showcases all the cinematic premium components:
 *   - Wax-seal unfolding intro
 *   - Petal confetti burst
 *   - Ambient music player
 *   - AI Story Composer
 *
 * Lives at /preview/luxe — public, no auth required.
 */
const LuxuryPreview = () => {
  const navigate = useNavigate();
  const [petalTrigger, setPetalTrigger] = useState(0);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add('luxe', 'luxe-grain', 'luxe-vignette');
    return () => document.body.classList.remove('luxe', 'luxe-grain', 'luxe-vignette');
  }, []);

  return (
    <WaxSealOpening monogram="A & R" subtitle="A glimpse of the experience" ctaLabel="Open Preview" storageKey="luxe-preview-opened">
      <div className="luxe min-h-screen relative" data-testid="luxury-preview">
        <motion.button
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
          onClick={() => navigate('/')}
          className="absolute top-8 left-8 z-20 flex items-center gap-2 text-xs tracking-[0.25em] uppercase"
          style={{ color: 'rgba(255,248,220,0.65)' }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Studio
        </motion.button>

        <div className="px-6 md:px-16 pt-32 pb-24 max-w-5xl mx-auto relative z-10">
          <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.9 }}
            className="lux-eyebrow block mb-6">◆ Cinematic Components Live Demo</motion.span>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[3rem] md:text-[5.4rem] leading-[0.98] tracking-tight" style={{ color: '#FFF8DC' }}>
            Anaya <span className="text-gold italic font-script">&</span> Rohan
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 1 }}
            className="mt-6 max-w-xl text-[1.05rem] leading-relaxed" style={{ color: 'rgba(255,248,220,0.7)' }}>
            December 14, 2026 · Udaipur. A Royal Mughal celebration spanning four days of music, mehndi, vows, and feast.
          </motion.p>

          <div className="lux-hairline my-12" />

          {/* Demo controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }}
              className="lux-glass p-7">
              <div className="lux-eyebrow mb-3">◆ Micro Interaction</div>
              <h3 className="font-display text-2xl mb-2" style={{ color: '#FFF8DC' }}>Flower Petal Burst</h3>
              <p className="text-sm mb-5" style={{ color: 'rgba(255,248,220,0.6)' }}>
                Plays on RSVP confirmation. Slow, dignified, never gaming-flashy.
              </p>
              <button onClick={() => setPetalTrigger(Date.now())} className="lux-btn" data-testid="trigger-petals">
                <Heart className="w-4 h-4" /> Trigger Petals
              </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95, duration: 0.8 }}
              className="lux-glass p-7">
              <div className="lux-eyebrow mb-3">◆ AI Composer</div>
              <h3 className="font-display text-2xl mb-2" style={{ color: '#FFF8DC' }}>Claude Sonnet 4.5</h3>
              <p className="text-sm mb-5" style={{ color: 'rgba(255,248,220,0.6)' }}>
                Cinematic Indian wedding prose — invitations, vows, event copy.
              </p>
              <button onClick={() => setAiOpen(true)} className="lux-btn" data-testid="open-ai-composer">
                <Sparkles className="w-4 h-4" /> Compose a Story
              </button>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.8 }}
            className="lux-glass p-7 mt-5">
            <div className="lux-eyebrow mb-3">◆ Ambient Music</div>
            <h3 className="font-display text-2xl mb-2" style={{ color: '#FFF8DC' }}>Persistent Background Score</h3>
            <p className="text-sm" style={{ color: 'rgba(255,248,220,0.6)' }}>
              Click the gold pill in the bottom-right to play. Hover to expand the status indicator.
              Music persists across scroll, never breaking the spell.
            </p>
          </motion.div>
        </div>

        <PetalConfetti trigger={petalTrigger} count={40} duration={5000} />
        <AmbientMusicPlayer src="https://cdn.pixabay.com/audio/2023/03/14/audio_4abf1fcc1f.mp3" defaultVolume={0.35} />
        <AIStoryComposer open={aiOpen} onClose={() => setAiOpen(false)} defaults={{ bride: 'Anaya', groom: 'Rohan', theme: 'royal_mughal' }} />
      </div>
    </WaxSealOpening>
  );
};

export default LuxuryPreview;
