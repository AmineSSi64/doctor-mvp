import Link from "next/link";
import { requireDoctor } from "@/lib/session";
import { getDashboardData } from "@/server/services/dashboardService";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { NextAppointmentCard } from "@/features/dashboard/next-appointment-card";
import { TodaySchedule } from "@/features/dashboard/today-schedule";
import { Plus, Users, CalendarCheck, CalendarClock, TrendingUp, CalendarX2, UserRoundPlus } from "lucide-react";

/** A doctor's morning starts before 12, afternoon before 18 — used only for
 *  the greeting copy, purely presentational. */
function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const user = await requireDoctor();
  const { todayAppointments, summary, recentPatients, nextAppointment } = await getDashboardData(
    user.doctorId
  );

  const now = new Date();
  const today = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const greeting = greetingForHour(now.getHours());

  const completionRate =
    summary.todayAppointmentCount > 0
      ? Math.round((summary.completedConsultationsToday / summary.todayAppointmentCount) * 100)
      : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        title={`${greeting}, Dr. ${user.name?.split(" ")[0] ?? ""}`}
        description={`${today} — here's what's happening with your practice today.`}
        actions={
          <>
            <Link href="/patients/new">
              <Button variant="secondary" size="sm">
                <Plus className="h-4 w-4" /> New Patient
              </Button>
            </Link>
            <Link href="/appointments/new">
              <Button size="sm">
                <Plus className="h-4 w-4" /> New Appointment
              </Button>
            </Link>
          </>
        }
      />

      {/* Primary KPI strip — each metric gets a color that means something
          (info for today, success for completed work, primary for the
          practice's overall size, neutral for a forward-looking count)
          rather than a repeated brand-purple icon on every card. */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          icon={CalendarClock}
          tone="info"
          label="Today's appointments"
          value={summary.todayAppointmentCount}
          style={{ animationDelay: "0ms" }}
        />
        <MetricCard
          icon={CalendarCheck}
          tone="success"
          label="Consultations completed today"
          value={summary.completedConsultationsToday}
          meta={completionRate !== null ? `${completionRate}% of today's appointments` : undefined}
          style={{ animationDelay: "60ms" }}
        />
        <MetricCard
          icon={Users}
          tone="primary"
          label="Total patients"
          value={summary.totalPatients}
          style={{ animationDelay: "120ms" }}
        />
        <MetricCard
          icon={TrendingUp}
          tone="neutral"
          label="Upcoming appointments"
          value={summary.upcomingAppointments}
          style={{ animationDelay: "180ms" }}
        />
      </div>

      {/* Signature hero row — the live-countdown Next Appointment card next
          to the day's schedule. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <NextAppointmentCard appointment={nextAppointment} />
        </div>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Today&apos;s appointments</CardTitle>
            <Link href="/appointments" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {todayAppointments.length === 0 ? (
              <EmptyState
                icon={CalendarX2}
                title="No appointments today"
                description="Your schedule is clear. Create an appointment to get started."
                action={
                  <Link href="/appointments/new">
                    <Button size="sm">
                      <Plus className="h-4 w-4" /> Create Appointment
                    </Button>
                  </Link>
                }
              />
            ) : (
              <TodaySchedule appointments={todayAppointments} />
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent patients — a wide, low-height row of identity chips rather
          than a narrow vertical list, so it uses the full content width. */}
      <Card>
        <CardHeader>
          <CardTitle>Recent patients</CardTitle>
          <Link href="/patients" className="text-xs font-medium text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardBody>
          {recentPatients.length === 0 ? (
            <EmptyState icon={UserRoundPlus} title="No patients yet" />
          ) : (
            <div className="flex flex-wrap gap-3">
              {recentPatients.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/patients/${p.id}`}
                  className="group flex animate-fade-in-up items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <Avatar firstName={p.firstName} lastName={p.lastName} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink group-hover:text-primary">
                      {p.firstName} {p.lastName}
                    </p>
                    <p className="text-xs text-ink-muted">{p.city}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
