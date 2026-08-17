import { Role } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

// Augments NextAuth's built-in types with our custom session/JWT fields
// (role, doctorId) so they are type-checked everywhere they're used.

declare module "next-auth" {
  interface User {
    role: Role;
    doctorId: string | null;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: Role;
      doctorId: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    doctorId: string | null;
  }
}
