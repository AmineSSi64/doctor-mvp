"use server";

import { revalidatePath } from "next/cache";
import { requireDoctor } from "@/lib/session";
import { patientSchema } from "@/lib/validation/schemas";
import { flattenZodErrors } from "@/lib/validation/flatten";
import { createPatient, updatePatient } from "@/server/services/patientService";
import type { ActionState } from "@/types/actions";

/**
 * Every Server Action in this file follows the same shape:
 *   1. requireDoctor() — re-verify the session server-side, never trust the client.
 *   2. Zod validation — the same schema the form uses for inline errors.
 *   3. Service call — the only place that touches Prisma.
 *   4. revalidatePath — tell Next.js which cached pages need fresh data.
 */
export async function createPatientAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireDoctor();

  const raw = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    gender: formData.get("gender"),
    dateOfBirth: formData.get("dateOfBirth"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    governorate: formData.get("governorate"),
  };

  const parsed = patientSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  try {
    const patient = await createPatient(parsed.data);
    revalidatePath("/patients");
    revalidatePath("/dashboard");
    return { success: true, message: "Patient created successfully.", patientId: patient.id };
  } catch (err) {
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

export async function updatePatientAction(
  patientId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireDoctor();

  const raw = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    gender: formData.get("gender"),
    dateOfBirth: formData.get("dateOfBirth"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    governorate: formData.get("governorate"),
  };

  const parsed = patientSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  try {
    await updatePatient(patientId, parsed.data);
    revalidatePath(`/patients/${patientId}`);
    revalidatePath("/patients");
    return { success: true, message: "Patient updated successfully." };
  } catch (err) {
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

