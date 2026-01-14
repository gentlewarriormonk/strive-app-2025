import Link from 'next/link';

interface StudentRowProps {
  id: string;
  name: string;
  activeHabits: number;
  recentCompletion: number;
  bestStreak: number;
  xp: number;
  level: number;
  challengesJoined: number;
}

export function StudentRow({
  id,
  name,
  activeHabits,
  recentCompletion,
  bestStreak,
  xp,
  level,
  challengesJoined,
}: StudentRowProps) {
  // Calculate XP progress for level bar
  const maxXPForDisplay = 100;
  const xpProgress = Math.min((xp % 500) / 5, maxXPForDisplay);

  return (
    <Link
      href={`/teacher/students/${id}`}
      className="table-row cursor-pointer transition-colors hover:bg-[#192f33]"
    >
      <td className="table-col-name h-[72px] px-4 py-2 text-sm font-normal text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#13c8ec] to-[#3b82f6] flex items-center justify-center text-white text-sm font-bold">
            {name.charAt(0)}
          </div>
          {name}
        </div>
      </td>
      <td className="table-col-habits h-[72px] px-4 py-2 text-sm font-normal text-[#92c0c9]">
        {activeHabits}
      </td>
      <td className="table-col-completion h-[72px] px-4 py-2 text-sm font-normal text-[#92c0c9]">
        <span className={recentCompletion >= 80 ? 'text-green-400' : recentCompletion >= 60 ? 'text-yellow-400' : 'text-red-400'}>
          {recentCompletion}%
        </span>
      </td>
      <td className="table-col-streak h-[72px] px-4 py-2 text-sm font-normal text-[#92c0c9]">
        {bestStreak > 0 && (
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined !text-base text-[#F5A623]">local_fire_department</span>
            {bestStreak} days
          </span>
        )}
      </td>
      <td className="table-col-xp h-[72px] px-4 py-2 text-sm font-normal">
        <div className="flex items-center gap-3">
          <div className="w-24 overflow-hidden rounded-full bg-[#325e67]">
            <div
              className="h-1.5 rounded-full bg-[#13c8ec]"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="text-sm font-medium text-white">Lv {level}</p>
        </div>
      </td>
      <td className="table-col-challenges h-[72px] px-4 py-2 text-sm font-normal text-[#92c0c9]">
        {challengesJoined}
      </td>
    </Link>
  );
}



