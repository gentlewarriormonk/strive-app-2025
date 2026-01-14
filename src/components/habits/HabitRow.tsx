'use client';

import { Habit, HabitStats, CATEGORY_CONFIG } from '@/types/models';
import { useState } from 'react';

interface HabitRowProps {
  habit: Habit;
  stats: HabitStats;
  isCompletedToday: boolean;
  onToggleComplete?: () => void;
  onEdit?: () => void;
}

export function HabitRow({
  habit,
  stats,
  isCompletedToday,
  onToggleComplete,
  onEdit,
}: HabitRowProps) {
  const [completed, setCompleted] = useState(isCompletedToday);
  const categoryConfig = CATEGORY_CONFIG[habit.category];

  const handleToggle = () => {
    setCompleted(!completed);
    onToggleComplete?.();
  };

  return (
    <div className="bg-[#192f33] rounded-xl shadow-sm p-4 flex items-center gap-4 card-hover">
      {/* Category Icon */}
      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${categoryConfig.bgColor}`}>
        <span className={`material-symbols-outlined ${categoryConfig.color}`}>
          {categoryConfig.icon}
        </span>
      </div>

      {/* Habit Info */}
      <div className="flex-1 min-w-0">
        <p className="text-base font-medium text-white truncate">{habit.name}</p>
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-[#92c0c9] mt-1">
          {stats.currentStreak > 0 && (
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined !text-base text-[#F5A623]">
                local_fire_department
              </span>
              <span>{stats.currentStreak}-day streak</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined !text-base">donut_small</span>
            <span>{stats.completionsThisWeek}/7 this week</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={completed}
          onChange={handleToggle}
          className="habit-checkbox"
          aria-label={`Mark ${habit.name} as ${completed ? 'incomplete' : 'complete'}`}
        />
        {onEdit && (
          <button
            onClick={onEdit}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#92c0c9] hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Edit habit"
          >
            <span className="material-symbols-outlined !text-lg">edit</span>
          </button>
        )}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full text-[#92c0c9]/40 cursor-not-allowed"
          aria-label="More options"
          aria-disabled="true"
          title="Coming soon"
        >
          <span className="material-symbols-outlined !text-lg">more_vert</span>
        </button>
      </div>
    </div>
  );
}

