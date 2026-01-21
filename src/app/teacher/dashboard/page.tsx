import { redirect } from 'next/navigation';

/**
 * Dashboard page - redirects to My Habits
 * The old Dashboard showing groups is no longer needed since
 * groups are accessible directly from the sidebar.
 */
export default function DashboardPage() {
  redirect('/teacher/habits');
}
