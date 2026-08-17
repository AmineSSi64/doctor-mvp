"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDate, formatDateTime, CONSULTATION_TYPE_LABEL, CONSULTATION_TYPE_TONE } from "@/lib/utils";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { PremiumTabNav, type TabNavItem } from "@/components/ui/tab-nav";
import { AppointmentStatusBadge } from "@/components/appointments/status-badge";
import {
  Plus,
  FileText,
  Stethoscope,
  CalendarDays,
  ClipboardList,
  Pill,
  LayoutGrid,
} from "lucide-react";
import type { getPatientProfile } from "@/server/services/patientService";

type Patient = NonNullable<Awaited<ReturnType<typeof getPatientProfile>>>;
type ConsultationWithRelations = Patient["consultations"][number];

/** A consultation's displayed diagnosis: the doctor's free-text entry when
 * the catalog diagnosis is the "Other" row, otherwise the catalog name. */
function diagnosisLabel(consultation: ConsultationWithRelations): string {
  return consultation.customDiagnosis || consultation.diagnosis.name;
}

const TABS: readonly TabNavItem<Tab>[] = [
  { key: "Overview", label: "Overview", icon: LayoutGrid },
  { key: "Consultations", label: "Consultations", icon: Stethoscope },
  { key: "Prescriptions", label: "Prescriptions", icon: Pill },
  { key: "Appointments", label: "Appointments", icon: CalendarDays },
] as const;
type Tab = "Overview" | "Consultations" | "Prescriptions" | "Appointments";

export function PatientProfileTabs({ patient }: { patient: Patient }) {
  const [tab, setTab] = useState<Tab>("Overview");

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
      <PremiumTabNav tabs={TABS} active={tab} onChange={setTab} />

      <div className="pt-5">
        {tab === "Overview" && <OverviewTab patient={patient} />}
        {tab === "Consultations" && <ConsultationsTab patient={patient} />}
        {tab === "Prescriptions" && <PrescriptionsTab patient={patient} />}
        {tab === "Appointments" && <AppointmentsTab patient={patient} />}
      </div>
    </div>
  );
}

