export { default } from "next-auth/middleware";

// Any route matched here requires a valid NextAuth session; unauthenticated
// requests are redirected to /login automatically. This is the outer layer
// of protection — individual Server Actions still re-check the session
// themselves (see lib/session.ts) because a route being reachable is not
// the same as an action being authorized.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/patients/:path*",
    "/appointments/:path*",
    "/consultations/:path*",
    "/prescriptions/:path*",
  ],
};
