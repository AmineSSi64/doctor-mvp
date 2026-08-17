import type { ZodError } from "zod";

/** Turns a ZodError into a simple { fieldName: firstMessage } map for form UIs. */
export function flattenZodErrors(error: ZodError): Record<string, string> {
  const flat = error.flatten().fieldErrors;
  const out: Record<string, string> = {};
  for (const key in flat) {
    const messages = flat[key as keyof typeof flat];
    if (messages && messages[0]) out[key] = messages[0];
  }
  return out;
}
