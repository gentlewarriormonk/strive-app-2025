interface StatsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatsCard({ label, value, subtext, icon, trend }: StatsCardProps) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-[#92c0c9]',
  };

  return (
    <div className="bg-[#101f22] p-4 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon && (
          <span className="material-symbols-outlined text-[#13c8ec]">{icon}</span>
        )}
        <div>
          <p className="font-medium text-white">{label}</p>
          {subtext && (
            <p className={`text-xs ${trend ? trendColors[trend] : 'text-[#92c0c9]'}`}>
              {subtext}
            </p>
          )}
        </div>
      </div>
      <p className="text-2xl font-bold gradient-text">{value}</p>
    </div>
  );
}



