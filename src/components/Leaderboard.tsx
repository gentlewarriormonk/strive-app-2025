import { User } from '@/types/models';

interface LeaderboardEntry {
  user: User;
  value: number;
  label: string;
}

interface LeaderboardProps {
  title: string;
  entries: LeaderboardEntry[];
  valueIcon?: string;
}

export function Leaderboard({ title, entries, valueIcon }: LeaderboardProps) {
  return (
    <div className="bg-[#192f33] rounded-xl p-5 border border-[#325e67]/50">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div
            key={entry.user.id}
            className="flex items-center gap-2 p-3 rounded-lg bg-[#101f22]"
          >
            {/* Rank */}
            <div
              className={`w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
                index === 0
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : index === 1
                  ? 'bg-slate-400/20 text-slate-300'
                  : index === 2
                  ? 'bg-amber-700/20 text-amber-600'
                  : 'bg-slate-700/50 text-slate-400'
              }`}
            >
              {index + 1}
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-[#13c8ec] to-[#3b82f6] flex items-center justify-center text-white text-sm font-bold">
              {entry.user.name.charAt(0)}
            </div>

            {/* Name - truncated */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-white font-medium text-sm truncate" title={entry.user.name}>
                {entry.user.name}
              </p>
              <p className="text-xs text-[#92c0c9]">Lv {entry.user.level}</p>
            </div>

            {/* Value - fixed width to prevent overflow */}
            <div className="flex items-center gap-1 flex-shrink-0 text-[#13c8ec] font-bold text-sm">
              {valueIcon && (
                <span className="material-symbols-outlined !text-base">{valueIcon}</span>
              )}
              <span>{entry.value}</span>
              <span className="text-xs text-[#92c0c9] font-normal hidden sm:inline">{entry.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