function OverviewTab({ patient }: { patient: Patient }) {
  const latest = patient.consultations[0];

  // Build a unified, date-sorted timeline out of two different event types.
  const timelineEvents = [
    ...patient.consultations.map((c) => ({
      date: c.consultedAt,
      kind: "Consultation" as const,
      label: CONSULTATION_TYPE_LABEL[c.type],
      sub: diagnosisLabel(c),
      icon: Stethoscope,
    })),
    ...patient.prescriptions.map((p) => ({
      date: p.issuedAt,
      kind: "Prescription" as const,
      label: `${p.items.length} medication${p.items.length === 1 ? "" : "s"}`,
      sub: null,
      icon: FileText,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Most recent consultation</CardTitle>
        </CardHeader>
        <CardBody>
          {latest ? (
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-xs text-ink-soft">Date</dt>
                <dd className="mt-0.5 text-ink">{formatDate(latest.consultedAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft">Doctor</dt>
                <dd className="mt-0.5 text-ink">
                  Dr. {latest.doctor.firstName} {latest.doctor.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft">Type</dt>
                <dd className="mt-0.5">
                  <Badge tone={CONSULTATION_TYPE_TONE[latest.type]}>{CONSULTATION_TYPE_LABEL[latest.type]}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft">Diagnosis</dt>
                <dd className="mt-0.5 text-ink">{diagnosisLabel(latest)}</dd>
              </div>
              {latest.symptoms && (
                <div className="col-span-full">
                  <dt className="text-xs text-ink-soft">Symptoms</dt>
                  <dd className="mt-0.5 text-ink">{latest.symptoms}</dd>
                </div>
              )}
              {latest.notes && (
                <div className="col-span-full">
                  <dt className="text-xs text-ink-soft">Notes</dt>
                  <dd className="mt-0.5 text-ink">{latest.notes}</dd>
                </div>
              )}
            </dl>
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="No consultations yet"
              description="This patient's clinical history will appear here once a consultation is recorded."
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medical history timeline</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {timelineEvents.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No history yet" />
          ) : (
            <ul className="divide-y divide-border">
              {timelineEvents.map((e, i) => {
                const Icon = e.icon;
                const isLast = i === timelineEvents.length - 1;
                return (
                  <li key={i} className="relative flex items-start gap-3 px-5 py-3">
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 left-[34px] top-9 w-px bg-border"
                      />
                    )}
                    <span className="relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-sm text-ink">
                        <span className="font-medium">{e.kind}</span> — {e.label}
                      </p>
                      {e.sub && <p className="text-xs text-ink-muted">{e.sub}</p>}
                      <p className="text-xs text-ink-soft">{formatDate(e.date)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function ConsultationsTab({ patient }: { patient: Patient }) {
  if (patient.consultations.length === 0) {
    return (
      <EmptyState
        icon={Stethoscope}
        title="No consultations yet"
        description="Create the first consultation for this patient to start building their clinical history."
        action={
          <Link href={`/consultations/new?patientId=${patient.id}`}>
            <Button size="sm">
              <Plus className="h-4 w-4" /> New Consultation
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {patient.consultations.map((c, i) => (
        <Card key={c.id} interactive className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
          <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={CONSULTATION_TYPE_TONE[c.type]}>{CONSULTATION_TYPE_LABEL[c.type]}</Badge>
                <p className="text-sm font-medium text-ink">{diagnosisLabel(c)}</p>
              </div>
              <p className="text-xs text-ink-muted">
                {formatDateTime(c.consultedAt)} · Dr. {c.doctor.firstName} {c.doctor.lastName} ·{" "}
                {c.durationMinutes} min
              </p>
              {c.symptoms && (
                <p className="text-sm text-ink-muted">
                  <span className="font-medium text-ink-soft">Symptoms: </span>
                  {c.symptoms}
                </p>
              )}
              {c.notes && (
                <p className="text-sm text-ink-muted">
                  <span className="font-medium text-ink-soft">Notes: </span>
                  {c.notes}
                </p>
              )}
            </div>
            {c.prescriptions.length > 0 ? (
              <Badge tone="accent">
                <Pill className="h-3 w-3" />
                {c.prescriptions.length} prescription{c.prescriptions.length === 1 ? "" : "s"}
              </Badge>
            ) : (
              <Link href={`/prescriptions/new?consultationId=${c.id}`} className="shrink-0">
                <Button variant="secondary" size="sm">
                  <Plus className="h-4 w-4" /> Add Prescription
                </Button>
              </Link>
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function PrescriptionsTab({ patient }: { patient: Patient }) {
  if (patient.prescriptions.length === 0) {
    return (
      <EmptyState
        icon={Pill}
        title="No prescriptions yet"
        description="Prescriptions created from this patient's consultations will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {patient.prescriptions.map((p, i) => (
        <Card key={p.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
          <CardHeader>
            <CardTitle>{formatDate(p.issuedAt)}</CardTitle>
            <span className="text-xs text-ink-muted">
              Dr. {p.doctor.firstName} {p.doctor.lastName}
            </span>
          </CardHeader>
          <CardBody className="p-0">
            <ul className="divide-y divide-border">
              {p.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between px-5 py-2.5 text-sm">
                  <span className="text-ink">{item.medication.name}</span>
                  <span className="text-ink-muted">
                    {item.dosage} · {item.frequencyPerDay}x/day · {item.durationDays} days
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function AppointmentsTab({ patient }: { patient: Patient }) {
  if (patient.appointments.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No appointments yet"
        description="Schedule this patient's first appointment to get started."
        action={
          <Link href={`/appointments/new?patientId=${patient.id}`}>
            <Button size="sm">
              <Plus className="h-4 w-4" /> New Appointment
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {patient.appointments.map((a, i) => (
        <Card key={a.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
          <CardBody className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <CalendarDays className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{formatDateTime(a.scheduledAt)}</p>
                <p className="text-xs text-ink-muted">
                  Dr. {a.doctor.firstName} {a.doctor.lastName} · {a.clinic.name}
                </p>
              </div>
            </div>
            <AppointmentStatusBadge status={a.status} />
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
