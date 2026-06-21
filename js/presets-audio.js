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
  { id: 'sparkle', label: 'Sparkle', segments: [
    { type: 'sine', f0: 1568, f1: 1568, dur: 0.05, gain: 0.45 },
    { type: 'sine', f0: 2093, f1: 2093, dur: 0.05, gain: 0.45 },
    { type: 'sine', f0: 2637, f1: 2637, dur: 0.12, gain: 0.45 },
  ] },
  { id: 'magic', label: 'Magic', segments: [{ type: 'sine', f0: 400, f1: 1800, dur: 0.35, gain: 0.55 }] },
  { id: 'jump', label: 'Jump', segments: [{ type: 'square', f0: 300, f1: 800, dur: 0.12, gain: 0.55 }] },
  { id: 'hurt', label: 'Ouch', segments: [{ type: 'square', f0: 400, f1: 150, dur: 0.2, gain: 0.6 }] },
  { id: 'teleport', label: 'Teleport', segments: [{ type: 'saw', f0: 200, f1: 2000, dur: 0.25, gain: 0.5 }] },
  { id: 'siren', label: 'Siren', segments: [
    { type: 'sine', f0: 700, f1: 500, dur: 0.2, gain: 0.5 },
    { type: 'sine', f0: 500, f1: 700, dur: 0.2, gain: 0.5 },
  ] },
  { id: 'pop', label: 'Pop', segments: [{ type: 'sine', f0: 500, f1: 900, dur: 0.06, gain: 0.7 }] },
  { id: 'bubble', label: 'Bubble', segments: [{ type: 'sine', f0: 300, f1: 750, dur: 0.1, gain: 0.6 }] },
  { id: 'robot', label: 'Robot', segments: [
    { type: 'square', f0: 200, f1: 200, dur: 0.07, gain: 0.5 },
    { type: 'square', f0: 320, f1: 320, dur: 0.07, gain: 0.5 },
    { type: 'square', f0: 240, f1: 240, dur: 0.07, gain: 0.5 },
    { type: 'square', f0: 360, f1: 360, dur: 0.09, gain: 0.5 },
  ] },
  { id: 'thunder', label: 'Thunder', segments: [{ type: 'noise', f0: 90, f1: 30, dur: 0.6, gain: 0.85 }] },
  { id: 'victory', label: 'Victory', segments: [
    { type: 'square', f0: 523, f1: 523, dur: 0.1, gain: 0.5 },
    { type: 'square', f0: 659, f1: 659, dur: 0.1, gain: 0.5 },
    { type: 'square', f0: 784, f1: 784, dur: 0.1, gain: 0.5 },
    { type: 'square', f0: 1047, f1: 1047, dur: 0.2, gain: 0.5 },
  ] },
  { id: 'gameover', label: 'Game Over', segments: [
    { type: 'square', f0: 440, f1: 440, dur: 0.12, gain: 0.5 },
    { type: 'square', f0: 330, f1: 330, dur: 0.12, gain: 0.5 },
    { type: 'square', f0: 220, f1: 220, dur: 0.12, gain: 0.5 },
    { type: 'square', f0: 110, f1: 110, dur: 0.25, gain: 0.5 },
  ] },
  { id: 'raygun', label: 'Ray Gun', segments: [{ type: 'saw', f0: 2000, f1: 200, dur: 0.3, gain: 0.5 }] },
  { id: 'chirp', label: 'Chirp', segments: [{ type: 'sine', f0: 1500, f1: 2600, dur: 0.08, gain: 0.55 }] },
  { id: 'thump', label: 'Thump', segments: [{ type: 'triangle', f0: 120, f1: 55, dur: 0.18, gain: 0.85 }] },
  { id: 'buzz', label: 'Buzz', segments: [{ type: 'square', f0: 150, f1: 140, dur: 0.3, gain: 0.45 }] },
  { id: 'ding', label: 'Ding', segments: [{ type: 'sine', f0: 1318, f1: 1318, dur: 0.3, gain: 0.55 }] },
  { id: 'warp', label: 'Warp', segments: [{ type: 'saw', f0: 1500, f1: 100, dur: 0.4, gain: 0.5 }] },
  { id: 'squeak', label: 'Squeak', segments: [{ type: 'sine', f0: 1800, f1: 2700, dur: 0.1, gain: 0.5 }] },
  { id: 'heartbeat', label: 'Heartbeat', segments: [
    { type: 'sine', f0: 65, f1: 45, dur: 0.12, gain: 0.85 },
    { type: 'sine', f0: 1, f1: 1, dur: 0.08, gain: 0.0 },
    { type: 'sine', f0: 60, f1: 40, dur: 0.14, gain: 0.85 },
  ] },
  { id: 'charge', label: 'Charge Up', segments: [{ type: 'saw', f0: 100, f1: 1200, dur: 0.4, gain: 0.5 }] },
  { id: 'splash', label: 'Splash', segments: [{ type: 'noise', f0: 600, f1: 150, dur: 0.25, gain: 0.6 }] },
  { id: 'alarm', label: 'Alarm', segments: [
    { type: 'square', f0: 880, f1: 880, dur: 0.12, gain: 0.45 },
    { type: 'square', f0: 660, f1: 660, dur: 0.12, gain: 0.45 },
    { type: 'square', f0: 880, f1: 880, dur: 0.12, gain: 0.45 },
  ] },
  { id: 'slurp', label: 'Slurp', segments: [{ type: 'saw', f0: 500, f1: 90, dur: 0.3, gain: 0.5 }] },
  { id: 'wronk', label: 'Wrong', segments: [{ type: 'square', f0: 200, f1: 160, dur: 0.28, gain: 0.55 }] },
  { id: 'powerdown', label: 'Power Down', segments: [{ type: 'square', f0: 800, f1: 100, dur: 0.4, gain: 0.5 }] },
  { id: 'blip', label: 'Blip', segments: [{ type: 'sine', f0: 1000, f1: 1000, dur: 0.05, gain: 0.6 }] },
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
