import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { findDuplicatePromptIds, parseCSV, shufflePrompts } from "@/lib/recording/csv";
import { outputRoot, promptsJsonPath } from "@/lib/recording/paths";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Tidak ada file" }, { status: 400 });

  const text = await file.text();
  const prompts = shufflePrompts(parseCSV(text));
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
