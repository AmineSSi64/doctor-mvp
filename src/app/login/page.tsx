import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "@/features/auth/login-form";
import { LoginVisual } from "@/features/auth/login-visual";
import { Logo, APP_NAME } from "@/components/ui/logo";

export default async function LoginPage() {
  const session = await getSession();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="grid min-h-screen bg-bg lg:grid-cols-2">
      <LoginVisual />

      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex animate-fade-in-up flex-col items-center gap-3 lg:hidden">
            <Logo size={44} />
            <div className="text-center">
              <h1 className="text-lg font-semibold tracking-tight text-ink">{APP_NAME}</h1>
            </div>
          </div>

          <div className="hidden text-center lg:block">
            <h1 className="animate-fade-in-up text-xl font-semibold tracking-tight text-ink">
              Welcome back
            </h1>
          </div>
          <p className="mt-1 hidden animate-fade-in-up text-center text-sm text-ink-muted lg:block">
            Sign in to manage your practice
          </p>
          <p className="mb-6 animate-fade-in-up text-center text-sm text-ink-muted lg:hidden">
            Sign in to manage your practice
          </p>

          <div className="mt-6 animate-scale-in rounded-xl border border-border bg-surface p-6 shadow-panel">
            <LoginForm />
          </div>

          <div className="mt-4 animate-fade-in-up rounded-md border border-border bg-surface-alt px-4 py-3 text-xs text-ink-muted">
            <p className="font-medium text-ink">Demo account (development only)</p>
            <p className="mt-1 font-mono">doctor@demo.local</p>
            <p className="font-mono">demo1234</p>
          </div>
        </div>
      </div>
    </div>
  );
}
