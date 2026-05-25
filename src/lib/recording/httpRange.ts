export type ByteRange =
  | { start: number; end: number }
  | { invalid: true };

const BYTE_RANGE_RE = /^bytes=(\d*)-(\d*)$/;

export function parseByteRange(rangeHeader: string, size: number): ByteRange {
  if (!Number.isSafeInteger(size) || size <= 0) return { invalid: true };
  if (rangeHeader.includes(",")) return { invalid: true };

  const match = BYTE_RANGE_RE.exec(rangeHeader.trim());
  if (!match) return { invalid: true };

  const [, startRaw, endRaw] = match;
  if (!startRaw && !endRaw) return { invalid: true };

  if (!startRaw) {
    const suffixLength = Number(endRaw);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return { invalid: true };

    const start = Math.max(size - suffixLength, 0);
    return { start, end: size - 1 };
  }

  const start = Number(startRaw);
  if (!Number.isSafeInteger(start) || start < 0 || start >= size) return { invalid: true };

  const end = endRaw ? Number(endRaw) : size - 1;
  if (!Number.isSafeInteger(end) || end < start) return { invalid: true };

  return { start, end: Math.min(end, size - 1) };
}
