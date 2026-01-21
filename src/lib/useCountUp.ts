'use client';

import { useState, useEffect } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Hook for animating a number counting up
 * CSS cannot interpolate numeric values, so this requires JavaScript
 *
 * @param target - The target number to count up to
 * @param duration - Animation duration in ms (default: 800)
 * @returns The current displayed number
 */
export function useCountUp(target: number, duration: number = 800): number {
  const [count, setCount] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion) {
      setCount(target);
      return;
    }

    if (target === 0) {
      setCount(0);
      return;
    }

    // Shorter duration for small numbers
    const actualDuration = target < 10 ? 300 : duration;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / actualDuration, 1);

      // Ease-out curve: 1 - (1 - progress)^3
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, prefersReducedMotion]);

  return count;
}

export default useCountUp;
