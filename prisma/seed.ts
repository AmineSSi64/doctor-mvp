import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { readCsv, parseDateKey } from "./seed-lib/csv";

const db = new PrismaClient();

// The synthetic CSVs were generated with a fixed "reference today" of
// 2026-08-01 (see the BI project's generate_facts.py) — that's the date
// SCHEDULED vs. COMPLETED/CANCELLED/NO_SHOW statuses were decided around.
// Whenever this seed actually runs, that reference point is remapped onto
// the real current date so the demo always feels "current" (today has
// appointments, there are upcoming ones, etc.) — see DEVELOPMENT_GUIDE.md
// for the full explanation. The shift is rounded to a whole number of
// weeks so the original weekday-bias pattern (more weekday appointments)
// is preserved exactly.
const SYNTHETIC_REFERENCE_TODAY = new Date(2026, 7, 1);

function computeDateOffsetMs(): number {
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round(
    (todayMidnight.getTime() - SYNTHETIC_REFERENCE_TODAY.getTime()) / 86_400_000
  );
  const diffWeeks = Math.round(diffDays / 7);
  return diffWeeks * 7 * 86_400_000;
}

function shift(date: Date, offsetMs: number): Date {
  return new Date(date.getTime() + offsetMs);
}

/** Inserts `rows` in fixed-size chunks — keeps each createMany() call well under Postgres's parameter limit. */
async function createManyChunked<T>(
  label: string,
  rows: T[],
  fn: (chunk: T[]) => Promise<{ count: number }>
) {
  const CHUNK_SIZE = 1000;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    const result = await fn(chunk);
    inserted += result.count;
  }
  console.log(`  ${label}: ${inserted} rows`);
}

