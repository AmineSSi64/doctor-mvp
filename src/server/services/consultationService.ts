import { db } from "@/lib/db";
import { OTHER_DIAGNOSIS_VALUE, type ConsultationInput } from "@/lib/validation/schemas";

export async function listDiagnoses() {
  // "Other" is pinned to the end regardless of alphabetical order — it's
  // a catch-all, not a real clinical category, so it shouldn't compete for
  // position with actual diagnoses in the dropdown.
  return db.diagnosis.findMany({ orderBy: [{ isOther: "asc" }, { name: "asc" }] });
}

/**
 * Resolves the client's OTHER_DIAGNOSIS_VALUE sentinel to the catalog's
 * actual "Other" Diagnosis row, creating it if it doesn't exist yet (e.g. a
 * database seeded before this feature existed). Keeping this resolution in
 * the service layer — not the Zod schema — means the schema never needs to
 * know a real database id.
 */
async function resolveOtherDiagnosisId(): Promise<string> {
  const existing = await db.diagnosis.findFirst({ where: { isOther: true } });
  if (existing) return existing.id;

  const created = await db.diagnosis.create({
    data: { name: "Other", category: "Other", isOther: true },
  });
  return created.id;
}

export async function createConsultation(doctorId: string, input: ConsultationInput) {
  const appointmentId = input.appointmentId || null;

  const diagnosisId =
    input.diagnosisId === OTHER_DIAGNOSIS_VALUE
      ? await resolveOtherDiagnosisId()
      : input.diagnosisId;
  const customDiagnosis =
    input.diagnosisId === OTHER_DIAGNOSIS_VALUE ? input.customDiagnosis || null : null;

  // A consultation and (when linked) its appointment's completion must be
  // written together — if one failed without the other, the two facts
  // would disagree (e.g. an appointment stuck at SCHEDULED forever while a
  // consultation already exists for it). $transaction guarantees atomicity.
  return db.$transaction(async (tx) => {
    let clinicId: string;

    if (appointmentId) {
      const appointment = await tx.appointment.findUniqueOrThrow({
        where: { id: appointmentId },
      });
      clinicId = appointment.clinicId;
      await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: "COMPLETED" },
      });
    } else {
      // Walk-in consultation with no appointment: fall back to the doctor's
      // home clinic.
      const doctor = await tx.doctor.findUniqueOrThrow({ where: { id: doctorId } });
      clinicId = doctor.clinicId;
    }

    return tx.consultation.create({
      data: {
        appointmentId,
        patientId: input.patientId,
        doctorId,
        clinicId,
        diagnosisId,
        customDiagnosis,
        symptoms: input.symptoms || null,
        type: input.type,
        consultedAt: new Date(input.consultedAt),
        durationMinutes: input.durationMinutes,
        notes: input.notes || null,
      },
    });
  });
}

export async function getConsultation(consultationId: string) {
  return db.consultation.findUnique({
    where: { id: consultationId },
    include: {
      patient: true,
      doctor: true,
      diagnosis: true,
      prescriptions: { include: { items: { include: { medication: true } } } },
    },
  });
}
