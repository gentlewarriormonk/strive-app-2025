'use client';

/**
 * PrivacyIndicator - Shows a subtle lock icon for teacher-only or private habits.
 */

type Visibility = 'public' | 'teacher_only' | 'private';

interface PrivacyIndicatorProps {
  visibility: Visibility;
  /** Show label text next to icon */
  showLabel?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
}

export function PrivacyIndicator({ visibility, showLabel = false, size = 'sm' }: PrivacyIndicatorProps) {
  // Only show for non-public habits
  if (visibility === 'public') return null;

  const iconSize = size === 'sm' ? '!text-sm' : '!text-base';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  const config = {
    teacher_only: {
      icon: 'school',
      label: 'Teacher only',
      color: 'text-[#92c0c9]/60',
    },
    private: {
      icon: 'lock',
      label: 'Private',
      color: 'text-[#92c0c9]/60',
    },
  };

  const { icon, label, color } = config[visibility];

  return (
    <div className={`flex items-center gap-1 ${color}`} title={label}>
      <span className={`material-symbols-outlined ${iconSize}`}>{icon}</span>
      {showLabel && <span className={textSize}>{label}</span>}
    </div>
  );
}