async function main() {
  const offsetMs = computeDateOffsetMs();
  console.log(
    `Seeding with a date offset of ${Math.round(offsetMs / 86_400_000)} days ` +
      `(so the synthetic "today" of 2026-08-01 lines up with the real current date).`
  );

  // ------------------------------------------------------------------------
  // Clean slate — makes `npm run db:seed` safely re-runnable without first
  // requiring `db:reset`. Deletion order respects foreign keys (children first).
  // ------------------------------------------------------------------------
  console.log("Clearing existing data...");
  await db.prescriptionItem.deleteMany();
  await db.prescription.deleteMany();
  await db.consultation.deleteMany();
  await db.appointment.deleteMany();
  await db.patient.deleteMany();
  await db.doctor.deleteMany();
  await db.assistant.deleteMany();
  await db.diagnosis.deleteMany();
  await db.medication.deleteMany();
  await db.clinic.deleteMany();
  await db.user.deleteMany();

  // ------------------------------------------------------------------------
  // Clinics
  // ------------------------------------------------------------------------
  console.log("Creating clinics...");
  const clinicRows = readCsv("dim_clinic.csv");
  const clinicIdMap = new Map<string, string>(); // business clinic_id -> cuid
  const clinicKeyToId = new Map<string, string>(); // clinic_key (int, as string) -> cuid
  for (const row of clinicRows) {
    const id = randomUUID();
    clinicIdMap.set(row.clinic_id, id);
    clinicKeyToId.set(row.clinic_key, id);
    await db.clinic.create({
      data: {
        id,
        name: row.clinic_name,
        city: row.city,
        governorate: row.governorate,
        address: row.address || null,
      },
    });
  }
  console.log(`  ${clinicRows.length} clinics`);

  // ------------------------------------------------------------------------
  // Doctors (+ their login User). DOC001 is intentionally given the
  // documented demo credential (doctor@demo.local) so the login screen's
  // demo account works regardless of seed randomness.
  // ------------------------------------------------------------------------
  console.log("Creating doctors...");
  const doctorRows = readCsv("dim_doctor.csv");
  const doctorKeyToId = new Map<string, string>(); // doctor_key (int, as string) -> cuid
  const doctorBusinessIdToId = new Map<string, string>(); // doctor_id -> cuid
  const demoPasswordHash = await bcrypt.hash("demo1234", 10);

  for (const row of doctorRows) {
    const email =
      row.doctor_id === "DOC001"
        ? "doctor@demo.local"
        : `dr.${row.last_name.toLowerCase().replace(/\s+/g, "")}${row.doctor_id.slice(
            -2
          )}@cabinet.tn`;

    const userId = randomUUID();
    const doctorId = randomUUID();

    await db.user.create({
      data: {
        id: userId,
        email,
        passwordHash: demoPasswordHash,
        name: `${row.first_name} ${row.last_name}`,
        role: "DOCTOR",
      },
    });
    await db.doctor.create({
      data: {
        id: doctorId,
        userId,
        firstName: row.first_name,
        lastName: row.last_name,
        specialty: row.specialty,
        phone: row.phone,
        yearsExperience: row.years_experience ? Number(row.years_experience) : null,
        clinicId: clinicIdMap.get(row.clinic_id)!,
      },
    });

    doctorKeyToId.set(row.doctor_key, doctorId);
    doctorBusinessIdToId.set(row.doctor_id, doctorId);
  }
  console.log(`  ${doctorRows.length} doctors (login: doctor@demo.local / demo1234)`);

  // ------------------------------------------------------------------------
  // Assistants
  // ------------------------------------------------------------------------
  console.log("Creating assistants...");
  const assistantRows = readCsv("dim_assistant.csv");
  const assistantKeyToId = new Map<string, string>();
  for (const row of assistantRows) {
    const id = randomUUID();
    await db.assistant.create({
      data: {
        id,
        firstName: row.first_name,
        lastName: row.last_name,
        phone: row.phone,
        clinicId: clinicIdMap.get(row.clinic_id)!,
      },
    });
    assistantKeyToId.set(row.assistant_key, id);
  }
  console.log(`  ${assistantRows.length} assistants`);

  // ------------------------------------------------------------------------
  // Diagnoses & medications (small catalogs — bulk insert)
  // ------------------------------------------------------------------------
  console.log("Creating diagnoses and medications...");
  const diagnosisRows = readCsv("dim_diagnosis.csv");
  const diagnosisKeyToId = new Map<string, string>();
  const diagnosisData = diagnosisRows.map((row) => {
    const id = randomUUID();
    diagnosisKeyToId.set(row.diagnosis_key, id);
    return { id, name: row.diagnosis_name, category: row.category, isOther: false };
  });
  // "Other" isn't in the synthetic CSV catalog — it's an application-level
  // concept (see Consultation.customDiagnosis) added here so a fresh seed
  // always has a working "Other" option in the diagnosis dropdown.
  diagnosisData.push({ id: randomUUID(), name: "Other", category: "Other", isOther: true });
  await db.diagnosis.createMany({ data: diagnosisData });

  const medicationRows = readCsv("dim_medication.csv");
  const medicationKeyToId = new Map<string, string>();
  const medicationData = medicationRows.map((row) => {
    const id = randomUUID();
    medicationKeyToId.set(row.medication_key, id);
    return {
      id,
      name: row.medication_name,
      class: row.medication_class,
      defaultUnit: row.default_unit,
    };
  });
  await db.medication.createMany({ data: medicationData });
  console.log(`  ${diagnosisData.length} diagnoses, ${medicationData.length} medications`);

  // ------------------------------------------------------------------------
  // Status / type lookups (small, just used to translate codes)
  // ------------------------------------------------------------------------
  const statusRows = readCsv("dim_appointment_status.csv");
  const statusKeyToCode = new Map(statusRows.map((r) => [r.status_key, r.status_code]));

  const consultTypeRows = readCsv("dim_consultation_type.csv");
  const typeKeyToCode = new Map(consultTypeRows.map((r) => [r.consultation_type_key, r.type_code]));

  // ------------------------------------------------------------------------
  // Patients — the analytical CSV is SCD2 (a patient can have 2 rows if
  // they moved). The operational model has no such versioning, so we take
  // only the "current" row per patient, but still build a lookup from
  // EVERY patient_key (current or historical) to the one operational
  // record, since fact tables reference whichever version was valid when
  // the event happened.
  // ------------------------------------------------------------------------
  console.log("Creating patients...");
  const patientRows = readCsv("dim_patient.csv");
  const patientKeyToBusinessId = new Map<string, string>();
  for (const row of patientRows) {
    patientKeyToBusinessId.set(row.patient_key, row.patient_id);
  }

  const currentPatientRows = patientRows.filter((r) => r.is_current === "True");
  const patientBusinessIdToId = new Map<string, string>();
  const patientData = currentPatientRows.map((row) => {
    const id = randomUUID();
    patientBusinessIdToId.set(row.patient_id, id);
    return {
      id,
      patientCode: row.patient_id,
      firstName: row.first_name,
      lastName: row.last_name,
      gender: row.gender as "M" | "F",
      dateOfBirth: new Date(row.date_of_birth),
      phone: row.phone,
      city: row.city,
      governorate: row.governorate,
      registrationDate: new Date(row.registration_date),
    };
  });
  await createManyChunked("patients", patientData, (chunk) => db.patient.createMany({ data: chunk }));

  function resolvePatientId(patientKey: string): string {
    const businessId = patientKeyToBusinessId.get(patientKey);
    if (!businessId) throw new Error(`Unknown patient_key ${patientKey}`);
    const id = patientBusinessIdToId.get(businessId);
    if (!id) throw new Error(`Unknown patient business id ${businessId}`);
    return id;
  }

  // ------------------------------------------------------------------------
  // Appointments
  // ------------------------------------------------------------------------
  console.log("Creating appointments...");
  const appointmentRows = readCsv("fact_appointment.csv");
  const appointmentKeyToId = new Map<string, string>();
  const appointmentData = appointmentRows.map((row) => {
    const id = randomUUID();
    appointmentKeyToId.set(row.appointment_key, id);
    return {
      id,
      patientId: resolvePatientId(row.patient_key),
      doctorId: doctorKeyToId.get(row.doctor_key)!,
      clinicId: clinicKeyToId.get(row.clinic_key)!,
      bookedByAssistantId: row.assistant_key ? assistantKeyToId.get(row.assistant_key) ?? null : null,
      scheduledAt: shift(new Date(row.appointment_datetime.replace(" ", "T")), offsetMs),
      durationMinutes: Number(row.scheduled_duration_minutes),
      status: statusKeyToCode.get(row.status_key) as
        | "SCHEDULED"
        | "COMPLETED"
        | "CANCELLED"
        | "NO_SHOW",
    };
  });
  await createManyChunked("appointments", appointmentData, (chunk) =>
    db.appointment.createMany({ data: chunk })
  );

  // ------------------------------------------------------------------------
  // Consultations
  // ------------------------------------------------------------------------
  console.log("Creating consultations...");
  const consultationRows = readCsv("fact_consultation.csv");
  const consultationKeyToId = new Map<string, string>();
  const consultationData = consultationRows.map((row) => {
    const id = randomUUID();
    consultationKeyToId.set(row.consultation_key, id);
    return {
      id,
      appointmentId: row.appointment_key ? appointmentKeyToId.get(row.appointment_key) ?? null : null,
      patientId: resolvePatientId(row.patient_key),
      doctorId: doctorKeyToId.get(row.doctor_key)!,
      clinicId: clinicKeyToId.get(row.clinic_key)!,
      diagnosisId: diagnosisKeyToId.get(row.diagnosis_key)!,
      type: typeKeyToCode.get(row.consultation_type_key) as
        | "FIRST_VISIT"
        | "FOLLOW_UP"
        | "EMERGENCY"
        | "ROUTINE_CHECK",
      consultedAt: shift(new Date(row.consultation_datetime.replace(" ", "T")), offsetMs),
      durationMinutes: Number(row.consultation_duration_minutes),
    };
  });
  await createManyChunked("consultations", consultationData, (chunk) =>
    db.consultation.createMany({ data: chunk })
  );

  // ------------------------------------------------------------------------
  // Prescriptions
  // ------------------------------------------------------------------------
  console.log("Creating prescriptions...");
  const prescriptionRows = readCsv("fact_prescription.csv");
  const prescriptionKeyToId = new Map<string, string>();
  const prescriptionData = prescriptionRows.map((row) => {
    const id = randomUUID();
    prescriptionKeyToId.set(row.prescription_key, id);
    return {
      id,
      consultationId: consultationKeyToId.get(row.consultation_key)!,
      patientId: resolvePatientId(row.patient_key),
      doctorId: doctorKeyToId.get(row.doctor_key)!,
      issuedAt: shift(parseDateKey(row.date_key), offsetMs),
    };
  });
  await createManyChunked("prescriptions", prescriptionData, (chunk) =>
    db.prescription.createMany({ data: chunk })
  );

  // ------------------------------------------------------------------------
  // Prescription items
  // ------------------------------------------------------------------------
  console.log("Creating prescription items...");
  const itemRows = readCsv("fact_prescription_item.csv");
  const itemData = itemRows.map((row) => ({
    id: randomUUID(),
    prescriptionId: prescriptionKeyToId.get(row.prescription_key)!,
    medicationId: medicationKeyToId.get(row.medication_key)!,
    dosage: row.dosage,
    frequencyPerDay: Number(row.frequency_per_day),
    durationDays: Number(row.duration_days),
    quantity: Number(row.quantity),
  }));
  await createManyChunked("prescription items", itemData, (chunk) =>
    db.prescriptionItem.createMany({ data: chunk })
  );

  console.log("\nSeed complete.");
  console.log("Demo login: doctor@demo.local / demo1234");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
