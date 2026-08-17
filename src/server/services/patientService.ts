import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { PatientInput } from "@/lib/validation/schemas";

const PAGE_SIZE = 20;

export async function listPatients(params: { query?: string; page?: number }) {
  const page = Math.max(1, params.page ?? 1);
  const query = params.query?.trim();

  const where: Prisma.PatientWhereInput = query
    ? {
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { patientCode: { contains: query, mode: "insensitive" } },
          { phone: { contains: query } },
        ],
      }
    : {};

  const [patients, total] = await Promise.all([
    db.patient.findMany({
      where,
      orderBy: { lastName: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        consultations: {
          orderBy: { consultedAt: "desc" },
          take: 1,
          select: { consultedAt: true },
        },
      },
    }),
    db.patient.count({ where }),
  ]);

  return {
    patients,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getPatientProfile(patientId: string) {
  return db.patient.findUnique({
    where: { id: patientId },
    include: {
      consultations: {
        orderBy: { consultedAt: "desc" },
        include: { doctor: true, diagnosis: true, prescriptions: { include: { items: true } } },
      },
      appointments: {
        orderBy: { scheduledAt: "desc" },
        include: { doctor: true, clinic: true },
      },
      prescriptions: {
        orderBy: { issuedAt: "desc" },
        include: { items: { include: { medication: true } }, doctor: true, consultation: true },
      },
    },
  });
}

/**
 * Generates the next human-friendly patient code (PAT00001, PAT00002, ...).
 * Reads the highest existing code and increments it. For an MVP's write
 * volume (a handful of new patients per day) this is simple and correct;
 * a high-concurrency product would instead use a DB sequence.
 */
async function nextPatientCode(): Promise<string> {
  const last = await db.patient.findFirst({
    orderBy: { patientCode: "desc" },
    select: { patientCode: true },
  });
  const lastNumber = last ? parseInt(last.patientCode.replace("PAT", ""), 10) : 0;
  const next = lastNumber + 1;
  return `PAT${String(next).padStart(5, "0")}`;
}

export async function createPatient(input: PatientInput) {
  const patientCode = await nextPatientCode();
  return db.patient.create({
    data: {
      patientCode,
      firstName: input.firstName,
      lastName: input.lastName,
      gender: input.gender,
      dateOfBirth: new Date(input.dateOfBirth),
      phone: input.phone,
      city: input.city,
      governorate: input.governorate,
    },
  });
}

export async function updatePatient(patientId: string, input: PatientInput) {
  return db.patient.update({
    where: { id: patientId },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      gender: input.gender,
      dateOfBirth: new Date(input.dateOfBirth),
      phone: input.phone,
      city: input.city,
      governorate: input.governorate,
    },
  });
}

/** Lightweight list used to populate <select> patient pickers in forms. */
export async function listPatientOptions() {
  return db.patient.findMany({
    orderBy: { lastName: "asc" },
    select: { id: true, firstName: true, lastName: true, patientCode: true },
  });
}
