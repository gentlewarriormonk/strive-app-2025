'use client';

import { useState, useEffect, useCallback } from 'react';
import { haptic } from '@/lib/haptic';

export interface Milestone {
  emoji: string;
  title: string;
  message: string;
}

interface CelebrationModalProps {
  milestone: Milestone;
  onDismiss: () => void;
  autoDismissMs?: number;
}

/**
 * Celebration modal for milestone achievements
 * Shows a theatrical celebration with emoji bounce and haptic feedback
 * Auto-dismisses after specified time (default: 5 seconds)
 */
export function CelebrationModal({
  milestone,
  onDismiss,
  autoDismissMs = 5000,
}: CelebrationModalProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    setVisible(false);

    // Wait for exit animation before unmounting
    setTimeout(onDismiss, 300);
  }, [exiting, onDismiss]);

  useEffect(() => {
    // Trigger entrance animation after mount
    requestAnimationFrame(() => setVisible(true));

    // Haptic feedback for celebration
    haptic.double();

    // Auto-dismiss after specified time
    const timer = setTimeout(handleDismiss, autoDismissMs);

    return () => clearTimeout(timer);
  }, [autoDismissMs, handleDismiss]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all ${
        visible ? 'celebration-overlay' : 'opacity-0'
      }`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={handleDismiss}
    >
      <div
        className={`bg-[#192f33] border border-[#325e67] rounded-2xl p-8 max-w-sm w-full text-center shadow-xl ${
          visible ? 'celebration-card' : 'opacity-0 scale-85'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className={`block text-6xl mb-4 ${visible ? 'celebration-emoji' : ''}`}>
          {milestone.emoji}
        </span>

        <h2 className="text-2xl font-black text-white mb-2">{milestone.title}</h2>

        <p className="text-[#92c0c9] text-base leading-relaxed mb-6">
          {milestone.message}
        </p>

        <button
          onClick={handleDismiss}
          className="w-full py-3 px-6 bg-[#13c8ec] text-[#101f22] font-bold rounded-lg hover:bg-[#0ea5c7] transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

/**
 * Predefined milestones based on the animation guidelines
 */
export const MILESTONES = {
  streak7: {
    emoji: '🔥',
    title: '7-Day Streak!',
    message: "You showed up every day this week. That's consistency.",
  },
  streak14: {
    emoji: '⚡',
    title: 'Two Weeks Strong!',
    message: 'Two weeks straight. This is becoming part of who you are.',
  },
  streak30: {
    emoji: '🌟',
    title: 'One Month!',
    message: 'A month of showing up. This habit is yours now.',
  },
  completions25: {
    emoji: '✨',
    title: '25 Check-ins!',
    message: "Twenty-five times you chose this. You're building something real.",
  },
  completions50: {
    emoji: '💪',
    title: 'Halfway to 100!',
    message: "Fifty check-ins. That's not luck — that's identity.",
  },
  completions100: {
    emoji: '🏆',
    title: 'One Hundred!',
    message: "You've proven who you are.",
  },
  completions200: {
    emoji: '👑',
    title: 'Two Hundred!',
    message: 'This is just what you do now.',
  },
} as const;

export default CelebrationModal;
