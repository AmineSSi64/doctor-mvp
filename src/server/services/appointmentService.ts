import { db } from "@/lib/db";
import { Prisma, AppointmentStatus } from "@prisma/client";
import type { AppointmentInput } from "@/lib/validation/schemas";

export async function listAppointments(params: {
  status?: AppointmentStatus;
  from?: Date;
  to?: Date;
}) {
  const where: Prisma.AppointmentWhereInput = {};
  if (params.status) where.status = params.status;

  if (params.from || params.to) {
    where.scheduledAt = {};
    if (params.from) where.scheduledAt.gte = params.from;
    if (params.to) where.scheduledAt.lt = params.to;
  } else if (!params.status) {
    // No explicit filter at all: default to a rolling window around "today"
    // (7 days back, 30 days ahead) rather than every appointment ever
    // booked. A doctor's default view is "what's coming up", not a
    // 5,000-row historical dump — and this keeps the page fast regardless
    // of how much history has accumulated.
    const from = new Date();
    from.setDate(from.getDate() - 7);
    const to = new Date();
    to.setDate(to.getDate() + 30);
    where.scheduledAt = { gte: from, lt: to };
  }

  return db.appointment.findMany({
    where,
    orderBy: { scheduledAt: params.status ? "desc" : "asc" },
    take: 200,
    include: { patient: true, doctor: true, clinic: true },
  });
}

export async function createAppointment(input: AppointmentInput) {
  // lead_time_days mirrors the analytical Fact_Appointment measure — derived
  // here at write time from "now" (the booking moment) vs. the appointment date.
  return db.appointment.create({
    data: {
      patientId: input.patientId,
      doctorId: input.doctorId,
      clinicId: input.clinicId,
      scheduledAt: new Date(input.scheduledAt),
      durationMinutes: input.durationMinutes,
      notes: input.notes || null,
      status: "SCHEDULED",
    },
  });
}

export async function updateAppointmentStatus(appointmentId: string, status: AppointmentStatus) {
  return db.appointment.update({
    where: { id: appointmentId },
    data: { status },
  });
}

/** Appointments eligible to be converted into a consultation (still SCHEDULED, today or in the past). */
export async function listConvertibleAppointments(patientId: string) {
  return db.appointment.findMany({
    where: { patientId, status: "SCHEDULED", scheduledAt: { lte: new Date() } },
    orderBy: { scheduledAt: "desc" },
  });
}
