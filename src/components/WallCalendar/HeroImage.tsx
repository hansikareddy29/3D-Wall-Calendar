'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroImageData } from '@/utils/heroImages';

interface HeroImageProps {
  year: number;
  month: number;
  heroData: HeroImageData;
  direction: number;
}

// Left-panel portrait image for landscape calendar layout.
 
export default function HeroImage({ year, month, heroData, direction: _direction }: HeroImageProps) {
  const monthKey = `${year}-${month}`;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={monthKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Hero photo — covers full left panel */}
          <img
            src={heroData.url}
            alt={heroData.alt}
            className="w-full h-full object-cover"
            style={{ 
              objectPosition: 'center center',
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Responsive gradient — blends image seamlessly into calendar panel */}
          <div className="absolute inset-0 pointer-events-none transition-all duration-300">
            {/* Desktop Fade at right side */}
            <div 
              className="hidden sm:block absolute inset-y-0 right-0 w-[15%] bg-gradient-to-r from-transparent to-white"
            />
            {/* Mobile Fade in the bottom */}
            <div 
              className="block sm:hidden absolute inset-x-0 bottom-0 h-[10%] bg-gradient-to-b from-transparent to-white"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
