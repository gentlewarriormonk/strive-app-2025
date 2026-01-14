interface SectionCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export function SectionCard({
  children,
  title,
  className = '',
  padding = 'lg',
}: SectionCardProps) {
  return (
    <div
      className={`bg-[#192f33] rounded-xl border border-[#325e67]/50 shadow-sm ${paddingClasses[padding]} ${className}`}
    >
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}



