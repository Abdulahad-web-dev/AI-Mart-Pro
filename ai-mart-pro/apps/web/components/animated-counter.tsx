'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

export interface AnimatedCounterProps {
  value: number | string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1.2,
  className = ''
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const shouldReduceMotion = useReducedMotion();

  // Parse numeric value, prefix, suffix, and formatting
  const strVal = String(value ?? '0');
  const match = strVal.match(/^([^\d\-+]*)([\d,.]+)(.*)$/);

  let prefix = '';
  let suffix = '';
  let targetNumber = 0;
  let isFloat = false;
  let decimals = 0;
  let hasCommas = false;

  if (match) {
    prefix = match[1] || '';
    const numPart = match[2] || '0';
    suffix = match[3] || '';

    hasCommas = numPart.includes(',');
    const cleanNum = numPart.replace(/,/g, '');
    targetNumber = parseFloat(cleanNum);

    if (numPart.includes('.')) {
      isFloat = true;
      decimals = numPart.split('.')[1]?.length || 1;
    }
  } else {
    // Pure fallback if no numbers found
    return <span className={className}>{strVal}</span>;
  }

  const [currentVal, setCurrentVal] = useState(shouldReduceMotion ? targetNumber : 0);

  useEffect(() => {
    if (!isInView || shouldReduceMotion || isNaN(targetNumber)) {
      setCurrentVal(targetNumber);
      return;
    }

    let start = 0;
    const startTime = performance.now();
    const durationMs = duration * 1000;

    let frameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = start + (targetNumber - start) * ease;

      setCurrentVal(val);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setCurrentVal(targetNumber);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, targetNumber, duration, shouldReduceMotion]);

  // Format number with commas or decimals
  let formattedNumber = '';
  if (isFloat) {
    formattedNumber = currentVal.toFixed(decimals);
  } else {
    formattedNumber = Math.round(currentVal).toString();
  }

  if (hasCommas) {
    const parts = formattedNumber.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    formattedNumber = parts.join('.');
  }

  return (
    <span ref={ref} className={className}>
      {prefix}{formattedNumber}{suffix}
    </span>
  );
}

export default AnimatedCounter;
