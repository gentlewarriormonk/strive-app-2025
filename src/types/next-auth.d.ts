import 'next-auth';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
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
    role: string;
    schoolId?: string;
    xp: number;
    level: number;
  }
}
