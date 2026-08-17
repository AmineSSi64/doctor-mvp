"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Alert } from "@/components/ui/alert";
import { FormSection } from "@/components/ui/form-section";
import { createConsultationAction } from "@/features/consultations/actions";
import { formatDateTime, CONSULTATION_TYPE_LABEL } from "@/lib/utils";
import { OTHER_DIAGNOSIS_VALUE } from "@/lib/validation/schemas";
import { useToast } from "@/components/ui/toast-provider";
import type { ActionState } from "@/types/actions";
import type { Appointment } from "@prisma/client";
import { Loader2 } from "lucide-react";

const initialState: ActionState = { success: false };

export function ConsultationForm({
  patientId,
  diagnoses,
  appointments,
}: {
  patientId: string;
  diagnoses: { id: string; name: string; category: string; isOther: boolean }[];
  appointments: Appointment[];
}) {
  const router = useRouter();
  const [state, formAction] = useFormState(createConsultationAction, initialState);
  const [diagnosisChoice, setDiagnosisChoice] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    if (state.success) {
      showToast(state.message ?? "Consultation saved.");
      router.push(`/patients/${patientId}`);
      router.refresh();
    }
  }, [state.success]); // eslint-disable-line react-hooks/exhaustive-deps

  const now = new Date();
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const isOtherSelected = diagnosisChoice === OTHER_DIAGNOSIS_VALUE;

  return (
    <form action={formAction} className="space-y-6">
      {state.message && !state.success && <Alert tone="danger">{state.message}</Alert>}

      <input type="hidden" name="patientId" value={patientId} />

      {appointments.length > 0 && (
        <div>
          <Label htmlFor="appointmentId">Linked appointment (optional)</Label>
          <Select id="appointmentId" name="appointmentId" defaultValue="">
            <option value="">Walk-in — no linked appointment</option>
            {appointments.map((a) => (
              <option key={a.id} value={a.id}>
                {formatDateTime(a.scheduledAt)}
              </option>
            ))}
          </Select>
          <p className="mt-1 text-xs text-ink-soft">
            Linking marks that appointment as completed.
          </p>
        </div>
      )}

      <FormSection title="Consultation details">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="type">Consultation type</Label>
            <Select id="type" name="type" defaultValue="" required>
              <option value="" disabled>
                Select type
              </option>
              {Object.entries(CONSULTATION_TYPE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <FieldError message={state.fieldErrors?.type} />
          </div>
          <div>
            <Label htmlFor="diagnosisId">Diagnosis</Label>
            <Select
              id="diagnosisId"
              name="diagnosisId"
              value={diagnosisChoice}
              onChange={(e) => setDiagnosisChoice(e.target.value)}
              required
            >
              <option value="" disabled>
                Select diagnosis
              </option>
              {diagnoses
                .filter((d) => !d.isOther)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              <option value={OTHER_DIAGNOSIS_VALUE}>Other…</option>
            </Select>
            <FieldError message={state.fieldErrors?.diagnosisId} />
          </div>
        </div>

        {isOtherSelected && (
          <div>
            <Label htmlFor="customDiagnosis">Specify diagnosis</Label>
            <Input
              id="customDiagnosis"
              name="customDiagnosis"
              placeholder="e.g. Post-viral fatigue syndrome"
              error={state.fieldErrors?.customDiagnosis}
              autoFocus
              required
            />
            <FieldError message={state.fieldErrors?.customDiagnosis} />
          </div>
        )}

        <div>
          <Label htmlFor="symptoms">Symptoms</Label>
          <Textarea
            id="symptoms"
            name="symptoms"
            rows={3}
            placeholder="What the patient reported — fever, pain location, duration..."
            error={state.fieldErrors?.symptoms}
          />
          <FieldError message={state.fieldErrors?.symptoms} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="consultedAt">Date &amp; time</Label>
            <Input
              id="consultedAt"
              name="consultedAt"
              type="datetime-local"
              defaultValue={localNow}
              required
            />
            <FieldError message={state.fieldErrors?.consultedAt} />
          </div>
          <div>
            <Label htmlFor="durationMinutes">Duration (minutes)</Label>
            <Input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              defaultValue={20}
              min={5}
              max={240}
              required
            />
            <FieldError message={state.fieldErrors?.durationMinutes} />
          </div>
        </div>
      </FormSection>

      <FormSection title="Clinical notes">
        <div>
          <Label htmlFor="notes">Notes / follow-up plan (optional)</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Observations, treatment plan, follow-up instructions..."
          />
          <FieldError message={state.fieldErrors?.notes} />
        </div>
      </FormSection>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  const router = useRouter();
  return (
    <div className="flex gap-3 pt-2">
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Saving..." : "Save consultation"}
      </Button>
      <Button type="button" variant="ghost" onClick={() => router.back()} disabled={pending}>
        Cancel
      </Button>
    </div>
  );
}
