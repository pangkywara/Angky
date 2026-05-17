import type { Prompt } from "./csv";
import ExcelJS from "exceljs";

export async function parseExcel(buffer: ArrayBuffer): Promise<Prompt[]> {
  const workbook = new ExcelJS.Workbook();
  // ExcelJS accepts ArrayBuffer at runtime but types only declare Buffer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await workbook.xlsx.load(buffer as any);

  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error("File Excel kosong (tidak ada sheet)");

  const dataRows: [string, string][] = [];
  sheet.eachRow((row) => {
    const col1 = (row.getCell(1).text ?? "").trim();
    const col2 = (row.getCell(2).text ?? "").trim();
    if (col1 || col2) {
      dataRows.push([col1, col2]);
    }
  });

  if (dataRows.length === 0) {
    throw new Error("File Excel tidak memiliki data. Pastikan kolom A = Bahasa Indonesia, kolom B = Bahasa Sumber.");
  }

  const width = String(dataRows.length).length;

  return dataRows.map((row, i) => ({
    id: String(i + 1).padStart(width, "0"),
    indonesian: row[0],
    source: row[1],
  }));
}
