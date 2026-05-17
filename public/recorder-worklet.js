/**
 * RecorderWorkletProcessor — runs on a dedicated audio thread.
 *
 * Collects mono PCM Float32 samples and posts them to the main thread
 * in batches. This replaces the deprecated ScriptProcessorNode approach
 * and keeps the main/UI thread completely free.
 */
class RecorderWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._stopped = false;
    this.port.onmessage = (e) => {
      if (e.data === "stop") {
        this._stopped = true;
      }
    };
  }

  process(inputs) {
    if (this._stopped) return false; // returning false removes the node

    const input = inputs[0];
    if (input && input.length > 0) {
      const channelData = input[0]; // mono — channel 0
      // Copy the data before posting (the buffer is reused by the engine)
      this.port.postMessage(new Float32Array(channelData));
    }

    return true; // keep processing
  }
}

registerProcessor("recorder-worklet", RecorderWorkletProcessor);
