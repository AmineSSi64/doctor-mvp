"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Alert } from "@/components/ui/alert";
import { FormSection } from "@/components/ui/form-section";
import { createAppointmentAction } from "@/features/appointments/actions";
import { useToast } from "@/components/ui/toast-provider";
import type { ActionState } from "@/types/actions";
import { Loader2 } from "lucide-react";

const initialState: ActionState = { success: false };

interface Option {
  id: string;
  firstName: string;
  lastName: string;
  patientCode?: string;
  clinic?: { id: string; name: string };
  name?: string;
}

export function AppointmentForm({
  patients,
  doctors,
  clinics,
  defaultPatientId,
}: {
  patients: Option[];
  doctors: Option[];
  clinics: { id: string; name: string }[];
  defaultPatientId?: string;
}) {
  const router = useRouter();
  const [state, formAction] = useFormState(createAppointmentAction, initialState);
  const { showToast } = useToast();

  useEffect(() => {
    if (state.success) {
      showToast(state.message ?? "Appointment created successfully.");
      router.push("/appointments");
      router.refresh();
    }
  }, [state.success]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={formAction} className="space-y-6">
      {state.message && !state.success && <Alert tone="danger">{state.message}</Alert>}

      <FormSection title="Who and where">
        <div>
          <Label htmlFor="patientId">Patient</Label>
          <Select id="patientId" name="patientId" defaultValue={defaultPatientId ?? ""} required>
            <option value="" disabled>
              Select patient
            </option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName} ({p.patientCode})
              </option>
            ))}
          </Select>
          <FieldError message={state.fieldErrors?.patientId} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="doctorId">Doctor</Label>
            <Select id="doctorId" name="doctorId" defaultValue="" required>
              <option value="" disabled>
                Select doctor
              </option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.firstName} {d.lastName}
                </option>
              ))}
            </Select>
            <FieldError message={state.fieldErrors?.doctorId} />
          </div>
          <div>
            <Label htmlFor="clinicId">Clinic</Label>
            <Select id="clinicId" name="clinicId" defaultValue="" required>
              <option value="" disabled>
                Select clinic
              </option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <FieldError message={state.fieldErrors?.clinicId} />
          </div>
        </div>
      </FormSection>

      <FormSection title="When">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="scheduledAt">Date &amp; time</Label>
            <Input id="scheduledAt" name="scheduledAt" type="datetime-local" required />
            <FieldError message={state.fieldErrors?.scheduledAt} />
          </div>
          <div>
            <Label htmlFor="durationMinutes">Duration (minutes)</Label>
            <Input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              defaultValue={30}
              min={5}
              max={240}
              required
            />
            <FieldError message={state.fieldErrors?.durationMinutes} />
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea id="notes" name="notes" rows={3} placeholder="Reason for visit..." />
          <FieldError message={state.fieldErrors?.notes} />
        </div>
      </FormSection>

      <SubmitRow />
    </form>
  );
}

function SubmitRow() {
  const { pending } = useFormStatus();
  const router = useRouter();
  return (
    <div className="flex gap-3 pt-2">
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Saving..." : "Create appointment"}
      </Button>
      <Button type="button" variant="ghost" onClick={() => router.back()} disabled={pending}>
        Cancel
      </Button>
    </div>
  );
}
