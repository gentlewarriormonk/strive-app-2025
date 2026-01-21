import { redirect } from 'next/navigation';

/**
 * Teacher root page - redirects to My Habits
 * Teachers land on their own habits first (lead by example)
 */
export default function TeacherPage() {
  redirect('/teacher/habits');
}
