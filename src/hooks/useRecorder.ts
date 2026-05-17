"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { encodeWav } from "@/lib/recording/wav";

export type RecorderState = "idle" | "recording" | "encoding" | "ready";

export interface UseRecorderReturn {
  state: RecorderState;
  blob: Blob | null;
  durationSec: number;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
  error: string | null;
}

export function useRecorder(): UseRecorderReturn {
  const [state, setState] = useState<RecorderState>("idle");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [durationSec, setDurationSec] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const startTimeRef = useRef<number>(0);
  const tickRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    try { processorRef.current?.disconnect(); } catch {}
    try { sourceNodeRef.current?.disconnect(); } catch {}
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (ctxRef.current && ctxRef.current.state !== "closed") {
      ctxRef.current.close().catch(() => {});
    }
    processorRef.current = null;
    sourceNodeRef.current = null;
    streamRef.current = null;
    ctxRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setBlob(null);
    setDurationSec(0);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false },
      });
      streamRef.current = stream;

      const ctx = new AudioContext();
      ctxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const data = e.inputBuffer.getChannelData(0);
        chunksRef.current.push(new Float32Array(data));
      };

      source.connect(processor);
      processor.connect(ctx.destination);

      startTimeRef.current = Date.now();
      setState("recording");

      // Live ticking timer
      tickRef.current = window.setInterval(() => {
        setDurationSec((Date.now() - startTimeRef.current) / 1000);
      }, 100);
    } catch {
      cleanup();
      setError("Akses mikrofon ditolak");
      setState("idle");
    }
  }, [cleanup]);

  const stop = useCallback(() => {
    if (!ctxRef.current) return;

    const finalDuration = (Date.now() - startTimeRef.current) / 1000;
    setDurationSec(finalDuration);
    setState("encoding");

    const sourceRate = ctxRef.current.sampleRate;
    cleanup();

    const totalLen = chunksRef.current.reduce((s, c) => s + c.length, 0);
    if (totalLen === 0) {
      setError("Tidak ada audio yang terekam");
      setState("idle");
      return;
    }

    const merged = new Float32Array(totalLen);
    let offset = 0;
    for (const chunk of chunksRef.current) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    encodeWav(merged, sourceRate)
      .then((b) => {
        setBlob(b);
        setState("ready");
      })
      .catch(() => {
        setError("Pemrosesan audio gagal");
        setState("idle");
      });
  }, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    setBlob(null);
    setDurationSec(0);
    setError(null);
    setState("idle");
    chunksRef.current = [];
  }, [cleanup]);

  useEffect(() => () => cleanup(), [cleanup]);

  return { state, blob, durationSec, start, stop, reset, error };
}
