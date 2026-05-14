import React from 'react';
import { motion } from 'framer-motion';
import { Camera, ExternalLink } from 'lucide-react';

/**
 * Live Photo Wall teaser inside public invitation — links to the full gallery.
 */
const LivePhotoWallTeaser = ({ slug }) => (
  <section className="px-6 md:px-12 py-16 md:py-20" data-testid="public-lpw-teaser">
    <div className="max-w-3xl mx-auto text-center">
      <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="lux-eyebrow block mb-3">◆ Live Photo Wall</motion.span>
      <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="font-display text-[2rem] md:text-[2.8rem] leading-tight" style={{ color: '#FFF8DC' }}>
        Moments unfold <span className="font-script italic text-gold">in real time</span>
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
        className="mt-4 max-w-xl mx-auto text-sm md:text-base italic" style={{ color: 'rgba(255,248,220,0.7)' }}>
        As the photographer captures the day, the gallery refreshes live. View, favorite, and share.
      </motion.p>
      <motion.a href={`/invite/${slug}/live-gallery`}
        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.35 }}
        whileHover={{ y: -3 }}
        className="lux-btn inline-flex items-center gap-2 mt-6" data-testid="public-lpw-cta">
        <Camera className="w-4 h-4" /> Open live gallery <ExternalLink className="w-3.5 h-3.5" />
      </motion.a>
    </div>
  </section>
);

export default LivePhotoWallTeaser;
