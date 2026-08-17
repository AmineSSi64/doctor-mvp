import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// ----------------------------------------------------------------------------
// Authentication configuration (NextAuth.js / Auth.js v4).
//
// We use the Credentials provider (email + password) because this is the
// simplest mature option for a small clinic app with no external identity
// provider requirement. NextAuth still handles the parts that are easy to
// get wrong if hand-rolled: secure cookie signing, CSRF protection on the
// login form, and session/JWT serialization. We never store or compare
// plaintext passwords — bcrypt.compare runs against a hash created at seed
// time (see prisma/seed.ts) or at signup time.
//
// Session strategy: JWT (not database sessions). This is the recommended
// approach for the Credentials provider and avoids needing a `Session`
// table for the MVP.
// ----------------------------------------------------------------------------

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 hours — a doctor's typical working session
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: { doctor: true },
        });

        if (!user) {
          return null;
        }

        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!passwordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          doctorId: user.doctor?.id ?? null,
        };
      },
    }),
  ],
  callbacks: {
    // Persist role + doctorId on the JWT at login time so every subsequent
    // request can authorize without an extra database round-trip.
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.doctorId = user.doctorId;
      }
      return token;
    },
    // Expose role + doctorId on the session object so Server Components
    // and Server Actions can read `session.user.role` / `.doctorId`.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as "DOCTOR" | "ASSISTANT";
        session.user.doctorId = token.doctorId as string | null;
      }
      return session;
    },
  },
};
