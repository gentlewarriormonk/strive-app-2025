/**
 * Haptic feedback utilities for mobile devices
 * Provides physical confirmation for actions - use sparingly
 */

// Check if vibration API is available
const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

export const haptic = {
  /** Light tap - for habit completion toggle */
  light: () => canVibrate && navigator.vibrate(10),

  /** Medium tap - general feedback */
  medium: () => canVibrate && navigator.vibrate(25),

  /** Heavy tap - significant actions */
  heavy: () => canVibrate && navigator.vibrate(50),

  /** Double tap - celebrations and milestones */
  double: () => canVibrate && navigator.vibrate([50, 30, 50]),

  /** Success pattern - achievement unlocked */
  success: () => canVibrate && navigator.vibrate([10, 50, 20]),

  /** Error pattern - validation failure */
  error: () => canVibrate && navigator.vibrate([100, 30, 100]),
};

export default haptic;
