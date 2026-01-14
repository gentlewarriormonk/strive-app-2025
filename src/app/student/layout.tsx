import { currentStudent } from '@/lib/mockData';
import { AppHeader } from '@/components/layout/AppHeader';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#101f22] overflow-x-hidden">
      <AppHeader user={currentStudent} showStudentNav />
      {children}
    </div>
  );
}



