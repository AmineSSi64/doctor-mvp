import { Logo, APP_NAME } from "@/components/ui/logo";
import { AmbientRings } from "@/components/ui/ambient-rings";
import { CalendarCheck, Users } from "lucide-react";

/**
 * The login page left-side visual — an abstract, non-anatomical gradient
 * composition using ambient rings and two restrained floating info chips.
 * It sets the premium clinical SaaS tone without turning the login screen
 * into a marketing page. Desktop only; hidden on mobile where the form
 * takes priority.
 */
export function LoginVisual() {
  return (
    <div className="relative hidden h-full w-full overflow-hidden bg-gradient-sidebar lg:flex lg:flex-col lg:justify-between lg:p-10">
      <div
        className="bg-glow-brand pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      <AmbientRings
        light
        className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] animate-float-slow"
      />

      <AmbientRings
        light
        className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 animate-float-slower"
      />

      <div className="relative flex animate-fade-in items-center gap-2.5">
        <Logo size={30} />
        <span className="text-[15px] font-semibold tracking-tight text-white">
          {APP_NAME}
        </span>
      </div>

      <div
        className="relative animate-fade-in-up"
        style={{ animationDelay: "80ms" }}
      >
        <p className="max-w-sm text-2xl font-semibold leading-snug tracking-tight text-white">
          Everything your practice needs, in one calm place.
        </p>

        <p className="mt-3 max-w-sm text-sm text-white/70">
          Patients, appointments, and consultations — organized, searchable,
          and ready before you walk in the room.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <div
            className="flex w-fit animate-fade-in-up items-center gap-2.5 rounded-lg border border-white/15 bg-white/10 px-3.5 py-2.5 text-sm text-white backdrop-blur-sm"
            style={{ animationDelay: "180ms" }}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/15">
              <CalendarCheck className="h-4 w-4" strokeWidth={2} />
            </span>
            Todays schedule, at a glance
          </div>

          <div
            className="flex w-fit animate-fade-in-up items-center gap-2.5 rounded-lg border border-white/15 bg-white/10 px-3.5 py-2.5 text-sm text-white backdrop-blur-sm"
            style={{ animationDelay: "260ms" }}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/15">
              <Users className="h-4 w-4" strokeWidth={2} />
            </span>
            Every patients history, one click away
          </div>
        </div>
      </div>
    </div>
  );
}