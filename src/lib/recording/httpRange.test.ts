import assert from "node:assert/strict";
import test from "node:test";
import { parseByteRange } from "./httpRange.ts";

test("parseByteRange returns bounded range for explicit start and end", () => {
  assert.deepEqual(parseByteRange("bytes=0-99", 1_000), { start: 0, end: 99 });
});

test("parseByteRange clamps end to final byte", () => {
  assert.deepEqual(parseByteRange("bytes=900-1200", 1_000), { start: 900, end: 999 });
});

test("parseByteRange supports open-ended start", () => {
  assert.deepEqual(parseByteRange("bytes=900-", 1_000), { start: 900, end: 999 });
});

test("parseByteRange supports suffix range", () => {
  assert.deepEqual(parseByteRange("bytes=-100", 1_000), { start: 900, end: 999 });
});

test("parseByteRange marks malformed or unsatisfiable ranges invalid", () => {
  assert.deepEqual(parseByteRange("items=0-99", 1_000), { invalid: true });
  assert.deepEqual(parseByteRange("bytes=1000-1200", 1_000), { invalid: true });
  assert.deepEqual(parseByteRange("bytes=200-100", 1_000), { invalid: true });
  assert.deepEqual(parseByteRange("bytes=0-1,4-5", 1_000), { invalid: true });
});
