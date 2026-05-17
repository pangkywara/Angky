const TARGET_RATE = 22050;

export async function encodeWav(
  samples: Float32Array,
  sourceRate: number
): Promise<Blob> {
  // Resample to TARGET_RATE using OfflineAudioContext
  const duration = samples.length / sourceRate;
  const targetLength = Math.ceil(duration * TARGET_RATE);

  const offline = new OfflineAudioContext(1, targetLength, TARGET_RATE);
  const buffer = offline.createBuffer(1, samples.length, sourceRate);
  buffer.copyToChannel(new Float32Array(samples.buffer.slice(0) as ArrayBuffer), 0);

  const source = offline.createBufferSource();
  source.buffer = buffer;
  source.connect(offline.destination);
  source.start(0);

  const rendered = await offline.startRendering();
  const pcm = rendered.getChannelData(0);

  // Encode as 16-bit PCM WAV
  const dataLen = pcm.length * 2;
  const buf = new ArrayBuffer(44 + dataLen);
  const view = new DataView(buf);

  // RIFF header
  writeStr(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLen, true);
  writeStr(view, 8, "WAVE");
  writeStr(view, 12, "fmt ");
  view.setUint32(16, 16, true);       // chunk size
  view.setUint16(20, 1, true);        // PCM
  view.setUint16(22, 1, true);        // channels
  view.setUint32(24, TARGET_RATE, true);
  view.setUint32(28, TARGET_RATE * 2, true); // byte rate
  view.setUint16(32, 2, true);        // block align
  view.setUint16(34, 16, true);       // bits per sample
  writeStr(view, 36, "data");
  view.setUint32(40, dataLen, true);

  // PCM samples
  let offset = 44;
  for (let i = 0; i < pcm.length; i++) {
    const s = Math.max(-1, Math.min(1, pcm[i]));
    view.setInt16(offset, s < 0 ? s * 32768 : s * 32767, true);
    offset += 2;
  }

  return new Blob([buf], { type: "audio/wav" });
}

function writeStr(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
