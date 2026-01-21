'use client';

/**
 * WeeklyDots - Shows 7 dots representing the current week (Mon-Sun).
 * Filled dots = completed, empty dots = not completed.
 * Today is highlighted with a ring.
 */

interface WeeklyDotsProps {
  /** Array of 7 booleans representing Mon-Sun completion status */
  completions: boolean[];
  /** Index of today (0-6, where 0 = Monday) */
  todayIndex: number;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Enable entrance animation */
  animate?: boolean;
}

export function WeeklyDots({ completions, todayIndex, size = 'md', animate = false }: WeeklyDotsProps) {
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';
  const gap = size === 'sm' ? 'gap-1' : 'gap-1.5';

  return (
    <div className={`flex items-center ${gap}`}>
      {completions.map((completed, index) => (
        <div
          key={index}
          className={`${dotSize} rounded-full ${
            completed
              ? 'bg-[#13c8ec]'
              : 'bg-[#325e67]/50'
          } ${
            index === todayIndex
              ? 'ring-2 ring-[#13c8ec]/50 ring-offset-1 ring-offset-[#192f33]'
              : ''
          } ${animate ? 'dot-animate' : ''}`}
          style={animate ? { '--dot-index': index } as React.CSSProperties : undefined}
          title={`${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}${index === todayIndex ? ' (Today)' : ''}: ${completed ? 'Completed' : 'Not completed'}`}
        />
      ))}
    </div>
  );
}

/**
 * MiniWeekDots - Compact version for Progress/Journey page habit cards.
 * Shows just dots without labels.
 */
interface MiniWeekDotsProps {
  completions: boolean[];
  todayIndex: number;
}

export function MiniWeekDots({ completions, todayIndex }: MiniWeekDotsProps) {
  return (
    <div className="flex items-center gap-0.5">
      {completions.map((completed, index) => (
        <div
          key={index}
          className={`w-1.5 h-1.5 rounded-full ${
            completed ? 'bg-[#13c8ec]' : 'bg-[#325e67]/50'
          } ${
            index === todayIndex ? 'ring-1 ring-[#13c8ec]/50' : ''
          }`}
        />
      ))}
    </div>
  );
}

/**
 * Helper function to get the current week's data
 */
export function getWeekData(dailyData: { date: string; completed: boolean }[]): {
  completions: boolean[];
  todayIndex: number;
} {
  const today = new Date();
  const dayOfWeek = today.getDay();
  // Convert to Monday-based index (0 = Monday, 6 = Sunday)
  const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // Get start of current week (Monday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - todayIndex);
  startOfWeek.setHours(0, 0, 0, 0);

  // Create a map of dates to completion status
  const completionMap = new Map<string, boolean>();
  dailyData.forEach(d => {
    completionMap.set(d.date, d.completed);
  });

  // Build array for Mon-Sun
  const completions: boolean[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    completions.push(completionMap.get(dateStr) || false);
  }

  return { completions, todayIndex };
}
