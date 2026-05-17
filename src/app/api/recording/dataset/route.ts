import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { promptsJsonPath, wavDirsForRead, outputRoot } from "@/lib/recording/paths";
import { normalizePrompts, orderPromptsForRecording } from "@/lib/recording/csv";
import type { Lang } from "@/lib/recording/paths";
import type { Prompt } from "@/lib/recording/csv";

async function listDoneIds(lang: Lang): Promise<string[]> {
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
  return [...ids].sort();
}

async function getMaxRecordings(): Promise<number | null> {
  try {
    const raw = await fs.readFile(path.join(outputRoot(), "config.json"), "utf-8");
    const cfg = JSON.parse(raw);
    return typeof cfg.maxRecordings === "number" ? cfg.maxRecordings : null;
  } catch {
    return null;
  }
}

export async function GET() {
  let prompts: Prompt[] = [];
  try {
    const raw = await fs.readFile(promptsJsonPath(), "utf-8");
    prompts = orderPromptsForRecording(normalizePrompts(JSON.parse(raw)));
  } catch {
    /* no prompts */
  }
  const [indonesian, source, maxRecordings] = await Promise.all([
    listDoneIds("indonesian"),
    listDoneIds("source"),
    getMaxRecordings(),
  ]);
  const activePrompts =
    maxRecordings != null ? prompts.slice(0, maxRecordings) : prompts;
  const allowedIds = new Set(activePrompts.map((p) => p.id));
  const total = activePrompts.length;

  // Map id -> text for sidebar tooltips
  const idToText = new Map(activePrompts.map((p) => [p.id, { indonesian: p.indonesian, source: p.source }]));

  return NextResponse.json({
    total,
    promptsLoaded: prompts.length,
    maxRecordings,
    indonesian: indonesian
      .filter((id) => allowedIds.has(id))
      .map((id) => ({ id, text: idToText.get(id)?.indonesian ?? "" })),
    source: source
      .filter((id) => allowedIds.has(id))
      .map((id) => ({ id, text: idToText.get(id)?.source ?? "" })),
  });
}
