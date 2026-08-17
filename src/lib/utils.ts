import { clsx, type ClassValue } from "clsx";

// Small clsx re-export so components can compose conditional Tailwind
// classes without importing a class-merging library for the whole project.
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Age in whole years as of "now" (or a given reference date). */
export function calculateAge(dateOfBirth: Date | string, now: Date = new Date()): number {
  const dob = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export function ageGroup(age: number): string {
  if (age <= 17) return "0-17";
  if (age <= 35) return "18-35";
  if (age <= 50) return "36-50";
  if (age <= 65) return "51-65";
  return "65+";
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export const APPOINTMENT_STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No-show",
};

export const CONSULTATION_TYPE_LABEL: Record<string, string> = {
  FIRST_VISIT: "First Visit",
  FOLLOW_UP: "Follow-up",
  EMERGENCY: "Emergency",
  ROUTINE_CHECK: "Routine Checkup",
};

/** Badge tone per consultation type — used on the redesigned patient
 * profile so consultation history is scannable by color, matching the
 * same "genuinely distinct hue per category" pattern as appointment
 * status badges. */
export const CONSULTATION_TYPE_TONE: Record<string, "primary" | "info" | "danger" | "success"> = {
  FIRST_VISIT: "primary",
  FOLLOW_UP: "info",
  EMERGENCY: "danger",
  ROUTINE_CHECK: "success",
};

/**
 * Total number of dispensing units across a set of prescription items.
 * Kept as a pure function so it is trivially testable and reusable
 * between the prescription form's live summary and the printable view.
 */
export function totalPrescriptionQuantity(items: { quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
