import { Challenge, ChallengeParticipation } from '@/types/models';

interface ChallengeCardProps {
  challenge: Challenge;
  participation?: ChallengeParticipation;
  compact?: boolean;
}

export function ChallengeCard({ challenge, participation, compact = false }: ChallengeCardProps) {
  const progress = participation?.progress || 0;
  const progressPercent = Math.min((progress / challenge.targetValue) * 100, 100);
  const isCompleted = participation?.isCompleted || false;

  if (compact) {
    return (
      <div className="flex flex-col gap-2">
        <p className="font-medium text-white">{challenge.name}</p>
        <div className="flex items-center gap-2">
          <div className="w-full bg-[#325e67] rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isCompleted ? 'bg-green-400' : 'bg-[#F5A623]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono text-[#92c0c9] whitespace-nowrap">
            {progress}/{challenge.targetValue}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#192f33] rounded-xl p-5 border border-[#325e67]/50 card-hover">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h4 className="text-lg font-bold text-white">{challenge.name}</h4>
          {challenge.description && (
            <p className="text-sm text-[#92c0c9] mt-1">{challenge.description}</p>
          )}
        </div>
        {isCompleted && (
          <span className="flex items-center gap-1 text-green-400 text-sm font-medium">
            <span className="material-symbols-outlined !text-lg">check_circle</span>
            Completed
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-[#92c0c9] mb-4">
        {challenge.targetCategory && (
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined !text-base">category</span>
            {challenge.targetCategory}
          </span>
        )}
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined !text-base">calendar_today</span>
          {new Date(challenge.endDate).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined !text-base text-[#F5A623]">stars</span>
          {challenge.rewardXp} XP
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#92c0c9]">Progress</span>
          <span className="font-medium text-white">
            {progress} / {challenge.targetValue}{' '}
            {challenge.targetType === 'STREAK_DAYS' ? 'days' : 'completions'}
          </span>
        </div>
        <div className="w-full bg-[#325e67] rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              isCompleted ? 'bg-green-400' : 'bg-gradient-to-r from-[#13c8ec] to-[#3b82f6]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {!participation && (
        <button className="mt-4 w-full btn-secondary text-sm">
          <span className="material-symbols-outlined !text-lg mr-2">add</span>
          Join Challenge
        </button>
      )}
    </div>
  );
}



