import * as XLSX from "xlsx";
import {
  ApplicationStatus,
  APPLICATION_STATUS_KEYS,
  JobApplication,
} from "./application-schema";

export interface ParsedImportRow {
  rowNumber: number;
  company: string;
  position: string;
  location: string;
  status: ApplicationStatus;
  appliedDate?: string;
  salary: string;
  url: string;
  notes: string;
  rawRecord: Record<string, string>;
  isDuplicate?: boolean;
  duplicateOfId?: string;
  errors: string[];
}

export interface ImportParseResult {
  headers: string[];
  suggestedMapping: Record<string, string>;
  rows: ParsedImportRow[];
  totalRawRows: number;
  validRowsCount: number;
}

const FIELD_ALIASES: Record<string, string[]> = {
  company: ["company", "company name", "organization", "employer", "firm", "business", "corp"],
  position: ["position", "role", "job title", "title", "designation", "job", "job role"],
  status: ["status", "stage", "state", "phase", "pipeline", "progress"],
  location: ["location", "city", "country", "place", "office", "region"],
  appliedDate: ["applied date", "date applied", "date", "applied", "application date", "submitted on", "submission date"],
  salary: ["salary", "compensation", "pay", "package", "ctc", "rate", "remuneration"],
  url: ["url", "link", "job url", "posting", "posting link", "job link", "website"],
  notes: ["notes", "comments", "details", "remarks", "feedback", "description"],
};

export function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

/**
 * Standard RFC-4180 CSV parser supporting quotes, commas, newlines, and BOM
 */
export function parseCsvText(csvText: string): Record<string, string>[] {
  // Strip UTF-8 BOM if present
  const cleanText = csvText.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let insideQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = "";
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      currentRow.push(currentField.trim());
      currentField = "";
      if (currentRow.some((field) => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.replace(/^["']|["']$/g, "").trim());
  const data: Record<string, string>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const record: Record<string, string> = {};
    headers.forEach((header, idx) => {
      record[header] = (row[idx] || "").replace(/^["']|["']$/g, "").trim();
    });
    data.push(record);
  }

  return data;
}

/**
 * Parses XLSX / XLS ArrayBuffer using SheetJS
 */
export function parseExcelBuffer(buffer: ArrayBuffer): Record<string, string>[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];

  const worksheet = workbook.Sheets[firstSheetName];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    raw: false,
    defval: "",
  });

  return json.map((row) => {
    const record: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) {
      record[k.trim()] = String(v ?? "").trim();
    }
    return record;
  });
}

/**
 * Normalizes raw status string to recognized ApplicationStatus
 */
export function normalizeStatus(rawStatus?: string): ApplicationStatus {
  if (!rawStatus) return "applied";
  const s = rawStatus.toLowerCase().replace(/[^a-z]/g, "");
  if (s.includes("saved") || s.includes("bookmark") || s.includes("wishlist")) return "saved";
  if (s.includes("interview") || s.includes("round") || s.includes("onsite") || s.includes("tech")) return "interview";
  if (s.includes("screen") || s.includes("recruit") || s.includes("hr") || s.includes("call")) return "screening";
  if (s.includes("offer") || s.includes("accepted") || s.includes("hired")) return "offer";
  if (s.includes("reject") || s.includes("declined") || s.includes("archive") || s.includes("closed")) return "rejected";
  if (s.includes("withdraw") || s.includes("cancel") || s.includes("passed")) return "withdrawn";
  if (s.includes("applied") || s.includes("submit") || s.includes("sent")) return "applied";
  return "applied";
}

/**
 * Suggests best column mappings based on common field aliases
 */
export function suggestColumnMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  for (const [targetKey, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const header of headers) {
      const norm = header.toLowerCase().trim();
      if (aliases.includes(norm) || aliases.some((a) => norm.includes(a))) {
        mapping[targetKey] = header;
        break;
      }
    }
  }

  return mapping;
}

/**
 * Parses raw records into typed, reviewed import rows
 */
export function processImportRecords(
  records: Record<string, string>[],
  columnMapping: Record<string, string>,
  existingApplications: JobApplication[] = []
): ImportParseResult {
  if (records.length === 0) {
    return {
      headers: [],
      suggestedMapping: {},
      rows: [],
      totalRawRows: 0,
      validRowsCount: 0,
    };
  }

  const headers = Object.keys(records[0]);
  const rows: ParsedImportRow[] = [];

  // Create hash index of existing applications for instant O(1) duplicate checks
  const existingSet = new Map<string, string>();
  existingApplications.forEach((app) => {
    const key = `${app.company.toLowerCase().trim()}:::${app.position.toLowerCase().trim()}`;
    existingSet.set(key, app.id);
  });

  records.forEach((record, index) => {
    const companyHeader = columnMapping.company;
    const positionHeader = columnMapping.position;
    const locationHeader = columnMapping.location;
    const statusHeader = columnMapping.status;
    const dateHeader = columnMapping.appliedDate;
    const salaryHeader = columnMapping.salary;
    const urlHeader = columnMapping.url;
    const notesHeader = columnMapping.notes;

    const company = (companyHeader ? record[companyHeader] : "") || "";
    const position = (positionHeader ? record[positionHeader] : "") || "";
    const location = (locationHeader ? record[locationHeader] : "") || "";
    const rawStatus = (statusHeader ? record[statusHeader] : "") || "";
    const rawDate = (dateHeader ? record[dateHeader] : "") || "";
    const salary = (salaryHeader ? record[salaryHeader] : "") || "";
    const url = (urlHeader ? record[urlHeader] : "") || "";
    const notes = (notesHeader ? record[notesHeader] : "") || "";

    const errors: string[] = [];
    if (!company) errors.push("Missing Company name");
    if (!position) errors.push("Missing Role / Position");

    let appliedDate: string | undefined = undefined;
    if (rawDate) {
      const parsedD = new Date(rawDate);
      if (!isNaN(parsedD.getTime())) {
        appliedDate = parsedD.toISOString();
      }
    }

    const checkKey = `${company.toLowerCase().trim()}:::${position.toLowerCase().trim()}`;
    const duplicateOfId = company && position ? existingSet.get(checkKey) : undefined;
    const isDuplicate = Boolean(duplicateOfId);

    rows.push({
      rowNumber: index + 1,
      company,
      position,
      location,
      status: normalizeStatus(rawStatus),
      appliedDate,
      salary,
      url,
      notes,
      rawRecord: record,
      isDuplicate,
      duplicateOfId,
      errors,
    });
  });

  const validRowsCount = rows.filter((r) => r.errors.length === 0).length;

  return {
    headers,
    suggestedMapping: columnMapping,
    rows,
    totalRawRows: records.length,
    validRowsCount,
  };
}
