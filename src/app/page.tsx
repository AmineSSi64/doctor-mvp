import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

// Root route just forwards to the right place — keeps every actual
// page under an explicit, bookmarkable path.
export default async function RootPage() {
  const session = await getSession();
  redirect(session?.user ? "/dashboard" : "/login");
}
