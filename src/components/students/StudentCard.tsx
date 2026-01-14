import Link from 'next/link';
import { User, getXPForNextLevel } from '@/types/models';

interface StudentCardProps {
  user: User;
  badge?: { icon: string; text: string; color: string };
  isTeacher?: boolean;
}

export function StudentCard({ user, badge, isTeacher = false }: StudentCardProps) {
  const nextLevelXP = getXPForNextLevel(user.level);
  const currentLevelXP = user.level > 1 ? getXPForNextLevel(user.level - 1) : 0;
  const progressPercent = ((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return (
    <Link
      href={`/student/profile/${user.id}`}
      className={`group flex flex-col gap-4 rounded-xl bg-slate-900/50 p-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 ${
        isTeacher
          ? 'border border-[#13c8ec]/40 hover:border-[#13c8ec]'
          : 'border border-white/10 hover:border-[#13c8ec]/50'
      }`}
    >
      {/* User Info */}
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full bg-gradient-to-br from-[#13c8ec] to-[#3b82f6] flex items-center justify-center text-white text-xl font-bold"
        >
          {user.name.charAt(0)}
        </div>
        <div className="flex flex-col">
          <p className="text-white text-lg font-bold">{user.name}</p>
          <p className="text-slate-400 text-sm">{isTeacher ? 'Teacher' : 'Student'}</p>
        </div>
      </div>

      {/* Level Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-baseline">
          <p className="text-sm font-semibold text-[#13c8ec]">Level {user.level}</p>
          <p className="text-xs text-slate-400">
            {user.xp} / {nextLevelXP} XP
          </p>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-[#13c8ec] h-2 rounded-full transition-all"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Badge */}
      {badge && (
        <div className={`flex items-center gap-3 rounded-lg ${badge.color} p-3 mt-auto`}>
          <span className="material-symbols-outlined">{badge.icon}</span>
          <p className="text-sm font-medium">{badge.text}</p>
        </div>
      )}
    </Link>
  );
}



