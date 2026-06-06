// Fun sound effects using Web Audio API — no external files needed
let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return null;
    }
  }
  return audioCtx;
}

function createTone(type = 'sine') {
  const ctx = getCtx();
  if (!ctx) return null;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.connect(gain);
  gain.connect(ctx.destination);
  return { osc, gain, ctx, t: ctx.currentTime };
}

export function playPlace() {
  const tone = createTone();
  if (!tone) return;
  const { osc, gain, t } = tone;
  osc.frequency.setValueAtTime(800, t);
  osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  osc.start(t);
  osc.stop(t + 0.08);
}

export function playSuccess() {
  const ctx = getCtx();
  if (!ctx) return;
  [0, 0.1, 0.2].forEach((delay, i) => {
    const tone = createTone();
    if (!tone) return;
    const { osc, gain, t } = tone;
    osc.frequency.setValueAtTime([523, 659, 784][i], t + delay);
    gain.gain.setValueAtTime(0.1, t + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.15);
    osc.start(t + delay);
    osc.stop(t + delay + 0.15);
  });
}

export function playUndo() {
  const tone = createTone();
  if (!tone) return;
  const { osc, gain, t } = tone;
  osc.frequency.setValueAtTime(600, t);
  osc.frequency.exponentialRampToValueAtTime(400, t + 0.1);
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc.start(t);
  osc.stop(t + 0.12);
}

export function playClear() {
  const tone = createTone('sawtooth');
  if (!tone) return;
  const { osc, gain, t } = tone;
  osc.frequency.setValueAtTime(500, t);
  osc.frequency.exponentialRampToValueAtTime(100, t + 0.2);
  gain.gain.setValueAtTime(0.06, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  osc.start(t);
  osc.stop(t + 0.25);
}

export function playClick() {
  const tone = createTone();
  if (!tone) return;
  const { osc, gain, t } = tone;
  osc.frequency.setValueAtTime(1000, t);
  gain.gain.setValueAtTime(0.05, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
  osc.start(t);
  osc.stop(t + 0.03);
}

export function playError() {
  const tone = createTone('square');
  if (!tone) return;
  const { osc, gain, t } = tone;
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.exponentialRampToValueAtTime(150, t + 0.1);
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc.start(t);
  osc.stop(t + 0.2);
}
