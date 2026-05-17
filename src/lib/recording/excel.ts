import type { Prompt } from "./csv";
import * as XLSX from "xlsx";

export function parseExcel(buffer: ArrayBuffer): Prompt[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("File Excel kosong (tidak ada sheet)");

  const sheet = workbook.Sheets[sheetName];
  const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  // Filter out empty rows
  const dataRows = rows.filter(
    (row) => row.length >= 2 && (row[0]?.toString().trim() || row[1]?.toString().trim()),
  );

  if (dataRows.length === 0) {
    throw new Error("File Excel tidak memiliki data. Pastikan kolom A = Bahasa Indonesia, kolom B = Bahasa Sumber.");
  }

  const width = String(dataRows.length).length;

  return dataRows.map((row, i) => ({
    id: String(i + 1).padStart(width, "0"),
    indonesian: (row[0]?.toString() ?? "").trim(),
    source: (row[1]?.toString() ?? "").trim(),
  }));
}
