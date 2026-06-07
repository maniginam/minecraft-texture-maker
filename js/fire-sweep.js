// Generate fire-colored sweep attack particle textures (sweep_0 through sweep_7)
// Replaces the default white sweep arc with orange/red/yellow fire colors

const SIZE = 32;

function generateFireSweepFrame(frameIndex) {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  // Frame 0-7: arc grows from small to full sweep, then fades
  // Frame 0: tiny spark, Frame 3-4: full arc, Frame 7: fading embers
  const progress = frameIndex / 7; // 0 to 1
  const cx = SIZE / 2;
  const cy = SIZE / 2;

  // Arc parameters
  const radius = SIZE * 0.38;
  const arcWidth = 3 + frameIndex * 0.5;
  const startAngle = -Math.PI * 0.8;
  const sweepAmount = Math.min(1, (frameIndex + 1) / 4); // grows to full by frame 3
  const endAngle = startAngle + Math.PI * 1.6 * sweepAmount;
  const alpha = frameIndex <= 4 ? 1.0 : 1.0 - (frameIndex - 4) / 3; // fade out frames 5-7

  // Fire gradient colors
  const fireColors = [
    { r: 255, g: 255, b: 100 }, // bright yellow core
    { r: 255, g: 180, b: 0 },   // orange
    { r: 255, g: 100, b: 0 },   // deep orange
    { r: 220, g: 50, b: 0 },    // red
    { r: 150, g: 20, b: 0 },    // dark red edge
  ];

  // Draw arc with fire colors — multiple passes for glow
  // Outer glow (dark red)
  ctx.globalAlpha = alpha * 0.3;
  ctx.strokeStyle = `rgb(${fireColors[4].r}, ${fireColors[4].g}, ${fireColors[4].b})`;
  ctx.lineWidth = arcWidth + 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.stroke();

  // Mid glow (red-orange)
  ctx.globalAlpha = alpha * 0.5;
  ctx.strokeStyle = `rgb(${fireColors[3].r}, ${fireColors[3].g}, ${fireColors[3].b})`;
  ctx.lineWidth = arcWidth + 4;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.stroke();

  // Orange layer
  ctx.globalAlpha = alpha * 0.7;
  ctx.strokeStyle = `rgb(${fireColors[2].r}, ${fireColors[2].g}, ${fireColors[2].b})`;
  ctx.lineWidth = arcWidth + 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.stroke();

  // Bright orange core
  ctx.globalAlpha = alpha * 0.9;
  ctx.strokeStyle = `rgb(${fireColors[1].r}, ${fireColors[1].g}, ${fireColors[1].b})`;
  ctx.lineWidth = arcWidth;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.stroke();

  // Yellow-white hot center
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = `rgb(${fireColors[0].r}, ${fireColors[0].g}, ${fireColors[0].b})`;
  ctx.lineWidth = Math.max(1, arcWidth - 2);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.stroke();

  // Add spark particles along the arc for fire feel
  ctx.globalAlpha = alpha;
  const sparkCount = 3 + frameIndex * 2;
  for (let i = 0; i < sparkCount; i++) {
    const angle = startAngle + (endAngle - startAngle) * Math.random();
    const sparkR = radius + (Math.random() - 0.5) * 8;
    const sx = cx + Math.cos(angle) * sparkR;
    const sy = cy + Math.sin(angle) * sparkR;
    const sparkSize = 1 + Math.random() * 2;
    const colorIdx = Math.floor(Math.random() * 3);
    const c = fireColors[colorIdx];
    ctx.fillStyle = `rgb(${c.r}, ${c.g}, ${c.b})`;
    ctx.fillRect(Math.floor(sx), Math.floor(sy), sparkSize, sparkSize);
  }

  // Add embers floating up on later frames
  if (frameIndex >= 3) {
    const emberCount = (frameIndex - 2) * 3;
    for (let i = 0; i < emberCount; i++) {
      const angle = startAngle + (endAngle - startAngle) * (i / emberCount);
      const drift = (frameIndex - 2) * 2 * Math.random();
      const ex = cx + Math.cos(angle) * radius + (Math.random() - 0.5) * 4;
      const ey = cy + Math.sin(angle) * radius - drift;
      const c = fireColors[Math.floor(Math.random() * 2)];
      ctx.globalAlpha = alpha * (0.3 + Math.random() * 0.5);
      ctx.fillStyle = `rgb(${c.r}, ${c.g}, ${c.b})`;
      ctx.fillRect(Math.floor(ex), Math.floor(ey), 1, 1);
    }
  }

  ctx.globalAlpha = 1;
  return canvas;
}

// Use seeded randomness so frames are consistent across exports
// We generate once and cache
let cachedFrames = null;

export function getFireSweepFrames() {
  if (!cachedFrames) {
    cachedFrames = [];
    for (let i = 0; i < 8; i++) {
      cachedFrames.push({
        canvas: generateFireSweepFrame(i),
        path: `particle/sweep_${i}`,
      });
    }
  }
  return cachedFrames;
}
