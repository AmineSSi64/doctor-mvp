"use server";

import { revalidatePath } from "next/cache";
import { requireDoctor } from "@/lib/session";
import { appointmentSchema, appointmentStatusSchema } from "@/lib/validation/schemas";
import { flattenZodErrors } from "@/lib/validation/flatten";
import { createAppointment, updateAppointmentStatus } from "@/server/services/appointmentService";
import type { ActionState } from "@/types/actions";

export async function createAppointmentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireDoctor();

  const raw = {
    patientId: formData.get("patientId"),
    doctorId: formData.get("doctorId"),
    clinicId: formData.get("clinicId"),
    scheduledAt: formData.get("scheduledAt"),
    durationMinutes: formData.get("durationMinutes"),
    notes: formData.get("notes"),
  };

  const parsed = appointmentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  try {
    await createAppointment(parsed.data);
    revalidatePath("/appointments");
    revalidatePath("/dashboard");
    return { success: true, message: "Appointment created successfully." };
  } catch {
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

export async function updateAppointmentStatusAction(formData: FormData) {
  await requireDoctor();

  const parsed = appointmentStatusSchema.safeParse({
    appointmentId: formData.get("appointmentId"),
    status: formData.get("status"),
  });

  if (!parsed.success) return;

  await updateAppointmentStatus(parsed.data.appointmentId, parsed.data.status);
  revalidatePath("/appointments");
  revalidatePath("/dashboard");
}
