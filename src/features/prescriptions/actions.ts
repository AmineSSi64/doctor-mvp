"use server";

import { revalidatePath } from "next/cache";
import { requireDoctor } from "@/lib/session";
import { prescriptionSchema } from "@/lib/validation/schemas";
import { flattenZodErrors } from "@/lib/validation/flatten";
import { createPrescription } from "@/server/services/prescriptionService";
import type { ActionState } from "@/types/actions";

/**
 * The prescription form submits a variable number of medication rows.
 * Rather than a client-side JSON blob (which would bypass native form
 * semantics like autofill and no-JS submission), each row uses indexed
 * field names: items[0].medicationId, items[0].dosage, etc. This function
 * regroups them into an array before validation.
 */
function parseItemsFromFormData(formData: FormData) {
  const items: Record<number, Record<string, string>> = {};

  for (const [key, value] of formData.entries()) {
    const match = key.match(/^items\[(\d+)\]\.(\w+)$/);
    if (!match) continue;
    const index = Number(match[1]);
    const field = match[2];
    items[index] = items[index] ?? {};
    items[index][field] = String(value);
  }

  return Object.keys(items)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => items[Number(key)]);
}

export async function createPrescriptionAction(
  patientId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireDoctor();

  const raw = {
    consultationId: formData.get("consultationId"),
    items: parseItemsFromFormData(formData),
  };

  const parsed = prescriptionSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.errors[0]?.message ?? "Please fix the highlighted fields.",
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  try {
    await createPrescription(user.doctorId, parsed.data);
    revalidatePath(`/patients/${patientId}`);
    revalidatePath("/prescriptions");
    return { success: true, message: "Prescription created successfully." };
  } catch {
    return { success: false, message: "Something went wrong. Please try again." };
  }
}
