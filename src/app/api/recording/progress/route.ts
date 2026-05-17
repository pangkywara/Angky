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

async function countDone(lang: Lang, allowed?: Set<string>): Promise<number> {
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
  return allowed ? [...ids].filter((id) => allowed.has(id)).length : ids.size;
}

export async function GET() {
  let total = 0;
  let allowed: Set<string> | undefined;
  try {
    const raw = await fs.readFile(promptsJsonPath(), "utf-8");
    let prompts = orderPromptsForRecording(normalizePrompts(JSON.parse(raw)));
    const max = await getMaxRecordings();
    if (max != null) prompts = prompts.slice(0, max);
    total = prompts.length;
    allowed = new Set(prompts.map((p) => p.id));
  } catch {
    /* no prompts yet */
  }
  const [idDone, sourceDone] = await Promise.all([
    countDone("indonesian", allowed),
    countDone("source", allowed),
  ]);
  return NextResponse.json({
    indonesian: { done: idDone, total },
    source: { done: sourceDone, total },
  });
}
