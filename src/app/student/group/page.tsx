import { PageShell } from '@/components/layout/PageShell';
import { StudentCard } from '@/components/students/StudentCard';
import {
  groups,
  getGroupMembers,
  getUserById,
  getHabitStats,
  getUserHabits,
} from '@/lib/mockData';

export default function StudentGroupPage() {
  const group = groups[0]; // Grade 7 Advisory
  const members = getGroupMembers(group.id);
  const teacher = getUserById(group.teacherId);

  // Get student members only
  const students = members.filter((m) => m.role === 'STUDENT');

  // Calculate badges for each member
  const getMemberBadge = (userId: string) => {
    const habits = getUserHabits(userId);
    if (habits.length === 0) return undefined;

    const stats = habits.map((h) => getHabitStats(h.id));
    const bestStreak = Math.max(...stats.map((s) => s.longestStreak));
    const avgCompletion =
      stats.reduce((sum, s) => sum + s.completionRate, 0) / stats.length;

    // Determine best category
    const categoryCounts: Record<string, number> = {};
    habits.forEach((h) => {
      const s = getHabitStats(h.id);
      if (s.currentStreak >= 5) {
        categoryCounts[h.category] = (categoryCounts[h.category] || 0) + s.currentStreak;
      }
    });

    const bestCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

    if (bestStreak >= 15) {
      return {
        icon: 'local_fire_department',
        text: `Best Streak: ${bestStreak} days`,
        color: 'bg-yellow-400/20 text-yellow-300',
      };
    }

    if (bestCategory) {
      const categoryIcons: Record<string, { icon: string; color: string }> = {
        Sleep: { icon: 'bedtime', color: 'bg-blue-400/20 text-blue-300' },
        Movement: { icon: 'directions_run', color: 'bg-red-400/20 text-red-300' },
        'Focus & Study': { icon: 'menu_book', color: 'bg-purple-400/20 text-purple-300' },
        'Mindfulness & Emotion': { icon: 'spa', color: 'bg-green-400/20 text-green-300' },
        'Social & Connection': { icon: 'groups', color: 'bg-orange-400/20 text-orange-300' },
        'Nutrition & Hydration': { icon: 'water_drop', color: 'bg-teal-400/20 text-teal-300' },
        'Digital Hygiene': { icon: 'phone_android', color: 'bg-indigo-400/20 text-indigo-300' },
      };
      const config = categoryIcons[bestCategory[0]] || { icon: 'star', color: 'bg-gray-400/20 text-gray-300' };
      return {
        icon: config.icon,
        text: `Consistent in '${bestCategory[0].split(' ')[0]}'`,
        color: config.color,
      };
    }

    if (bestStreak >= 5) {
      return {
        icon: 'local_fire_department',
        text: `Best Streak: ${bestStreak} days`,
        color: 'bg-yellow-400/20 text-yellow-300',
      };
    }

    return undefined;
  };

  return (
    <PageShell>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              {group.name}
            </h1>
            <p className="text-[#92c0c9] text-base">{group.description}</p>
            <p className="text-slate-500 text-sm max-w-2xl">
              You can see only the habits your classmates and teacher choose to share with this group.
            </p>
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Teacher Card (highlighted) */}
          {teacher && (
            <StudentCard
              user={teacher}
              badge={getMemberBadge(teacher.id)}
              isTeacher
            />
          )}

          {/* Student Cards */}
          {students.map((student) => (
            <StudentCard
              key={student.id}
              user={student}
              badge={getMemberBadge(student.id)}
            />
          ))}
        </div>

        {/* Footer Info */}
        <footer className="flex flex-col gap-8 px-5 py-10 text-center mt-12 border-t border-white/10">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <a href="#" className="text-slate-400 hover:text-[#13c8ec] text-sm font-medium transition-colors">
              About
            </a>
            <a href="#" className="text-slate-400 hover:text-[#13c8ec] text-sm font-medium transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-slate-400 hover:text-[#13c8ec] text-sm font-medium transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-slate-400 hover:text-[#13c8ec] text-sm font-medium transition-colors">
              Contact
            </a>
          </div>
          <p className="text-slate-500 text-sm">© 2024 Strive. All rights reserved.</p>
        </footer>
      </div>
    </PageShell>
  );
}



