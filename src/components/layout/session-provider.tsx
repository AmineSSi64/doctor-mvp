"use client";

import { SessionProvider } from "next-auth/react";

// Thin client-side wrapper so Server Components (the rest of the app)
// don't need the "use client" boundary just to get session context.
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
