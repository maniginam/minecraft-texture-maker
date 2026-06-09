// Minecraft-inspired color palette for kids
export const PALETTE_COLORS = [
  // Row 1: Basics
  '#000000', '#ffffff', '#808080', '#c0c0c0', '#404040', '#663300',
  // Row 2: Earth tones (dirt, sand, wood)
  '#8B6914', '#C4A44A', '#DEB887', '#6B4423', '#8B7355', '#A0522D',
  // Row 3: Greens (grass, leaves, creeper)
  '#4CAF50', '#2E7D32', '#81C784', '#33691E', '#689F38', '#1B5E20',
  // Row 4: Blues (water, sky, ice)
  '#2196F3', '#1565C0', '#64B5F6', '#0D47A1', '#4FC3F7', '#B3E5FC',
  // Row 5: Reds & Oranges (lava, nether, TNT)
  '#F44336', '#B71C1C', '#FF5722', '#FF9800', '#FFB74D', '#E65100',
  // Row 6: Purples & Special (ender, obsidian, diamond)
  '#9C27B0', '#4A148C', '#CE93D8', '#00BCD4', '#26C6DA', '#FFEB3B',
  // Row 7: Metals & Gold
  '#FFD700', '#DAA520', '#B8860B', '#C0C0C0', '#A8A8A8', '#8B8B8B',
];

export function createPalette(container, onColorSelect) {
  container.innerHTML = '';
  PALETTE_COLORS.forEach(color => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = color;
    swatch.dataset.color = color;
    swatch.addEventListener('click', () => {
      container.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      onColorSelect(color);
    });
    container.appendChild(swatch);
  });
}

export function rgbaToHex(r, g, b, a) {
  if (a === 0) return null;
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

export function hexToRgba(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b, a: 255 };
}

export function colorsMatch(r1, g1, b1, a1, r2, g2, b2, a2) {
  return r1 === r2 && g1 === g2 && b1 === b2 && a1 === a2;
}
