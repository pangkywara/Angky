import type { Prompt } from "./csv";
import { readSheet } from "read-excel-file/node";

export async function parseExcel(buffer: ArrayBuffer): Promise<Prompt[]> {
  const rows = await readSheet(Buffer.from(buffer));

  // Filter out empty rows
  const dataRows = rows.filter(
    (row) => row.length >= 2 && ((row[0]?.toString() ?? "").trim() || (row[1]?.toString() ?? "").trim()),
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
