// Capture orchestration: turn a preset, an uploaded file, or a mic recording
// into { label, oggBlob, previewUrl }. Web Audio + encoder access go through an
// injectable dependency seam so the logic is unit-testable.

import { encodeToOgg } from './ogg-encoder.js';
import { PRESETS, renderPreset } from './presets-audio.js';

const PRESET_RATE = 44100;

// Decode an audio File into { channels: Float32Array[], sampleRate } via Web Audio.
async function defaultDecode(file) {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  const ctx = new Ctx();
  try {
    const buf = await file.arrayBuffer();
    const audio = await ctx.decodeAudioData(buf);
    const channels = [];
    for (let c = 0; c < audio.numberOfChannels; c++) channels.push(audio.getChannelData(c));
    return { channels, sampleRate: audio.sampleRate };
  } finally {
    if (ctx.close) ctx.close();
  }
}

function baseName(filename) {
  return String(filename || 'sound').replace(/\.[^.]+$/, '');
}

export function createSoundMaker(deps = {}) {
  const encode = deps.encode || encodeToOgg;
  const decodeAudio = deps.decodeAudio || defaultDecode;
  const makeUrl = deps.makeUrl || ((blob) => URL.createObjectURL(blob));

  async function finalize(label, channels, sampleRate) {
    const oggBlob = await encode(channels, sampleRate);
    return { label, oggBlob, previewUrl: makeUrl(oggBlob) };
  }

  async function fromPreset(presetId) {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) throw new Error(`Unknown preset: ${presetId}`);
    const pcm = renderPreset(preset, PRESET_RATE);
    return finalize(preset.label, [pcm], PRESET_RATE);
  }

  async function fromFile(file) {
    let decoded;
    try {
      decoded = await decodeAudio(file);
    } catch (e) {
      throw new Error('Could not read that sound file. Try a .wav, .mp3, or .ogg.');
    }
    return finalize(baseName(file.name), decoded.channels, decoded.sampleRate);
  }

  // Mic recording is stateful: start it, then call stop() to get the result.
  async function startMic() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone is not available in this browser.');
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    recorder.start();
    return {
      async stop() {
        const done = new Promise((resolve) => { recorder.onstop = resolve; });
        recorder.stop();
        await done;
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        const decoded = await decodeAudio(blob);
        return finalize('My Recording', decoded.channels, decoded.sampleRate);
      },
    };
  }

  return { fromPreset, fromFile, startMic };
}
