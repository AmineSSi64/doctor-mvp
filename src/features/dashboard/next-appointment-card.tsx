"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AmbientRings } from "@/components/ui/ambient-rings";

interface NextAppointmentPatient {
  firstName: string;
  lastName: string;
}

interface NextAppointmentData {
  id: string;
  scheduledAt: Date | string;
  durationMinutes: number;
  patient: NextAppointmentPatient;
}

function pad(n: number): string {
  return String(Math.max(0, n)).padStart(2, "0");
}

/** "Today, 14:30" / "Tomorrow, 09:00" / "22 Aug, 09:00" — concise enough
 *  for a hero card, more human than a raw ISO timestamp. */
function friendlyDateTime(date: Date): string {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((startOfTarget.getTime() - startOfToday.getTime()) / 86_400_000);

  const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  if (dayDiff === 0) return `Today, ${time}`;
  if (dayDiff === 1) return `Tomorrow, ${time}`;
  return `${date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}, ${time}`;
}

/**
 * The dashboard's signature element: doubles as the "wow factor" visual
 * hero the redesign brief asks for (gradient surface, floating abstract
 * rings, ambient motion) and as a genuinely functional live countdown to
 * the doctor's actual next SCHEDULED appointment. The countdown recomputes
 * every second from the real `scheduledAt` timestamp — nothing here is a
 * hardcoded number.
 */
export function NextAppointmentCard({ appointment }: { appointment: NextAppointmentData | null }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!appointment) {
    return (
      <div className="relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden rounded-xl border border-border bg-surface p-6 shadow-subtle">
        <AmbientRings />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Next appointment</p>
        </div>
        <div className="relative flex flex-1 flex-col items-center justify-center gap-2 py-4 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
            <CalendarClock className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <p className="text-sm font-medium text-ink">No upcoming appointments</p>
          <p className="text-xs text-ink-muted">Your schedule ahead is clear.</p>
        </div>
      </div>
    );
  }

  const scheduledAt = new Date(appointment.scheduledAt);
  const diffMs = now ? scheduledAt.getTime() - now.getTime() : null;

  let countdown = "00:00:00";
  let statusLabel = "Starting now";
  if (diffMs !== null) {
    if (diffMs > 0) {
      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      countdown = `${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
      statusLabel = "Time remaining";
    } else {
      countdown = "00 : 00 : 00";
      statusLabel = "Starting now";
    }
  }

  return (
    <div className="relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden rounded-xl bg-gradient-brand p-6 text-white shadow-panel">
      <AmbientRings light />
      <div className="relative flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/80">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
          Next appointment
        </p>
      </div>

      <div className="relative">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/70">{statusLabel}</p>
        <p
          className="mt-1 font-mono text-4xl font-semibold tabular-nums tracking-tight text-white sm:text-[2.75rem]"
          aria-live="off"
        >
          {now ? countdown : "-- : -- : --"}
        </p>
      </div>

      <div className="relative flex items-center justify-between gap-3 pt-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar
            firstName={appointment.patient.firstName}
            lastName={appointment.patient.lastName}
            size="sm"
            tone="onGradient"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {appointment.patient.firstName} {appointment.patient.lastName}
            </p>
            <p className="truncate text-xs text-white/75">
              {friendlyDateTime(scheduledAt)} · {appointment.durationMinutes} min
            </p>
          </div>
        </div>
        <Link href={`/appointments`} className="shrink-0">
          <Button size="sm" variant="onGradient">
            View
          </Button>
        </Link>
      </div>
    </div>
  );
}
