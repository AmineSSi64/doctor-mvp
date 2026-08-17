import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { readCsv, parseDateKey } from "./seed-lib/csv";

const db = new PrismaClient();

// ---------------------------------------------------------------------------
// DEMO DATA SIZE
// ---------------------------------------------------------------------------
// Change this to 200 later if you want a larger demo dataset.
// The seed keeps only patients within this limit and then keeps related
// appointments, consultations, prescriptions, and prescription items.
const DEMO_PATIENT_LIMIT = 100;

// The synthetic CSVs were generated with a fixed "reference today" of
// 2026-08-01. Whenever this seed runs, that reference point is remapped onto
// the real current date so the demo always feels current.
const SYNTHETIC_REFERENCE_TODAY = new Date(2026, 7, 1);

function computeDateOffsetMs(): number {
  const now = new Date();
  const todayMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const diffDays = Math.round(
    (todayMidnight.getTime() - SYNTHETIC_REFERENCE_TODAY.getTime()) /
      86_400_000
  );

  const diffWeeks = Math.round(diffDays / 7);

  return diffWeeks * 7 * 86_400_000;
}

function shift(date: Date, offsetMs: number): Date {
  return new Date(date.getTime() + offsetMs);
}

/**
 * Inserts rows in fixed-size chunks to keep each createMany() call
 * well under PostgreSQL's parameter limit.
 */
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
    `Seeding with a date offset of ${Math.round(
      offsetMs / 86_400_000
    )} days ` +
      `(so the synthetic "today" of 2026-08-01 lines up with the real current date).`
  );

  console.log(`Demo patient limit: ${DEMO_PATIENT_LIMIT}`);

  // ------------------------------------------------------------------------
  // Clean slate
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

  const clinicIdMap = new Map<string, string>();
  const clinicKeyToId = new Map<string, string>();

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
  // Doctors
  // ------------------------------------------------------------------------
  console.log("Creating doctors...");

  const doctorRows = readCsv("dim_doctor.csv");

  const doctorKeyToId = new Map<string, string>();
  const doctorBusinessIdToId = new Map<string, string>();

  const demoPasswordHash = await bcrypt.hash("demo1234", 10);

  for (const row of doctorRows) {
    const email =
      row.doctor_id === "DOC001"
        ? "doctor@demo.local"
        : `dr.${row.last_name
            .toLowerCase()
            .replace(/\s+/g, "")}${row.doctor_id.slice(-2)}@cabinet.tn`;

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
        yearsExperience: row.years_experience
          ? Number(row.years_experience)
          : null,
        clinicId: clinicIdMap.get(row.clinic_id)!,
      },
    });

    doctorKeyToId.set(row.doctor_key, doctorId);
    doctorBusinessIdToId.set(row.doctor_id, doctorId);
  }

  console.log(
    `  ${doctorRows.length} doctors (login: doctor@demo.local / demo1234)`
  );

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
  // Diagnoses
  // ------------------------------------------------------------------------
  console.log("Creating diagnoses and medications...");

  const diagnosisRows = readCsv("dim_diagnosis.csv");

  const diagnosisKeyToId = new Map<string, string>();

  const diagnosisData = diagnosisRows.map((row) => {
    const id = randomUUID();

    diagnosisKeyToId.set(row.diagnosis_key, id);

    return {
      id,
      name: row.diagnosis_name,
      category: row.category,
      isOther: false,
    };
  });

  // Application-level "Other" diagnosis.
  diagnosisData.push({
    id: randomUUID(),
    name: "Other",
    category: "Other",
    isOther: true,
  });

  await db.diagnosis.createMany({
    data: diagnosisData,
  });

  // ------------------------------------------------------------------------
  // Medications
  // ------------------------------------------------------------------------
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

  await db.medication.createMany({
    data: medicationData,
  });

  console.log(
    `  ${diagnosisData.length} diagnoses, ${medicationData.length} medications`
  );

  // ------------------------------------------------------------------------
  // Status / consultation type lookups
  // ------------------------------------------------------------------------
  const statusRows = readCsv("dim_appointment_status.csv");

  const statusKeyToCode = new Map(
    statusRows.map((r) => [r.status_key, r.status_code])
  );

  const consultTypeRows = readCsv("dim_consultation_type.csv");

  const typeKeyToCode = new Map(
    consultTypeRows.map((r) => [
      r.consultation_type_key,
      r.type_code,
    ])
  );

  // ------------------------------------------------------------------------
  // Patients
  // ------------------------------------------------------------------------
  console.log("Creating patients...");

  const patientRows = readCsv("dim_patient.csv");

  // Maps every patient_key, including historical SCD2 rows, to the
  // corresponding business patient ID.
  const patientKeyToBusinessId = new Map<string, string>();

  for (const row of patientRows) {
    patientKeyToBusinessId.set(row.patient_key, row.patient_id);
  }

  // Get unique patient business IDs from the current records.
  const currentPatientRows = patientRows.filter(
    (r) => r.is_current === "True"
  );

  const uniquePatientBusinessIds: string[] = [];
  const seenPatientBusinessIds = new Set<string>();

  for (const row of currentPatientRows) {
    if (!seenPatientBusinessIds.has(row.patient_id)) {
      seenPatientBusinessIds.add(row.patient_id);
      uniquePatientBusinessIds.push(row.patient_id);
    }

    if (uniquePatientBusinessIds.length >= DEMO_PATIENT_LIMIT) {
      break;
    }
  }

  // Only keep the current patient row for the selected patients.
  const selectedPatientBusinessIds = new Set(uniquePatientBusinessIds);

  const selectedPatientRows = currentPatientRows.filter((row) =>
    selectedPatientBusinessIds.has(row.patient_id)
  );

  const patientBusinessIdToId = new Map<string, string>();

  const patientData = selectedPatientRows.map((row) => {
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

  await createManyChunked(
    "patients",
    patientData,
    (chunk) => db.patient.createMany({ data: chunk })
  );

  console.log(`  ${patientData.length} patients selected`);

  // Resolve a fact-table patient_key to the selected operational patient.
  function resolvePatientId(patientKey: string): string {
    const businessId = patientKeyToBusinessId.get(patientKey);

    if (!businessId) {
      throw new Error(`Unknown patient_key ${patientKey}`);
    }

    const id = patientBusinessIdToId.get(businessId);

    if (!id) {
      throw new Error(
        `Patient ${businessId} is outside the demo patient limit`
      );
    }

    return id;
  }

  // ------------------------------------------------------------------------
  // Appointments
  // ------------------------------------------------------------------------
  console.log("Creating appointments...");

  const appointmentRows = readCsv("fact_appointment.csv");

  // Keep only appointments belonging to the selected patients.
  const selectedAppointmentRows = appointmentRows.filter((row) => {
    const businessId = patientKeyToBusinessId.get(row.patient_key);

    return businessId !== undefined &&
      selectedPatientBusinessIds.has(businessId);
  });

  const appointmentKeyToId = new Map<string, string>();

  const appointmentData = selectedAppointmentRows.map((row) => {
    const id = randomUUID();

    appointmentKeyToId.set(row.appointment_key, id);

    return {
      id,
      patientId: resolvePatientId(row.patient_key),
      doctorId: doctorKeyToId.get(row.doctor_key)!,
      clinicId: clinicKeyToId.get(row.clinic_key)!,
      bookedByAssistantId: row.assistant_key
        ? assistantKeyToId.get(row.assistant_key) ?? null
        : null,
      scheduledAt: shift(
        new Date(row.appointment_datetime.replace(" ", "T")),
        offsetMs
      ),
      durationMinutes: Number(row.scheduled_duration_minutes),
      status: statusKeyToCode.get(row.status_key) as
        | "SCHEDULED"
        | "COMPLETED"
        | "CANCELLED"
        | "NO_SHOW",
    };
  });

  await createManyChunked(
    "appointments",
    appointmentData,
    (chunk) => db.appointment.createMany({ data: chunk })
  );

  // ------------------------------------------------------------------------
  // Consultations
  // ------------------------------------------------------------------------
  console.log("Creating consultations...");

  const consultationRows = readCsv("fact_consultation.csv");

  // Only consultations belonging to selected patients AND existing
  // appointments are kept.
  const selectedConsultationRows = consultationRows.filter((row) => {
    const businessId = patientKeyToBusinessId.get(row.patient_key);

    const patientSelected =
      businessId !== undefined &&
      selectedPatientBusinessIds.has(businessId);

    const appointmentExists =
      !row.appointment_key ||
      appointmentKeyToId.has(row.appointment_key);

    return patientSelected && appointmentExists;
  });

  const consultationKeyToId = new Map<string, string>();

  const consultationData = selectedConsultationRows.map((row) => {
    const id = randomUUID();

    consultationKeyToId.set(row.consultation_key, id);

    return {
      id,
      appointmentId: row.appointment_key
        ? appointmentKeyToId.get(row.appointment_key) ?? null
        : null,
      patientId: resolvePatientId(row.patient_key),
      doctorId: doctorKeyToId.get(row.doctor_key)!,
      clinicId: clinicKeyToId.get(row.clinic_key)!,
      diagnosisId: diagnosisKeyToId.get(row.diagnosis_key)!,
      type: typeKeyToCode.get(row.consultation_type_key) as
        | "FIRST_VISIT"
        | "FOLLOW_UP"
        | "EMERGENCY"
        | "ROUTINE_CHECK",
      consultedAt: shift(
        new Date(row.consultation_datetime.replace(" ", "T")),
        offsetMs
      ),
      durationMinutes: Number(row.consultation_duration_minutes),
    };
  });

  await createManyChunked(
    "consultations",
    consultationData,
    (chunk) => db.consultation.createMany({ data: chunk })
  );

  // ------------------------------------------------------------------------
  // Prescriptions
  // ------------------------------------------------------------------------
  console.log("Creating prescriptions...");

  const prescriptionRows = readCsv("fact_prescription.csv");

  // Only prescriptions belonging to consultations that survived the filter.
  const selectedPrescriptionRows = prescriptionRows.filter((row) =>
    consultationKeyToId.has(row.consultation_key)
  );

  const prescriptionKeyToId = new Map<string, string>();

  const prescriptionData = selectedPrescriptionRows.map((row) => {
    const id = randomUUID();

    prescriptionKeyToId.set(row.prescription_key, id);

    return {
      id,
      consultationId: consultationKeyToId.get(row.consultation_key)!,
      patientId: resolvePatientId(row.patient_key),
      doctorId: doctorKeyToId.get(row.doctor_key)!,
      issuedAt: shift(
        parseDateKey(row.date_key),
        offsetMs
      ),
    };
  });

  await createManyChunked(
    "prescriptions",
    prescriptionData,
    (chunk) => db.prescription.createMany({ data: chunk })
  );

  // ------------------------------------------------------------------------
  // Prescription items
  // ------------------------------------------------------------------------
  console.log("Creating prescription items...");

  const itemRows = readCsv("fact_prescription_item.csv");

  // Only items belonging to prescriptions that survived the filter.
  const selectedItemRows = itemRows.filter((row) =>
    prescriptionKeyToId.has(row.prescription_key)
  );

  const itemData = selectedItemRows.map((row) => ({
    id: randomUUID(),
    prescriptionId: prescriptionKeyToId.get(row.prescription_key)!,
    medicationId: medicationKeyToId.get(row.medication_key)!,
    dosage: row.dosage,
    frequencyPerDay: Number(row.frequency_per_day),
    durationDays: Number(row.duration_days),
    quantity: Number(row.quantity),
  }));

  await createManyChunked(
    "prescription items",
    itemData,
    (chunk) => db.prescriptionItem.createMany({ data: chunk })
  );

  // ------------------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------------------
  console.log("\nSeed complete.");
  console.log("----------------------------------------");
  console.log(`Patients:             ${patientData.length}`);
  console.log(`Appointments:         ${appointmentData.length}`);
  console.log(`Consultations:        ${consultationData.length}`);
  console.log(`Prescriptions:        ${prescriptionData.length}`);
  console.log(`Prescription items:   ${itemData.length}`);
  console.log("----------------------------------------");
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