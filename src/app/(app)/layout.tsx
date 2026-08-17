import { requireDoctor } from "@/lib/session";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ToastProvider } from "@/components/ui/toast-provider";

// Every route under the (app) group is a real page a signed-in doctor
// uses day to day. requireDoctor() re-checks the session server-side on
// every navigation — middleware.ts is the first line of defense, this is
// the second, and it's the one that actually has access to `role`/`doctorId`
// for the pages/actions that need them.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireDoctor();

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-bg">
        <Sidebar userName={user.name ?? "Doctor"} />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar userName={user.name ?? "Doctor"} />
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
        </div>
        <MobileNav />
      </div>
    </ToastProvider>
  );
}
