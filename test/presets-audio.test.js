import { describe, it, expect } from 'vitest';
import { PRESETS, renderPreset } from '../js/presets-audio.js';

describe('PRESETS', () => {
  it('exposes a non-empty library with id + label', () => {
    expect(PRESETS.length).toBeGreaterThan(3);
    for (const p of PRESETS) {
      expect(typeof p.id).toBe('string');
      expect(typeof p.label).toBe('string');
    }
  });
  it('has unique ids', () => {
    const ids = PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('renderPreset', () => {
  const rate = 44100;
  it('returns a Float32Array of the preset duration', () => {
    const p = PRESETS[0];
    const pcm = renderPreset(p, rate);
    expect(pcm).toBeInstanceOf(Float32Array);
    expect(pcm.length).toBeGreaterThan(rate * 0.02); // at least 20ms
  });
  it('produces audible, in-range samples for every preset', () => {
    for (const p of PRESETS) {
      const pcm = renderPreset(p, rate);
      let peak = 0;
      for (let i = 0; i < pcm.length; i++) {
        const v = pcm[i];
        expect(v).toBeGreaterThanOrEqual(-1);
        expect(v).toBeLessThanOrEqual(1);
        if (Math.abs(v) > peak) peak = Math.abs(v);
      }
      expect(peak, `preset ${p.id} should not be silent`).toBeGreaterThan(0.05);
    }
  });
  it('starts and ends near zero to avoid clicks', () => {
    const pcm = renderPreset(PRESETS[0], rate);
    expect(Math.abs(pcm[0])).toBeLessThan(0.05);
    expect(Math.abs(pcm[pcm.length - 1])).toBeLessThan(0.05);
  });
});
