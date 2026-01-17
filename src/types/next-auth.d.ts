import 'next-auth';

type UserRole = 'STUDENT' | 'TEACHER' | 'SCHOOL_ADMIN' | 'PLATFORM_ADMIN';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      schoolId?: string;
      xp: number;
      level: number;
    };
  }

  interface User {
    role?: UserRole;
    schoolId?: string;
    xp?: number;
    level?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    schoolId?: string;
    xp: number;
    level: number;
  }
}
