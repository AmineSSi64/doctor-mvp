import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const SEED_DATA_DIR = path.join(__dirname, "..", "seed-data");

/**
 * Reads one of the analytical CSVs bundled in prisma/seed-data/ and returns
 * an array of plain string-keyed row objects. These are the exact synthetic
 * files produced for the Star Schema task — the operational seed reuses
 * them as its source data rather than generating a second, disconnected
 * fictional dataset.
 */
export function readCsv(filename: string): Record<string, string>[] {
  const filePath = path.join(SEED_DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return parse(raw, { columns: true, skip_empty_lines: true });
}

/** Parses a YYYYMMDD integer/string date_key (as used throughout the star schema) into a Date. */
export function parseDateKey(dateKey: string): Date {
  const s = String(dateKey);
  const year = Number(s.slice(0, 4));
  const month = Number(s.slice(4, 6)) - 1;
  const day = Number(s.slice(6, 8));
  return new Date(year, month, day);
}
