// Built-in fun sound presets, synthesized to PCM with no Web Audio dependency
// so they are deterministic and unit-testable. Each preset is one or more
// segments; a segment is a waveform with an exponential pitch sweep and a
// linear amplitude envelope. Segments play in sequence.

function wave(type, phase) {
  switch (type) {
    case 'square':
      return Math.sin(phase) >= 0 ? 1 : -1;
    case 'saw':
      return 2 * ((phase / (2 * Math.PI)) % 1) - 1;
    case 'triangle':
      return 2 * Math.abs(2 * ((phase / (2 * Math.PI)) % 1) - 1) - 1;
    case 'noise':
      // Deterministic pseudo-noise from the phase so renders are repeatable.
      return Math.sin(phase * 12.9898) * 43758.5453 % 1 * 2 - 1;
    default:
      return Math.sin(phase);
  }
}

// Linear amplitude envelope: ramp up over `attack`, hold, ramp down to 0.
function envelope(t, dur, gain) {
  const attack = Math.min(0.01, dur * 0.2);
  const release = Math.min(0.06, dur * 0.5);
  let amp = gain;
  if (t < attack) amp *= t / attack;
  else if (t > dur - release) amp *= Math.max(0, (dur - t) / release);
  return amp;
}

function renderSegment(seg, rate, out, offset) {
  const n = Math.floor(seg.dur * rate);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    const frac = i / n;
    // Exponential pitch sweep from f0 to f1.
    const f = seg.f0 * Math.pow((seg.f1 || seg.f0) / seg.f0, frac);
    phase += (2 * Math.PI * f) / rate;
    out[offset + i] = wave(seg.type, phase) * envelope(t, seg.dur, seg.gain);
  }
  return n;
}

export const PRESETS = [
  { id: 'zap', label: 'Zap', segments: [{ type: 'square', f0: 1200, f1: 200, dur: 0.18, gain: 0.7 }] },
  { id: 'boing', label: 'Boing', segments: [{ type: 'sine', f0: 200, f1: 900, dur: 0.22, gain: 0.7 }] },
  { id: 'laser', label: 'Laser', segments: [{ type: 'saw', f0: 1600, f1: 300, dur: 0.25, gain: 0.6 }] },
  { id: 'explosion', label: 'Explosion', segments: [{ type: 'noise', f0: 120, f1: 40, dur: 0.4, gain: 0.8 }] },
  { id: 'coin', label: 'Coin', segments: [
    { type: 'square', f0: 988, f1: 988, dur: 0.07, gain: 0.5 },
    { type: 'square', f0: 1319, f1: 1319, dur: 0.18, gain: 0.5 },
  ] },
  { id: 'powerup', label: 'Power Up', segments: [
    { type: 'square', f0: 392, f1: 392, dur: 0.08, gain: 0.5 },
    { type: 'square', f0: 523, f1: 523, dur: 0.08, gain: 0.5 },
    { type: 'square', f0: 784, f1: 784, dur: 0.16, gain: 0.5 },
  ] },
  { id: 'swoosh', label: 'Swoosh', segments: [{ type: 'noise', f0: 800, f1: 200, dur: 0.2, gain: 0.5 }] },
  { id: 'bonk', label: 'Bonk', segments: [{ type: 'triangle', f0: 300, f1: 80, dur: 0.16, gain: 0.8 }] },
];

export function renderPreset(preset, rate) {
  const total = preset.segments.reduce((n, s) => n + Math.floor(s.dur * rate), 0);
  const out = new Float32Array(total);
  let offset = 0;
  for (const seg of preset.segments) {
    offset += renderSegment(seg, rate, out, offset);
  }
  // Clamp defensively so noise never exceeds [-1, 1].
  for (let i = 0; i < out.length; i++) {
    if (out[i] > 1) out[i] = 1;
    else if (out[i] < -1) out[i] = -1;
  }
  return out;
}
