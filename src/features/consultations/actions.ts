"use server";

import { revalidatePath } from "next/cache";
import { requireDoctor } from "@/lib/session";
import { consultationSchema } from "@/lib/validation/schemas";
import { flattenZodErrors } from "@/lib/validation/flatten";
import { createConsultation } from "@/server/services/consultationService";
import type { ActionState } from "@/types/actions";

export async function createConsultationAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireDoctor();

  const raw = {
    patientId: formData.get("patientId"),
    appointmentId: formData.get("appointmentId") || "",
    diagnosisId: formData.get("diagnosisId"),
    customDiagnosis: formData.get("customDiagnosis") || "",
    symptoms: formData.get("symptoms") || "",
    type: formData.get("type"),
    consultedAt: formData.get("consultedAt"),
    durationMinutes: formData.get("durationMinutes"),
    notes: formData.get("notes"),
  };

  const parsed = consultationSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  try {
    const consultation = await createConsultation(user.doctorId, parsed.data);
    revalidatePath(`/patients/${parsed.data.patientId}`);
    revalidatePath("/appointments");
    revalidatePath("/consultations");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Consultation saved.",
      consultationId: consultation.id,
    };
  } catch {
    return { success: false, message: "Something went wrong. Please try again." };
  }
}
