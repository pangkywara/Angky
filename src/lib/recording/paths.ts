import path from "path";

const VALID_LANGS = ["indonesian", "source"] as const;
export type Lang = (typeof VALID_LANGS)[number];

const LEGACY_LANG_ALIASES: Record<string, Lang> = {
  tiochiu: "source",
};

const OUTPUT_DIRS: Record<Lang, string> = {
  indonesian: "indonesian",
  source: "source",
};

const LEGACY_OUTPUT_DIRS: Record<Lang, string[]> = {
  indonesian: [],
  source: ["tiochiu"],
};

export function outputRoot(): string {
  return path.join(process.cwd(), "output");
}

export function promptsJsonPath(): string {
  return path.join(outputRoot(), "prompts.json");
}

export function wavDir(lang: Lang): string {
  return path.join(outputRoot(), OUTPUT_DIRS[lang], "wav");
}

export function wavDirsForRead(lang: Lang): string[] {
  return [
    wavDir(lang),
    ...LEGACY_OUTPUT_DIRS[lang].map((dir) => path.join(outputRoot(), dir, "wav")),
  ];
}

export function wavPath(lang: Lang, id: string): string {
  validateId(id);
  return path.join(wavDir(lang), `${id}.wav`);
}

export function wavPathCandidates(lang: Lang, id: string): string[] {
  validateId(id);
  return wavDirsForRead(lang).map((dir) => path.join(dir, `${id}.wav`));
}

export function metadataPath(lang: Lang): string {
  return path.join(outputRoot(), OUTPUT_DIRS[lang], "metadata.csv");
}

export function validateLang(lang: string): Lang {
  const normalized = LEGACY_LANG_ALIASES[lang] ?? lang;
  if (!VALID_LANGS.includes(normalized as Lang)) {
    throw new Error(`Bahasa tidak valid: ${lang}`);
  }
  return normalized as Lang;
}

export function validateId(id: string): void {
  if (!/^\d+$/.test(id)) {
    throw new Error(`ID tidak valid: ${id}`);
  }
}
