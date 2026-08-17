/** Shared return shape for every Server Action that backs a form. */
export type ActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  patientId?: string;
  consultationId?: string;
};
