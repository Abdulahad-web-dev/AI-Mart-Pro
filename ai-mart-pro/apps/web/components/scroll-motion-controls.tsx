'use client';
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export function ScrollMotionControls() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setShowBackToTop(latest > 600);
    });
  }, [scrollY]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: shouldReduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <>
      {/* 1. 3px Scroll Progress Bar at very top */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B7A6C] via-[#09665A] to-[#0B7A6C] z-[100] origin-left pointer-events-none"
        style={{ scaleX }}
      />

      {/* 2. Back-to-Top Round Button (Appears after 600px scroll) */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            whileHover={shouldReduceMotion ? {} : { scale: 1.1, y: -2 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={scrollToTop}
            aria-label="Back to top"
            className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-[#171a20] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(23,26,32,0.35)] border border-white/10 hover:bg-[#0B7A6C] transition-colors cursor-pointer group"
          >
            <ArrowUp size={18} className="group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

export default ScrollMotionControls;
