import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { outputRoot } from "@/lib/recording/paths";

const CFG = () => path.join(outputRoot(), "config.json");

export async function GET() {
  try {
    const raw = await fs.readFile(CFG(), "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ maxRecordings: null });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const max = body.maxRecordings;
  if (max !== null && max !== undefined && (typeof max !== "number" || max < 1 || !Number.isFinite(max))) {
    return NextResponse.json({ error: "Batas rekaman harus berupa angka positif atau kosong" }, { status: 400 });
  }
  await fs.mkdir(outputRoot(), { recursive: true });
  const next = { maxRecordings: max ?? null };
  const tmp = CFG() + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(next), "utf-8");
  await fs.rename(tmp, CFG());
  return NextResponse.json(next);
}
