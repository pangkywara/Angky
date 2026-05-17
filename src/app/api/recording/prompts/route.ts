import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { promptsJsonPath, wavDirsForRead, outputRoot } from "@/lib/recording/paths";
import { normalizePrompts, orderPromptsForRecording } from "@/lib/recording/csv";
import type { Lang } from "@/lib/recording/paths";

async function getMaxRecordings(): Promise<number | null> {
  try {
    const raw = await fs.readFile(path.join(outputRoot(), "config.json"), "utf-8");
    const cfg = JSON.parse(raw);
    return typeof cfg.maxRecordings === "number" ? cfg.maxRecordings : null;
  } catch {
    return null;
  }
}

async function getDoneIds(lang: Lang): Promise<Set<string>> {
  const ids = new Set<string>();
  for (const dir of wavDirsForRead(lang)) {
    try {
      const files = await fs.readdir(dir);
      files
        .filter((f) => f.endsWith(".wav"))
        .forEach((f) => ids.add(f.replace(".wav", "")));
    } catch {
      /* missing dir */
    }
  }
  return ids;
}

export async function GET() {
  try {
    const raw = await fs.readFile(promptsJsonPath(), "utf-8");
    let prompts = orderPromptsForRecording(normalizePrompts(JSON.parse(raw)));
    const max = await getMaxRecordings();
    if (max != null) prompts = prompts.slice(0, max);

    const [idDone, sourceDone] = await Promise.all([
      getDoneIds("indonesian"),
      getDoneIds("source"),
    ]);
    const result = prompts.map((p) => ({
      ...p,
      indonesianDone: idDone.has(p.id),
      sourceDone: sourceDone.has(p.id),
    }));
    return NextResponse.json(result);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
