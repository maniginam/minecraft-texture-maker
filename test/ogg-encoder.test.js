import { describe, it, expect, beforeEach, vi } from 'vitest';
import { encodeToOgg, mixToMono } from '../js/ogg-encoder.js';

describe('mixToMono', () => {
  it('returns the single channel unchanged when already mono', () => {
    const mono = new Float32Array([0.1, -0.2, 0.3]);
    expect(mixToMono([mono])).toBe(mono);
  });
  it('averages stereo channels into one', () => {
    const l = new Float32Array([1, 0, -1]);
    const r = new Float32Array([0, 0, 1]);
    const m = mixToMono([l, r]);
    expect(Array.from(m)).toEqual([0.5, 0, 0]);
  });
});

describe('encodeToOgg', () => {
  let calls;
  beforeEach(() => {
    calls = {};
    globalThis.OggVorbisEncoder = class {
      constructor(rate, channels, quality) {
        calls.ctor = [rate, channels, quality];
        calls.encoded = [];
      }
      encode(buffers) {
        calls.encoded.push(buffers);
      }
      finish(mime) {
        calls.mime = mime;
        return { ogg: true, mime };
      }
    };
  });

  it('encodes mono at the given sample rate and returns the finished blob', async () => {
    const pcm = new Float32Array([0, 0.5, -0.5, 0]);
    const blob = await encodeToOgg([pcm], 44100, 0.4);
    expect(calls.ctor).toEqual([44100, 1, 0.4]);
    expect(calls.encoded[0][0]).toBe(pcm);
    expect(calls.mime).toBe('audio/ogg');
    expect(blob).toEqual({ ogg: true, mime: 'audio/ogg' });
  });

  it('downmixes stereo input to a single mono channel for Minecraft', async () => {
    await encodeToOgg([new Float32Array([1, 1]), new Float32Array([0, 0])], 48000);
    expect(calls.ctor[1]).toBe(1); // one channel out
    expect(Array.from(calls.encoded[0][0])).toEqual([0.5, 0.5]);
  });
});
