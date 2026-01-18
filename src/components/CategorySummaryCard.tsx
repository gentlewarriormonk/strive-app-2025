import { HabitCategory, getCategoryConfig } from '@/types/models';

interface CategorySummaryCardProps {
  category: HabitCategory;
  avgCompletion: number;
  longestStreak: number;
}

export function CategorySummaryCard({
  category,
  avgCompletion,
  longestStreak,
}: CategorySummaryCardProps) {
  const config = getCategoryConfig(category);

  return (
    <div className="flex items-center gap-4 rounded-xl p-4 bg-[#192f33]">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${config.bgColor}`}>
        <span className={`material-symbols-outlined text-2xl ${config.color}`}>
          {config.icon}
        </span>
      </div>
      <div className="flex flex-col">
        <p className="text-white text-base font-bold">{category}</p>
        <p className="text-[#92c0c9] text-sm">Avg. Completion: {avgCompletion}%</p>
        <p className="text-[#92c0c9] text-sm">Longest Streak: {longestStreak} days</p>
      </div>
    </div>
  );
}



