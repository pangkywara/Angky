"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import QRCodeAccess from "@/components/common/QRCodeAccess";
import Button from "@/components/ui/button/Button";

interface Progress {
  indonesian: { done: number; total: number };
  source: { done: number; total: number };
}

interface DatasetInfo {
  total: number;
  promptsLoaded: number;
  maxRecordings: number | null;
}

function ProgressCard({ label, done, total }: { label: string; done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <ComponentCard title={label} desc={`${done} / ${total} terekam`}>
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
        <div
          className="bg-brand-500 h-3 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{pct}% selesai</p>
    </ComponentCard>
  );
}

export default function HomePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [info, setInfo] = useState<DatasetInfo | null>(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [maxInput, setMaxInput] = useState<string>("");
  const [savingMax, setSavingMax] = useState(false);

  const refresh = useCallback(async () => {
    const [pr, ds] = await Promise.all([
      fetch("/api/recording/progress").then((r) => r.json()),
      fetch("/api/recording/dataset").then((r) => r.json()),
    ]);
    setProgress(pr);
    setInfo({ total: ds.total, promptsLoaded: ds.promptsLoaded, maxRecordings: ds.maxRecordings });
    setMaxInput(ds.maxRecordings != null ? String(ds.maxRecordings) : "");
  }, []);

  useEffect(() => {
    refresh().catch(() => { });
  }, [refresh]);

  const uploadFile = useCallback(async (file: File) => {
    const name = file.name.toLowerCase();
    if (!name.endsWith(".csv") && !name.endsWith(".xlsx") && !name.endsWith(".xls")) {
      setError("File harus berformat .csv, .xlsx, atau .xls");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/recording/prompts/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unggah gagal");
      await refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }, [refresh]);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  async function saveMax() {
    setSavingMax(true);
    setError("");
    try {
      const trimmed = maxInput.trim();
      const value = trimmed === "" ? null : parseInt(trimmed, 10);
      if (value !== null && (!Number.isFinite(value) || value < 1)) {
        throw new Error("Masukkan angka positif, atau kosongkan untuk seluruh dataset");
      }
      const res = await fetch("/api/recording/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxRecordings: value }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Gagal menyimpan");
      }
      await refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingMax(false);
    }
  }

  const hasPrompts = (info?.promptsLoaded ?? 0) > 0;
  const total = info?.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Studio Rekaman Suara</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Buat rekaman berpasangan untuk Bahasa Indonesia dan bahasa sumber - WAV mono 22050 Hz, 16-bit.
        </p>
      </div>

      <QRCodeAccess />

      <ComponentCard
        title="Muat Kalimat"
        desc="Unggah CSV atau Excel — kolom A: Bahasa Indonesia, kolom B: Bahasa Sumber"
      >
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer transition ${dragActive
            ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
            : "border-gray-300 dark:border-gray-700 hover:border-brand-400"
            }`}
        >
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.9A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v6" />
          </svg>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {uploading ? "Mengunggah..." : (
              <>
                <span className="font-medium text-brand-500">Klik untuk unggah</span> atau tarik dan lepas
              </>
            )}
          </p>
          <p className="text-xs text-gray-400">File .csv, .xlsx, atau .xls</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="hidden"
            onChange={onPick}
          />
        </div>
        {hasPrompts && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{info!.promptsLoaded.toLocaleString()}</span> kalimat di CSV
            {info!.maxRecordings != null && (
              <> - dibatasi menjadi <span className="font-medium">{total.toLocaleString()}</span></>
            )}
          </p>
        )}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </ComponentCard>

      <ComponentCard
        title="Output Rekaman"
        desc="Klip tersimpan muncul di sidebar Dataset dan ditulis ke file CSV metadata lokal."
      >
        <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 dark:text-gray-400 sm:grid-cols-2">
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300">Bahasa Indonesia</p>
            <code className="break-all text-xs text-gray-500">output/indonesian/metadata.csv</code>
          </div>
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300">Bahasa Sumber</p>
            <code className="break-all text-xs text-gray-500">output/source/metadata.csv</code>
          </div>
        </div>
      </ComponentCard>

      {hasPrompts && (
        <ComponentCard
          title="Batas Rekaman"
          desc="Batas opsional jumlah kalimat yang direkam. Kosongkan untuk merekam seluruh dataset."
        >
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="number"
              min={1}
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              placeholder={`Semua (${info!.promptsLoaded.toLocaleString()})`}
              className="w-48 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Button size="sm" variant="outline" onClick={saveMax} disabled={savingMax}>
              {savingMax ? "Menyimpan..." : "Simpan Batas"}
            </Button>
          </div>
        </ComponentCard>
      )}

      {progress && hasPrompts && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ProgressCard label="Bahasa Indonesia" done={progress.indonesian.done} total={progress.indonesian.total} />
          <ProgressCard label="Bahasa Sumber" done={progress.source.done} total={progress.source.total} />
        </div>
      )}

      {hasPrompts && total > 0 && (
        <div className="flex justify-end">
          <Button onClick={() => router.push("/session")}>
            {(progress?.indonesian.done ?? 0) > 0 || (progress?.source.done ?? 0) > 0
              ? "Lanjut Rekaman ->"
              : "Mulai Rekaman ->"}
          </Button>
        </div>
      )}
    </div>
  );
}
