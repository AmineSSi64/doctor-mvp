import { db } from "@/lib/db";

/**
 * All read queries backing the dashboard. Kept in one service so the page
 * component stays a thin layout — it calls one function, not five ad hoc
 * Prisma queries scattered across JSX.
 */
export async function getDashboardData(doctorId: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const [
    todayAppointments,
    totalPatients,
    completedConsultationsToday,
    upcomingAppointments,
    recentPatients,
    nextAppointment,
  ] = await Promise.all([
    db.appointment.findMany({
      where: { doctorId, scheduledAt: { gte: startOfDay, lt: endOfDay } },
      include: { patient: true },
      orderBy: { scheduledAt: "asc" },
    }),
    db.patient.count(),
    db.consultation.count({
      where: { doctorId, consultedAt: { gte: startOfDay, lt: endOfDay } },
    }),
    db.appointment.count({
      where: { doctorId, status: "SCHEDULED", scheduledAt: { gt: endOfDay } },
    }),
    db.patient.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    // Powers the dashboard's live countdown card — the single next
    // SCHEDULED appointment from now onward, whether later today or a
    // future day. Kept as its own query (rather than derived from
    // todayAppointments) since the next appointment may not be today.
    db.appointment.findFirst({
      where: { doctorId, status: "SCHEDULED", scheduledAt: { gte: now } },
      include: { patient: true },
      orderBy: { scheduledAt: "asc" },
    }),
  ]);

  return {
    todayAppointments,
    summary: {
      todayAppointmentCount: todayAppointments.length,
      completedConsultationsToday,
      totalPatients,
      upcomingAppointments,
    },
    recentPatients,
    nextAppointment,
  };
}
