import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { validateLang, validateId, wavDirsForRead, wavPathCandidates, metadataPath, promptsJsonPath } from "@/lib/recording/paths";
import { normalizePrompts } from "@/lib/recording/csv";
import type { Lang } from "@/lib/recording/paths";
import path from "path";

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
  const rows = ids.map((id) => `${id}|${textMap.get(id) ?? ""}`).join("\n");
  const dest = metadataPath(lang);
  const tmp = dest + ".tmp";
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(tmp, rows, "utf-8");
  await fs.rename(tmp, dest);
}

type Params = { params: Promise<{ lang: string; id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { lang: langRaw, id } = await params;
  try {
    const lang = validateLang(langRaw);
    validateId(id);
    let data: Buffer | null = null;
    for (const candidate of wavPathCandidates(lang, id)) {
      data = await fs.readFile(candidate).catch(() => null);
      if (data) break;
    }
    if (!data) throw new Error("Not found");
    return new NextResponse(new Uint8Array(data), {
      headers: { "Content-Type": "audio/wav" },
    });
  } catch {
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { lang: langRaw, id } = await params;
  try {
    const lang = validateLang(langRaw);
    validateId(id);
    await Promise.all(wavPathCandidates(lang, id).map((candidate) => fs.unlink(candidate).catch(() => {})));
    await rebuildMetadata(lang);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
