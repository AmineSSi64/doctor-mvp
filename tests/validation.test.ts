import { describe, it, expect } from "vitest";
import {
  patientSchema,
  appointmentSchema,
  consultationSchema,
  prescriptionSchema,
  loginSchema,
  OTHER_DIAGNOSIS_VALUE,
} from "@/lib/validation/schemas";

describe("patientSchema", () => {
  const validPatient = {
    firstName: "Mariem",
    lastName: "Ben Amor",
    gender: "F" as const,
    dateOfBirth: "1990-05-12",
    phone: "+216 22 345 678",
    city: "Sousse",
    governorate: "Sousse",
  };

  it("accepts a well-formed patient", () => {
    const result = patientSchema.safeParse(validPatient);
    expect(result.success).toBe(true);
  });

  it("accepts a phone number without internal spaces and normalizes it", () => {
    const result = patientSchema.safeParse({ ...validPatient, phone: "+216 22345678" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone).toBe("+216 22 345 678");
  });

  it("accepts a local 8-digit number with no country code and normalizes it", () => {
    const result = patientSchema.safeParse({ ...validPatient, phone: "22 345 678" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone).toBe("+216 22 345 678");
  });

  it("rejects a phone number with the wrong number of digits", () => {
    const result = patientSchema.safeParse({ ...validPatient, phone: "12345" });
    expect(result.success).toBe(false);
  });

  it("rejects a phone number containing letters", () => {
    const result = patientSchema.safeParse({ ...validPatient, phone: "2234567a" });
    expect(result.success).toBe(false);
  });

  it("rejects a date of birth in the future", () => {
    const result = patientSchema.safeParse({ ...validPatient, dateOfBirth: "2099-01-01" });
    expect(result.success).toBe(false);
  });

  it("rejects a one-letter first name", () => {
    const result = patientSchema.safeParse({ ...validPatient, firstName: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid gender value", () => {
    const result = patientSchema.safeParse({ ...validPatient, gender: "X" });
    expect(result.success).toBe(false);
  });
});

describe("appointmentSchema", () => {
  const validAppointment = {
    patientId: "ckv1qz3z00000abcd1234efgh",
    doctorId: "ckv1qz3z00001abcd1234efgh",
    clinicId: "ckv1qz3z00002abcd1234efgh",
    scheduledAt: "2026-09-01T10:00:00.000Z",
    durationMinutes: 30,
  };

  it("accepts a well-formed appointment with a cuid-style id (app-created records)", () => {
    expect(appointmentSchema.safeParse(validAppointment).success).toBe(true);
  });

  it("accepts a uuid-style id (seeded records use crypto.randomUUID())", () => {
    const result = appointmentSchema.safeParse({
      ...validAppointment,
      patientId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a duration under 5 minutes", () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, durationMinutes: 2 });
    expect(result.success).toBe(false);
  });

  it("rejects a duration over 4 hours", () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, durationMinutes: 500 });
    expect(result.success).toBe(false);
  });

  it("rejects a garbage patientId (would otherwise silently fail at the DB)", () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, patientId: "not-an-id" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty patientId", () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, patientId: "" });
    expect(result.success).toBe(false);
  });
});

describe("consultationSchema", () => {
  const base = {
    patientId: "ckv1qz3z00000abcd1234efgh",
    diagnosisId: "ckv1qz3z00003abcd1234efgh",
    type: "FOLLOW_UP" as const,
    consultedAt: "2026-09-01T10:15:00.000Z",
    durationMinutes: 20,
  };

  it("accepts a consultation without a linked appointment (walk-in)", () => {
    expect(consultationSchema.safeParse(base).success).toBe(true);
  });

  it("accepts a seeded (uuid-style) diagnosisId", () => {
    const result = consultationSchema.safeParse({
      ...base,
      diagnosisId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid consultation type", () => {
    const result = consultationSchema.safeParse({ ...base, type: "ROUTINE" });
    expect(result.success).toBe(false);
  });

  it("accepts optional symptoms text", () => {
    const result = consultationSchema.safeParse({ ...base, symptoms: "Fever, sore throat" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.symptoms).toBe("Fever, sore throat");
  });

  it("rejects OTHER diagnosis without a custom diagnosis specified", () => {
    const result = consultationSchema.safeParse({ ...base, diagnosisId: OTHER_DIAGNOSIS_VALUE });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.flatten().fieldErrors;
      expect(err.customDiagnosis?.[0]).toBeTruthy();
    }
  });

  it("accepts OTHER diagnosis when a custom diagnosis is specified", () => {
    const result = consultationSchema.safeParse({
      ...base,
      diagnosisId: OTHER_DIAGNOSIS_VALUE,
      customDiagnosis: "Rare tropical condition",
    });
    expect(result.success).toBe(true);
  });
});

describe("prescriptionSchema", () => {
  it("rejects a prescription with zero items", () => {
    const result = prescriptionSchema.safeParse({
      consultationId: "ckv1qz3z00004abcd1234efgh",
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a prescription with one valid item", () => {
    const result = prescriptionSchema.safeParse({
      consultationId: "ckv1qz3z00004abcd1234efgh",
      items: [
        {
          medicationId: "ckv1qz3z00005abcd1234efgh",
          dosage: "500mg",
          frequencyPerDay: 2,
          durationDays: 7,
          quantity: 14,
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("rejects a malformed email", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
  });

  it("rejects an empty password", () => {
    expect(
      loginSchema.safeParse({ email: "doctor@demo.local", password: "" }).success
    ).toBe(false);
  });
});
