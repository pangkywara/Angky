export interface Prompt {
  id: string;
  indonesian: string;
  source: string;
}

export function parseCSV(text: string): Prompt[] {
  // Strip UTF-8 BOM
  const clean = text.startsWith("\uFEFF") ? text.slice(1) : text;

  const lines = clean
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const width = String(lines.length).length;

  return lines.map((line, i) => {
    const sep = line.indexOf(";");
    if (sep === -1) throw new Error(`Baris ${i + 1} tidak memiliki pemisah titik koma`);
    return {
      id: String(i + 1).padStart(width, "0"),
      indonesian: line.slice(0, sep).trim(),
      source: line.slice(sep + 1).trim(),
    };
  });
}

export function shufflePrompts(prompts: Prompt[]): Prompt[] {
  const shuffled = [...prompts];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function findDuplicatePromptIds(prompts: Prompt[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const prompt of prompts) {
    if (seen.has(prompt.id)) duplicates.add(prompt.id);
    seen.add(prompt.id);
  }
  return [...duplicates];
}

export function orderPromptsForRecording(prompts: Prompt[]): Prompt[] {
  if (prompts.length < 2 || !hasSequentialOrder(prompts)) return prompts;

  return prompts
    .map((prompt, index) => ({
      prompt,
      index,
      weight: stablePromptWeight(prompt),
    }))
    .sort((a, b) => a.weight - b.weight || a.index - b.index)
    .map(({ prompt }) => prompt);
}

function hasSequentialOrder(prompts: Prompt[]): boolean {
  const width = String(prompts.length).length;
  return prompts.every((prompt, index) => prompt.id === String(index + 1).padStart(width, "0"));
}

function stablePromptWeight(prompt: Prompt): number {
  let hash = 2166136261;
  const value = `${prompt.id}\u0000${prompt.indonesian}\u0000${prompt.source}`;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function normalizePrompt(value: unknown): Prompt | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<Prompt> & { tiochiu?: unknown };
  if (typeof row.id !== "string" || typeof row.indonesian !== "string") return null;

  const source =
    typeof row.source === "string"
      ? row.source
      : typeof row.tiochiu === "string"
        ? row.tiochiu
        : "";

  return {
    id: row.id,
    indonesian: row.indonesian,
    source,
  };
}

export function normalizePrompts(value: unknown): Prompt[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row) => {
    const prompt = normalizePrompt(row);
    return prompt ? [prompt] : [];
  });
}
