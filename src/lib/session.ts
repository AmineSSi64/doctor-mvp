import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

/**
 * Reads the current session on the server. Use this inside Server
 * Components, Server Actions, and Route Handlers — never trust a role
 * or doctorId value that arrives from the client.
 */
export async function getSession() {
  return getServerSession(authOptions);
}

/**
 * Guard for any server-side code that requires a logged-in user.
 * Redirects to /login if there is no session. Returns the session's
 * `user` object (typed, with role + doctorId) when there is one, so
 * callers get authorization data "for free" instead of re-querying it.
 */
export async function requireUser() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user;
}

/**
 * Guard for doctor-only server logic. The MVP only ships the Doctor role,
 * but every mutation should still call this (not just check the UI) so
 * that adding the Assistant role later is a one-line permission change
 * here rather than a rewrite of every action.
 */
export async function requireDoctor() {
  const user = await requireUser();
  if (user.role !== "DOCTOR" || !user.doctorId) {
    redirect("/login");
  }
  return user as typeof user & { doctorId: string };
}
