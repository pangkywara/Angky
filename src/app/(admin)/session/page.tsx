"use client";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useRecorder } from "@/hooks/useRecorder";
import { IconChevronRight } from "@/components/icons";

interface Prompt {
  id: string;
  indonesian: string;
  source: string;
  indonesianDone: boolean;
  sourceDone: boolean;
}

type Lang = "indonesian" | "source";

function RecorderPanel({
  lang,
  label,
  promptId,
  text,
  alreadySaved,
  onSaved,
}: {
  lang: Lang;
  label: string;
  promptId: string;
  text: string;
  alreadySaved: boolean;
  onSaved: () => void;
}) {
  const { state, blob, durationSec, start, stop, error } = useRecorder();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Auto-save when blob ready
  const onSavedRef = useRef(onSaved);
  useEffect(() => {
    onSavedRef.current = onSaved;
  }, [onSaved]);

  useEffect(() => {
    if (state !== "ready" || !blob) return;
    let cancelled = false;
    const form = new FormData();
    form.append("lang", lang);
    form.append("id", promptId);
    form.append("text", text);
    form.append("audio", blob, `${promptId}.wav`);
    fetch("/api/recording/clips", { method: "POST", body: form })
      .then((r) => {
        if (!r.ok) throw new Error("Gagal menyimpan");
        if (!cancelled) {
          setSavedAt(Date.now());
          onSavedRef.current();
        }
      })
      .catch(() => { });
    return () => { cancelled = true; };
  }, [state, blob, lang, promptId, text]);

  const showSavedBadge = (alreadySaved && state === "idle") || savedAt !== null;
  const saving = state === "ready" && savedAt === null;
  const savedUrl = `/api/recording/clips/${lang}/${promptId}`;
  const handleStart = () => {
    setSavedAt(null);
    void start();
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-700 dark:text-gray-300">{label}</h4>
        {showSavedBadge && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            ✓ Tersimpan
          </span>
        )}
        {state === "recording" && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {durationSec.toFixed(1)}s
          </span>
        )}
        {(state === "encoding" || saving) && (
          <span className="text-xs text-gray-500">{state === "encoding" ? "Memproses..." : "Menyimpan..."}</span>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 min-h-[2rem]">{text}</p>

      {/* Playback: previously saved (when idle) */}
      {showSavedBadge && (
        <audio src={savedUrl} controls className="w-full h-8" />
      )}

      <div className="flex flex-wrap gap-2">
        {(state === "idle" || state === "ready") && (
          <Button
            size="sm"
            onClick={handleStart}
            className="bg-red-500 hover:bg-red-600 text-white w-full mt-6"
          >
            ● {showSavedBadge || state === "ready" ? "Rekam Ulang" : "Rekam"}
          </Button>
        )}
        {state === "recording" && (
          <Button size="sm" onClick={stop} variant="outline" className="w-full">
            ■ Berhenti
          </Button>
        )}
        {state === "encoding" && (
          <Button size="sm" variant="outline" disabled className="w-full">
            Memproses...
          </Button>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SessionInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeId = searchParams.get("id");

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [index, setIndex] = useState(0);
  const [jumpVal, setJumpVal] = useState("");
  const [loading, setLoading] = useState(true);
  const firstLoadApplied = useRef(false);

  const loadPrompts = useCallback(async () => {
    const data: Prompt[] = await fetch("/api/recording/prompts").then((r) => r.json());
    setPrompts(data);
    return data;
  }, []);

  // Keep same mounted page in sync when /session?id=... changes from sidebar links.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/recording/prompts")
      .then((r) => r.json())
      .then((data: Prompt[]) => {
        if (cancelled) return;
        setPrompts(data);
        setLoading(false);
        if (data.length === 0) {
          setIndex(0);
          return;
        }
        if (routeId) {
          const idx = data.findIndex((p) => p.id === routeId);
          if (idx >= 0) {
            firstLoadApplied.current = true;
            setIndex(idx);
            return;
          }
        }
        if (!firstLoadApplied.current) {
          firstLoadApplied.current = true;
          const first = data.findIndex((p) => !p.indonesianDone || !p.sourceDone);
          setIndex(first >= 0 ? first : 0);
          return;
        }
        setIndex((current) => Math.min(current, data.length - 1));
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [routeId]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, prompts.length - 1));
      else if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
      else if (e.key === "s" || e.key === "S") setIndex((i) => Math.min(i + 1, prompts.length - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prompts.length]);

  function handleJump(e: React.KeyboardEvent) {
    if (e.key !== "Enter") return;
    const id = jumpVal.trim();
    const idx = prompts.findIndex((p) => p.id === id);
    if (idx >= 0) setIndex(idx);
    setJumpVal("");
  }

  const handleSaved = useCallback(async () => {
    await loadPrompts();
  }, [loadPrompts]);

  const prompt = prompts[index];
  const total = prompts.length;

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500 dark:text-gray-400">
        Memuat kalimat...
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-gray-500 dark:text-gray-400">
          Belum ada kalimat. Unggah CSV terlebih dahulu.
        </p>
        <Button onClick={() => router.push("/")} variant="outline">
          Kembali ke Beranda
        </Button>
      </div>
    );
  }

  if (!prompt) return null;

  const promptComplete = prompt.indonesianDone && prompt.sourceDone;
  const isLastPrompt = index === total - 1;

  function finishCurrentPrompt() {
    if (!promptComplete) return;
    if (isLastPrompt) {
      router.push("/");
      return;
    }
    setIndex((i) => Math.min(i + 1, total - 1));
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        <Link
          href="/"
          className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          Beranda
        </Link>
        <IconChevronRight className="size-4 text-gray-400 dark:text-gray-600" stroke={2} />
        <span className="font-medium text-gray-900 dark:text-white">
          Sesi Rekaman
        </span>
      </nav>

      {/* Progress row */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 shrink-0">
          {index + 1} / {total}
        </span>
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2 min-w-[80px]">
          <div
            className="bg-brand-500 h-2 rounded-full transition-all"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Search Input */}
      <div className="w-full">
        <input
          type="text"
          value={jumpVal}
          onChange={(e) => setJumpVal(e.target.value)}
          onKeyDown={handleJump}
          placeholder="Lompat ke ID..."
          className="w-full sm:w-48 h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Prompt card */}
      <ComponentCard
        title={`Kalimat #${prompt.id}`}
        desc="Bacakan kalimat untuk kedua slot rekaman"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase text-gray-400 mb-1">Bahasa Indonesia</p>
            <p className="text-base text-gray-800 dark:text-white/90">{prompt.indonesian}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-400 mb-1">Bahasa Sumber</p>
            <p className="text-base text-gray-800 dark:text-white/90">{prompt.source}</p>
          </div>
        </div>
      </ComponentCard>

      {/* Recorder panels */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <RecorderPanel
          key={`id-${prompt.id}`}
          lang="indonesian"
          label="Bahasa Indonesia"
          promptId={prompt.id}
          text={prompt.indonesian}
          alreadySaved={prompt.indonesianDone}
          onSaved={handleSaved}
        />
        <RecorderPanel
          key={`source-${prompt.id}`}
          lang="source"
          label="Bahasa Sumber"
          promptId={prompt.id}
          text={prompt.source}
          alreadySaved={prompt.sourceDone}
          onSaved={handleSaved}
        />
      </div>

      {/* Navigation controls */}
      <div className="flex gap-2 w-full">
        <Button size="sm" variant="outline" onClick={() => setIndex((i) => Math.max(i - 1, 0))} disabled={index === 0} className="flex-1 sm:flex-initial">
          ‹ Sebelumnya
        </Button>
        <Button size="sm" variant="outline" onClick={() => setIndex((i) => Math.min(i + 1, total - 1))} disabled={index === total - 1} className="flex-1 sm:flex-initial">
          Berikutnya ›
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {promptComplete ? "Kedua rekaman untuk kalimat ini sudah tersimpan." : "Rekam kedua slot sebelum menyelesaikan kalimat ini."}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Putar ulang rekaman di sini. File CSV metadata diperbarui di <code>output/indonesian/metadata.csv</code> dan <code>output/source/metadata.csv</code>.
          </p>
        </div>
        <Button
          size="sm"
          onClick={finishCurrentPrompt}
          disabled={!promptComplete}
          className="sm:shrink-0"
        >
          {isLastPrompt ? "Selesai Sesi" : "Selesai & Lanjut"}
        </Button>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-600">
        Pintasan: ← → navigasi · S lewati · klip tersimpan otomatis setelah rekaman dihentikan · tombol selesai mengatur langkah berikutnya
      </p>
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-500">Memuat...</div>}>
      <SessionInner />
    </Suspense>
  );
}
