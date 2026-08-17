import { db } from "@/lib/db";
import type { PrescriptionInput } from "@/lib/validation/schemas";

export async function listMedications() {
  return db.medication.findMany({ orderBy: { name: "asc" } });
}

export async function createPrescription(doctorId: string, input: PrescriptionInput) {
  const consultation = await db.consultation.findUniqueOrThrow({
    where: { id: input.consultationId },
  });

  // Header + line items are written in one transaction: a prescription
  // with zero items (partial write) would be a data-integrity bug a doctor
  // might not notice until a patient is missing a medication.
  return db.prescription.create({
    data: {
      consultationId: consultation.id,
      patientId: consultation.patientId,
      doctorId,
      items: {
        create: input.items.map((item) => ({
          medicationId: item.medicationId,
          dosage: item.dosage,
          frequencyPerDay: item.frequencyPerDay,
          durationDays: item.durationDays,
          quantity: item.quantity,
        })),
      },
    },
    include: { items: { include: { medication: true } } },
  });
}

export async function getPrescription(prescriptionId: string) {
  return db.prescription.findUnique({
    where: { id: prescriptionId },
    include: {
      items: { include: { medication: true } },
      patient: true,
      doctor: true,
      consultation: { include: { diagnosis: true } },
    },
  });
}

export async function listPrescriptions() {
  return db.prescription.findMany({
    orderBy: { issuedAt: "desc" },
    include: { patient: true, doctor: true, items: true },
    take: 50,
  });
}
