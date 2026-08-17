"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Alert } from "@/components/ui/alert";
import { FormSection } from "@/components/ui/form-section";
import { createPatientAction, updatePatientAction } from "@/features/patients/actions";
import { normalizeTunisianPhone } from "@/lib/phone";
import { useToast } from "@/components/ui/toast-provider";
import type { ActionState } from "@/types/actions";
import { Loader2 } from "lucide-react";

const TUNISIAN_CITIES = [
  ["Tunis", "Tunis"],
  ["Ariana", "Ariana"],
  ["Ben Arous", "Ben Arous"],
  ["Manouba", "Manouba"],
  ["Bizerte", "Bizerte"],
  ["Nabeul", "Nabeul"],
  ["Hammamet", "Nabeul"],
  ["Sousse", "Sousse"],
  ["Monastir", "Monastir"],
  ["Sfax", "Sfax"],
  ["Beja", "Beja"],
  ["Kairouan", "Kairouan"],
  ["Gabes", "Gabes"],
  ["Medenine", "Medenine"],
  ["Gafsa", "Gafsa"],
] as const;

const initialState: ActionState = { success: false };

interface PatientFormProps {
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    gender: "M" | "F";
    dateOfBirth: Date | string;
    phone: string;
    city: string;
    governorate: string;
  };
}

export function PatientForm({ patient }: PatientFormProps) {
  const router = useRouter();
  const action = patient
    ? updatePatientAction.bind(null, patient.id)
    : createPatientAction;
  const [state, formAction] = useFormState(action, initialState);
  const [phone, setPhone] = useState(patient?.phone ?? "");
  const { showToast } = useToast();

  useEffect(() => {
    if (state.success) {
      showToast(state.message ?? "Patient saved successfully.");
      const target = patient ? `/patients/${patient.id}` : `/patients/${state.patientId}`;
      router.push(target);
      router.refresh();
    }
  }, [state.success]); // eslint-disable-line react-hooks/exhaustive-deps

  const dob =
    patient && typeof patient.dateOfBirth !== "string"
      ? patient.dateOfBirth.toISOString().slice(0, 10)
      : (patient?.dateOfBirth as string | undefined)?.slice(0, 10);

  // Reformats the phone field to the canonical "+216 XX XXX XXX" as soon as
  // the doctor leaves the field, so what they see matches what gets saved —
  // matches lib/validation/schemas.ts's server-side normalization exactly.
  function handlePhoneBlur() {
    const normalized = normalizeTunisianPhone(phone);
    if (normalized) setPhone(normalized);
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.message && !state.success && <Alert tone="danger">{state.message}</Alert>}

      <FormSection title="Patient information">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              name="firstName"
              defaultValue={patient?.firstName}
              error={state.fieldErrors?.firstName}
              required
            />
            <FieldError message={state.fieldErrors?.firstName} />
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              name="lastName"
              defaultValue={patient?.lastName}
              error={state.fieldErrors?.lastName}
              required
            />
            <FieldError message={state.fieldErrors?.lastName} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select id="gender" name="gender" defaultValue={patient?.gender ?? ""} required>
              <option value="" disabled>
                Select gender
              </option>
              <option value="F">Female</option>
              <option value="M">Male</option>
            </Select>
            <FieldError message={state.fieldErrors?.gender} />
          </div>
          <div>
            <Label htmlFor="dateOfBirth">Date of birth</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              defaultValue={dob}
              error={state.fieldErrors?.dateOfBirth}
              required
            />
            <FieldError message={state.fieldErrors?.dateOfBirth} />
          </div>
        </div>
      </FormSection>

      <FormSection title="Contact information">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="29 526 066"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={handlePhoneBlur}
            error={state.fieldErrors?.phone}
            required
          />
          <FieldError message={state.fieldErrors?.phone} />
          <p className="mt-1 text-xs text-ink-soft">
            Any reasonable format works — with or without spaces or the +216 code. It&apos;s
            normalized automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="city">City</Label>
            <Select
              id="city"
              name="city"
              defaultValue={patient?.city ?? ""}
              required
              onChange={(e) => {
                const form = e.currentTarget.form;
                const govInput = form?.elements.namedItem("governorate") as HTMLInputElement | null;
                const match = TUNISIAN_CITIES.find(([city]) => city === e.currentTarget.value);
                if (govInput && match) govInput.value = match[1];
              }}
            >
              <option value="" disabled>
                Select city
              </option>
              {TUNISIAN_CITIES.map(([city]) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </Select>
            <FieldError message={state.fieldErrors?.city} />
          </div>
          <div>
            <Label htmlFor="governorate">Governorate</Label>
            <Input
              id="governorate"
              name="governorate"
              defaultValue={patient?.governorate}
              error={state.fieldErrors?.governorate}
              required
            />
            <FieldError message={state.fieldErrors?.governorate} />
          </div>
        </div>
      </FormSection>

      <SubmitRow isEdit={!!patient} />
    </form>
  );
}

function SubmitRow({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  const router = useRouter();
  return (
    <div className="flex gap-3 pt-2">
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Saving..." : isEdit ? "Save changes" : "Create patient"}
      </Button>
      <Button type="button" variant="ghost" onClick={() => router.back()} disabled={pending}>
        Cancel
      </Button>
    </div>
  );
}
