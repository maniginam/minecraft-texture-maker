// Thin wrapper over the vendored libvorbis encoder
// (js/vendor/OggVorbisEncoder.min.js, which sets globalThis.OggVorbisEncoder).
// Minecraft only plays OGG Vorbis, and prefers mono for positional audio, so we
// downmix to one channel and hand Float32 PCM straight to the encoder.

const VENDOR_DIR = 'js/vendor/';
const VENDOR_SRC = VENDOR_DIR + 'OggVorbisEncoder.min.js';
let loadPromise = null;

// Average all channels into one Float32Array (or pass a lone channel through).
export function mixToMono(channels) {
  if (channels.length === 1) return channels[0];
  const len = channels[0].length;
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    let sum = 0;
    for (let c = 0; c < channels.length; c++) sum += channels[c][i] || 0;
    out[i] = sum / channels.length;
  }
  return out;
}

// The encoder is an emscripten asm.js module with a separate .mem memory
// initializer loaded asynchronously. It is only safe to use after the runtime
// finishes initializing, so we resolve on `onRuntimeInitialized`, not script
// onload. memoryInitializerPrefixURL tells it where to fetch the .mem from.
function loadEncoder() {
  if (globalThis.OggVorbisEncoder && globalThis.__oggEncoderReady) {
    return Promise.resolve(globalThis.OggVorbisEncoder);
  }
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    globalThis.OggVorbisEncoderConfig = {
      memoryInitializerPrefixURL: VENDOR_DIR,
      onRuntimeInitialized() {
        globalThis.__oggEncoderReady = true;
        if (globalThis.OggVorbisEncoder) resolve(globalThis.OggVorbisEncoder);
        else reject(new Error('OGG encoder failed to initialize'));
      },
    };
    const script = document.createElement('script');
    script.src = VENDOR_SRC;
    script.onerror = () => reject(new Error('Could not load OGG encoder'));
    document.head.appendChild(script);
  });
  return loadPromise;
}

// channels: array of Float32Array. Returns a Promise<Blob> of OGG Vorbis bytes.
export async function encodeToOgg(channels, sampleRate, quality = 0.4) {
  const Encoder = globalThis.OggVorbisEncoder || (await loadEncoder());
  const mono = mixToMono(channels);
  const enc = new Encoder(sampleRate, 1, quality);
  enc.encode([mono]);
  return enc.finish('audio/ogg');
}
