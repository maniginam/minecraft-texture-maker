import { describe, it, expect, vi } from 'vitest';
import { createSoundMaker } from '../js/sound-maker.js';
import { PRESETS } from '../js/presets-audio.js';

function deps(overrides = {}) {
  return {
    encode: vi.fn(async () => ({ blob: 'OGG' })),
    decodeAudio: vi.fn(async () => ({ channels: [new Float32Array([0.1, 0.2])], sampleRate: 48000 })),
    makeUrl: vi.fn(() => 'blob:preview'),
    ...overrides,
  };
}

describe('createSoundMaker.fromPreset', () => {
  it('renders the preset to PCM and encodes it to OGG', async () => {
    const d = deps();
    const sm = createSoundMaker(d);
    const result = await sm.fromPreset(PRESETS[0].id);
    expect(d.encode).toHaveBeenCalledTimes(1);
    const [channels, rate] = d.encode.mock.calls[0];
    expect(channels[0]).toBeInstanceOf(Float32Array);
    expect(channels[0].length).toBeGreaterThan(100);
    expect(rate).toBeGreaterThan(0);
    expect(result.oggBlob).toEqual({ blob: 'OGG' });
    expect(result.previewUrl).toBe('blob:preview');
    expect(result.label).toBe(PRESETS[0].label);
  });

  it('rejects an unknown preset id', async () => {
    const sm = createSoundMaker(deps());
    await expect(sm.fromPreset('nope')).rejects.toThrow();
  });
});

describe('createSoundMaker.fromFile', () => {
  it('decodes the audio file then encodes the channels to OGG', async () => {
    const d = deps();
    const sm = createSoundMaker(d);
    const file = { name: 'roar.wav' };
    const result = await sm.fromFile(file);
    expect(d.decodeAudio).toHaveBeenCalledWith(file);
    const [channels, rate] = d.encode.mock.calls[0];
    expect(rate).toBe(48000);
    expect(channels[0]).toBeInstanceOf(Float32Array);
    expect(result.oggBlob).toEqual({ blob: 'OGG' });
    expect(result.label).toBe('roar');
  });

  it('surfaces a friendly error when decoding fails', async () => {
    const d = deps({ decodeAudio: vi.fn(async () => { throw new Error('bad'); }) });
    const sm = createSoundMaker(d);
    await expect(sm.fromFile({ name: 'x.txt' })).rejects.toThrow(/could not read/i);
  });
});
