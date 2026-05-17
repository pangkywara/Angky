import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import {
  validateLang,
  validateId,
  wavDir,
  wavDirsForRead,
  wavPath,
  metadataPath,
  promptsJsonPath,
} from "@/lib/recording/paths";
import { normalizePrompts } from "@/lib/recording/csv";
import type { Lang } from "@/lib/recording/paths";

// Per-language async mutex
const locks: Map<string, Promise<void>> = new Map();

async function withLock(lang: string, fn: () => Promise<void>): Promise<void> {
  const prev = locks.get(lang) ?? Promise.resolve();
  let resolve!: () => void;
  const next = new Promise<void>((r) => (resolve = r));
  locks.set(lang, next);
  await prev;
  try {
    await fn();
  } finally {
    resolve();
  }
}

async function rebuildMetadata(lang: Lang): Promise<void> {
  const [raw, filesByDir] = await Promise.all([
    fs.readFile(promptsJsonPath(), "utf-8").catch(() => "[]"),
    Promise.all(wavDirsForRead(lang).map((dir) => fs.readdir(dir).catch(() => [] as string[]))),
  ]);
  const prompts = normalizePrompts(JSON.parse(raw));
  const textMap = new Map(prompts.map((p) => [p.id, lang === "indonesian" ? p.indonesian : p.source]));

  const ids = [...new Set(filesByDir.flat()
    .filter((f) => f.endsWith(".wav"))
    .map((f) => f.replace(".wav", "")))]
    .sort();

  const rows = ids
    .map((id) => `${id}|${textMap.get(id) ?? ""}`)
    .join("\n");

  const dest = metadataPath(lang);
  const tmp = dest + ".tmp";
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(tmp, rows, "utf-8");
  await fs.rename(tmp, dest);
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const langRaw = form.get("lang") as string;
  const id = form.get("id") as string;
  const audio = form.get("audio") as File | null;

  if (!langRaw || !id || !audio) {
    return NextResponse.json({ error: "Data rekaman belum lengkap" }, { status: 400 });
  }

  let lang: Lang;
  try {
    lang = validateLang(langRaw);
    validateId(id);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }

  const bytes = await audio.arrayBuffer();
  const dest = wavPath(lang, id);
  await fs.mkdir(wavDir(lang), { recursive: true });
  await fs.writeFile(dest, Buffer.from(bytes));

  await withLock(lang, () => rebuildMetadata(lang));

  return NextResponse.json({ ok: true });
}
