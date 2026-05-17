import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { findDuplicatePromptIds, parseCSV, parseExcel, shufflePrompts } from "@/lib/recording/csv";
import { outputRoot, promptsJsonPath } from "@/lib/recording/paths";
import type { Prompt } from "@/lib/recording/csv";

const ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls"];

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Tidak ada file" }, { status: 400 });

  const name = file.name.toLowerCase();
  const ext = ALLOWED_EXTENSIONS.find((e) => name.endsWith(e));
  if (!ext) {
    return NextResponse.json(
      { error: `Format file tidak didukung. Gunakan: ${ALLOWED_EXTENSIONS.join(", ")}` },
      { status: 400 },
    );
  }

  let parsed: Prompt[];
  try {
    if (ext === ".csv") {
      const text = await file.text();
      parsed = parseCSV(text);
    } else {
      const buffer = await file.arrayBuffer();
      parsed = parseExcel(buffer);
    }
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }

  const prompts = shufflePrompts(parsed);
  const duplicates = findDuplicatePromptIds(prompts);
  if (duplicates.length > 0) {
    return NextResponse.json(
      { error: `ID kalimat duplikat: ${duplicates.join(", ")}` },
      { status: 400 },
    );
  }

  await fs.mkdir(outputRoot(), { recursive: true });
  await fs.writeFile(promptsJsonPath(), JSON.stringify(prompts), "utf-8");

  return NextResponse.json({ count: prompts.length });
}
