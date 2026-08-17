"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Alert } from "@/components/ui/alert";
import { createPrescriptionAction } from "@/features/prescriptions/actions";
import { useToast } from "@/components/ui/toast-provider";
import type { ActionState } from "@/types/actions";
import { Plus, Trash2, Loader2 } from "lucide-react";

const initialState: ActionState = { success: false };

interface Medication {
  id: string;
  name: string;
  class: string;
  defaultUnit: string;
}

interface Row {
  key: number;
  medicationId: string;
  dosage: string;
  frequencyPerDay: number;
  durationDays: number;
  quantity: number;
}

let nextKey = 1;
function emptyRow(): Row {
  return {
    key: nextKey++,
    medicationId: "",
    dosage: "",
    frequencyPerDay: 2,
    durationDays: 7,
    quantity: 14,
  };
}

export function PrescriptionForm({
  consultationId,
  patientId,
  medications,
}: {
  consultationId: string;
  patientId: string;
  medications: Medication[];
}) {
  const router = useRouter();
  const action = createPrescriptionAction.bind(null, patientId);
  const [state, formAction] = useFormState(action, initialState);
  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const { showToast } = useToast();

  useEffect(() => {
    if (state.success) {
      showToast(state.message ?? "Prescription created successfully.");
      router.push(`/patients/${patientId}`);
      router.refresh();
    }
  }, [state.success]); // eslint-disable-line react-hooks/exhaustive-deps

  function updateRow(key: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.message && !state.success && <Alert tone="danger">{state.message}</Alert>}

      <input type="hidden" name="consultationId" value={consultationId} />

      <div className="space-y-4">
        {rows.map((row, index) => (
          <div key={row.key} className="rounded-lg border border-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                Medication {index + 1}
              </p>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                  className="text-ink-soft hover:text-danger"
                  aria-label="Remove medication"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor={`medication-${row.key}`}>Medication</Label>
                <Select
                  id={`medication-${row.key}`}
                  name={`items[${index}].medicationId`}
                  value={row.medicationId}
                  onChange={(e) => updateRow(row.key, { medicationId: e.target.value })}
                  required
                >
                  <option value="" disabled>
                    Select medication
                  </option>
                  {medications.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.class})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <Label htmlFor={`dosage-${row.key}`}>Dosage</Label>
                  <Input
                    id={`dosage-${row.key}`}
                    name={`items[${index}].dosage`}
                    placeholder="500mg"
                    value={row.dosage}
                    onChange={(e) => updateRow(row.key, { dosage: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`freq-${row.key}`}>Times/day</Label>
                  <Input
                    id={`freq-${row.key}`}
                    name={`items[${index}].frequencyPerDay`}
                    type="number"
                    min={1}
                    max={6}
                    value={row.frequencyPerDay}
                    onChange={(e) =>
                      updateRow(row.key, { frequencyPerDay: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`duration-${row.key}`}>Days</Label>
                  <Input
                    id={`duration-${row.key}`}
                    name={`items[${index}].durationDays`}
                    type="number"
                    min={1}
                    max={180}
                    value={row.durationDays}
                    onChange={(e) => updateRow(row.key, { durationDays: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`qty-${row.key}`}>Quantity</Label>
                  <Input
                    id={`qty-${row.key}`}
                    name={`items[${index}].quantity`}
                    type="number"
                    min={1}
                    max={1000}
                    value={row.quantity}
                    onChange={(e) => updateRow(row.key, { quantity: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, emptyRow()])}
        className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <Plus className="h-4 w-4" /> Add another medication
      </button>

      <div className="flex gap-3 pt-2">
        <SubmitButton />
        <CancelButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? "Saving..." : "Save prescription"}
    </Button>
  );
}

function CancelButton() {
  const { pending } = useFormStatus();
  const router = useRouter();
  return (
    <Button type="button" variant="ghost" onClick={() => router.back()} disabled={pending}>
      Cancel
    </Button>
  );
}
