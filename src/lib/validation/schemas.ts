import { z } from "zod";
import { normalizeTunisianPhone } from "@/lib/phone";

// ----------------------------------------------------------------------------
// These schemas are the single source of truth for "is this input shaped
// correctly". They run server-side inside Server Actions before any
// database write — client-side forms may also use them for inline errors,
// but that is a UX convenience, never the security boundary.
// ----------------------------------------------------------------------------

/**
 * Validates a database record ID without hard-coding a single ID format.
 *
 * Bug history: this used to be `z.string().cuid()`. Prisma's `@default(cuid())`
 * only generates cuids for rows created through the app itself — every row
 * loaded by prisma/seed.ts was given a `crypto.randomUUID()` id instead (see
 * the comment in that file). `.cuid()` rejects UUIDs outright, so selecting
 * *any* seeded diagnosis, patient, doctor, clinic, or medication from a
 * dropdown failed validation even though a real value was selected. The
 * actual invariant we care about is "a value was chosen, and it isn't
 * obviously garbage" — referential integrity is already enforced by the
 * Postgres foreign key, so this only needs to catch empty/malformed input.
 */
function entityId(message: string) {
  return z
    .string()
    .min(1, message)
    .refine(
      (v) => z.string().cuid().safeParse(v).success || z.string().uuid().safeParse(v).success,
      message
    );
}

export const patientSchema = z.object({
  firstName: z.string().trim().min(2, "First name is too short").max(100),
  lastName: z.string().trim().min(2, "Last name is too short").max(100),
  gender: z.enum(["M", "F"], { required_error: "Select a gender" }),
  dateOfBirth: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date")
    .refine((v) => new Date(v) <= new Date(), "Date of birth cannot be in the future"),
  // Accepts common variations (+216 29 526 066, +21629526066, 29 526 066,
  // 29526066, ...) and normalizes to the canonical "+216 XX XXX XXX" before
  // it ever reaches the database — see lib/phone.ts.
  phone: z
    .string()
    .trim()
    .transform((v, ctx) => {
      const normalized = normalizeTunisianPhone(v);
      if (!normalized) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid 8-digit Tunisian number, e.g. 29 526 066",
        });
        return z.NEVER;
      }
      return normalized;
    }),
  city: z.string().trim().min(2, "City is required").max(100),
  governorate: z.string().trim().min(2, "Governorate is required").max(100),
});

export type PatientInput = z.infer<typeof patientSchema>;

export const appointmentSchema = z.object({
  patientId: entityId("Select a patient"),
  doctorId: entityId("Select a doctor"),
  clinicId: entityId("Select a clinic"),
  scheduledAt: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date and time"),
  durationMinutes: z.coerce
    .number()
    .int()
    .min(5, "Minimum duration is 5 minutes")
    .max(240, "Maximum duration is 4 hours"),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const appointmentStatusSchema = z.object({
  appointmentId: entityId("Missing appointment"),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
});

// A doctor picking "Other" in the diagnosis dropdown sends this sentinel
// instead of a real Diagnosis id (see consultation-form.tsx) — the service
// layer resolves it to the catalog's actual "Other" row at write time
// (src/server/services/consultationService.ts), so this constant never
// needs to know a real database id.
export const OTHER_DIAGNOSIS_VALUE = "OTHER";

export const consultationSchema = z
  .object({
    patientId: entityId("Select a patient"),
    appointmentId: entityId("Select an appointment").optional().or(z.literal("")),
    diagnosisId: z.union([z.literal(OTHER_DIAGNOSIS_VALUE), entityId("Select a diagnosis")]),
    customDiagnosis: z.string().trim().max(150).optional().or(z.literal("")),
    symptoms: z.string().trim().max(1000).optional().or(z.literal("")),
    type: z.enum(["FIRST_VISIT", "FOLLOW_UP", "EMERGENCY", "ROUTINE_CHECK"], {
      required_error: "Select a consultation type",
    }),
    consultedAt: z
      .string()
      .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date and time"),
    durationMinutes: z.coerce
      .number()
      .int()
      .min(5, "Minimum duration is 5 minutes")
      .max(240, "Maximum duration is 4 hours"),
    notes: z.string().trim().max(2000).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.diagnosisId === OTHER_DIAGNOSIS_VALUE && !data.customDiagnosis) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Specify the diagnosis",
        path: ["customDiagnosis"],
      });
    }
  });

export type ConsultationInput = z.infer<typeof consultationSchema>;

export const prescriptionItemSchema = z.object({
  medicationId: entityId("Select a medication"),
  dosage: z.string().trim().min(1, "Enter a dosage, e.g. 500mg").max(50),
  frequencyPerDay: z.coerce.number().int().min(1).max(6),
  durationDays: z.coerce.number().int().min(1).max(180),
  quantity: z.coerce.number().int().min(1).max(1000),
});

export const prescriptionSchema = z.object({
  consultationId: entityId("A consultation is required"),
  items: z
    .array(prescriptionItemSchema)
    .min(1, "Add at least one medication"),
});

export type PrescriptionInput = z.infer<typeof prescriptionSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
