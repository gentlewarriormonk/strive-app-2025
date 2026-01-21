/**
 * Animation utilities for Strive
 * CSS-first approach with minimal JavaScript
 *
 * Bundle size: ~2.5kb total
 */

// Re-export all animation utilities
export { haptic } from './haptic';
export { useCountUp } from './useCountUp';
export { usePrefersReducedMotion } from './usePrefersReducedMotion';

// Re-export components
export { CelebrationModal, MILESTONES } from '@/components/ui/CelebrationModal';
export type { Milestone } from '@/components/ui/CelebrationModal';
export { Toast, ToastContainer } from '@/components/ui/Toast';
export type { ToastData } from '@/components/ui/Toast';

/**
 * Helper to generate stagger index CSS variable
 * Usage: style={{ '--stagger-index': index } as React.CSSProperties}
 */
export function staggerIndex(index: number): React.CSSProperties {
  return { '--stagger-index': index } as React.CSSProperties;
}

/**
 * Helper to generate dot index CSS variable for weekly dots
 * Usage: style={dotIndex(i)}
 */
export function dotIndex(index: number): React.CSSProperties {
  return { '--dot-index': index } as React.CSSProperties;
}

/**
 * Helper to generate section index CSS variable
 * Usage: style={sectionIndex(i)}
 */
export function sectionIndex(index: number): React.CSSProperties {
  return { '--section-index': index } as React.CSSProperties;
}

/**
 * Celebration trigger thresholds
 */
export const CELEBRATION_THRESHOLDS = {
  streaks: [7, 14, 21, 30],
  completions: [25, 50, 100, 200],
} as const;

/**
 * Check if a streak value should trigger a celebration
 */
export function shouldCelebrateStreak(streak: number, previousStreak: number): number | null {
  for (const threshold of CELEBRATION_THRESHOLDS.streaks) {
    if (streak >= threshold && previousStreak < threshold) {
      return threshold;
    }
  }
  return null;
}

/**
 * Check if a completion count should trigger a celebration
 */
export function shouldCelebrateCompletions(count: number, previousCount: number): number | null {
  for (const threshold of CELEBRATION_THRESHOLDS.completions) {
    if (count >= threshold && previousCount < threshold) {
      return threshold;
    }
  }
  return null;
}
