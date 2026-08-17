import { db } from "@/lib/db";

/** Small reference lists used to populate <select> pickers across forms. */

export async function listClinics() {
  return db.clinic.findMany({ orderBy: { name: "asc" } });
}

export async function listDoctors() {
  return db.doctor.findMany({
    orderBy: { lastName: "asc" },
    include: { clinic: true },
  });
}
