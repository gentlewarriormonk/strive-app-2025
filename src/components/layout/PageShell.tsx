interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export function PageShell({ children, className = '' }: PageShellProps) {
  return (
    <main className={`flex-1 w-full container mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {children}
    </main>
  );
}

interface PageTitleProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageTitle({ title, subtitle, action }: PageTitleProps) {
  return (
    <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base font-normal text-[#92c0c9]">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}



