import { PixelEditor } from './pixel-editor.js';

// Minecraft skin layout (64x64 PNG)
// Body part regions for overlay labels
const SKIN_REGIONS = [
  // Head
  { x: 0, y: 0, w: 32, h: 16, label: 'Head', color: '#ff9800' },
  // Body
  { x: 16, y: 16, w: 24, h: 16, label: 'Body', color: '#4caf50' },
  // Right Arm
  { x: 40, y: 16, w: 16, h: 16, label: 'R.Arm', color: '#2196f3' },
  // Right Leg
  { x: 0, y: 16, w: 16, h: 16, label: 'R.Leg', color: '#9c27b0' },
  // Left Leg (1.8+ format)
  { x: 16, y: 48, w: 16, h: 16, label: 'L.Leg', color: '#e91e63' },
  // Left Arm (1.8+ format)
  { x: 32, y: 48, w: 16, h: 16, label: 'L.Arm', color: '#00bcd4' },
  // Head overlay
  { x: 32, y: 0, w: 32, h: 16, label: 'Head 2nd', color: '#ff980066' },
  // Body overlay
  { x: 16, y: 32, w: 24, h: 16, label: 'Body 2nd', color: '#4caf5066' },
  // Right Arm overlay
  { x: 40, y: 32, w: 16, h: 16, label: 'R.Arm 2nd', color: '#2196f366' },
  // Right Leg overlay
  { x: 0, y: 32, w: 16, h: 16, label: 'R.Leg 2nd', color: '#9c27b066' },
  // Left Leg overlay
  { x: 0, y: 48, w: 16, h: 16, label: 'L.Leg 2nd', color: '#e91e6366' },
  // Left Arm overlay
  { x: 48, y: 48, w: 16, h: 16, label: 'L.Arm 2nd', color: '#00bcd466' },
];

export class SkinEditor {
  constructor(pixelCanvas, gridCanvas, previewCanvas) {
    this.editor = new PixelEditor(pixelCanvas, gridCanvas, {
      displaySize: 512,
      gridSize: 64,
    });
    this.previewCanvas = previewCanvas;
    this.previewCtx = previewCanvas.getContext('2d');
    this.editor.onPreviewUpdate = () => this.updatePreview();
    this.drawRegionOverlay();
  }

  getEditor() {
    return this.editor;
  }

  drawRegionOverlay() {
    const ctx = this.editor.gridCtx;
    const ps = this.editor.pixelSize; // 512/64 = 8px per pixel

    // Draw region borders and labels
    SKIN_REGIONS.forEach(region => {
      const rx = region.x * ps;
      const ry = region.y * ps;
      const rw = region.w * ps;
      const rh = region.h * ps;

      // Tinted background
      ctx.fillStyle = region.color.length > 7 ? region.color : region.color + '15';
      ctx.fillRect(rx, ry, rw, rh);

      // Border
      ctx.strokeStyle = region.color.substring(0, 7);
      ctx.lineWidth = 2;
      ctx.strokeRect(rx + 1, ry + 1, rw - 2, rh - 2);

      // Label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(region.label, rx + rw / 2, ry + rh / 2);
    });

    // Also draw pixel grid
    this.editor._drawGrid();
  }

  updatePreview() {
    const tex = this.editor.getTextureData();
    const texCtx = tex.getContext('2d');
    const data = texCtx.getImageData(0, 0, 64, 64);
    const ctx = this.previewCtx;
    const scale = 6;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);

    // Draw character front view — assemble from skin regions
    const cx = this.previewCanvas.width / 2;
    const startY = 10;

    // Helper: draw a region from skin data onto preview
    const drawPart = (srcX, srcY, srcW, srcH, destX, destY) => {
      // Create temp canvas to extract region
      const tmp = document.createElement('canvas');
      tmp.width = srcW;
      tmp.height = srcH;
      const tCtx = tmp.getContext('2d');
      tCtx.putImageData(
        texCtx.getImageData(srcX, srcY, srcW, srcH),
        0, 0
      );
      ctx.drawImage(tmp, destX, destY, srcW * scale, srcH * scale);
    };

    // Head front (8x8 at src 8,8)
    drawPart(8, 8, 8, 8, cx - 4 * scale, startY);
    // Body front (8x12 at src 20,20)
    drawPart(20, 20, 8, 12, cx - 4 * scale, startY + 8 * scale);
    // Right Arm front (4x12 at src 44,20)
    drawPart(44, 20, 4, 12, cx - 8 * scale, startY + 8 * scale);
    // Left Arm front (4x12 at src 36,52)
    drawPart(36, 52, 4, 12, cx + 4 * scale, startY + 8 * scale);
    // Right Leg front (4x12 at src 4,20)
    drawPart(4, 20, 4, 12, cx - 4 * scale, startY + 20 * scale);
    // Left Leg front (4x12 at src 20,52)
    drawPart(20, 52, 4, 12, cx, startY + 20 * scale);

    // Draw overlay layers on top
    // Head overlay (8x8 at src 40,8)
    drawPart(40, 8, 8, 8, cx - 4 * scale, startY);
    // Body overlay (8x12 at src 20,36)
    drawPart(20, 36, 8, 12, cx - 4 * scale, startY + 8 * scale);
  }

  downloadSkin(playerName) {
    const textureCanvas = this.editor.getTextureData();
    const link = document.createElement('a');
    link.download = (playerName || 'my-skin') + '.png';
    link.href = textureCanvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Redraw overlay after grid changes
  refreshOverlay() {
    this.editor._drawGrid();
    this.drawRegionOverlay();
  }
}

// Generate a basic Steve-like skin template
export function generateSteveSkin() {
  const pixels = Array(64).fill(null).map(() => Array(64).fill(null));
  const skin = '#c68e56';
  const skinDark = '#a07040';
  const shirt = '#00aaff';
  const shirtDark = '#0088cc';
  const pants = '#3030aa';
  const pantsDark = '#222288';
  const hair = '#443322';
  const hairDark = '#332211';
  const white = '#ffffff';
  const shoe = '#555555';

  function fillRect(px, py, pw, ph, color) {
    for (let y = py; y < py + ph && y < 64; y++) {
      for (let x = px; x < px + pw && x < 64; x++) {
        pixels[y][x] = color;
      }
    }
  }

  // Head top (8,0 to 15,7) — hair
  fillRect(8, 0, 8, 8, hair);
  // Head bottom
  fillRect(16, 0, 8, 8, skinDark);
  // Head front (8,8 to 15,15)
  fillRect(8, 8, 8, 8, skin);
  // Eyes
  pixels[11][9] = white; pixels[11][10] = '#553322';
  pixels[11][13] = '#553322'; pixels[11][14] = white;
  // Mouth
  pixels[13][10] = skinDark; pixels[13][11] = skinDark;
  pixels[13][12] = skinDark; pixels[13][13] = skinDark;
  // Head right
  fillRect(0, 8, 8, 8, skin);
  // Head left
  fillRect(16, 8, 8, 8, skin);
  // Head back
  fillRect(24, 8, 8, 8, hair);

  // Body top
  fillRect(20, 16, 8, 4, shirt);
  // Body bottom
  fillRect(28, 16, 8, 4, shirtDark);
  // Body front (20,20 to 27,31)
  fillRect(20, 20, 8, 12, shirt);
  fillRect(20, 28, 8, 4, pants);
  // Body sides
  fillRect(16, 20, 4, 12, shirtDark);
  fillRect(28, 20, 4, 12, shirtDark);
  // Body back
  fillRect(32, 20, 8, 12, shirtDark);

  // Right Arm
  fillRect(44, 16, 4, 4, skin);
  fillRect(48, 16, 4, 4, skinDark);
  fillRect(44, 20, 4, 12, shirt);
  fillRect(44, 28, 4, 4, skin);
  fillRect(40, 20, 4, 12, shirtDark);
  fillRect(48, 20, 4, 12, shirtDark);
  fillRect(52, 20, 4, 12, shirtDark);

  // Right Leg
  fillRect(4, 16, 4, 4, pants);
  fillRect(8, 16, 4, 4, pantsDark);
  fillRect(4, 20, 4, 12, pants);
  fillRect(4, 28, 4, 4, shoe);
  fillRect(0, 20, 4, 12, pantsDark);
  fillRect(8, 20, 4, 12, pantsDark);
  fillRect(12, 20, 4, 12, pantsDark);

  // Left Arm (1.8+ layout at 32,48)
  fillRect(36, 48, 4, 4, skin);
  fillRect(40, 48, 4, 4, skinDark);
  fillRect(36, 52, 4, 12, shirt);
  fillRect(36, 60, 4, 4, skin);
  fillRect(32, 52, 4, 12, shirtDark);
  fillRect(40, 52, 4, 12, shirtDark);
  fillRect(44, 52, 4, 12, shirtDark);

  // Left Leg (1.8+ layout at 16,48)
  fillRect(20, 48, 4, 4, pants);
  fillRect(24, 48, 4, 4, pantsDark);
  fillRect(20, 52, 4, 12, pants);
  fillRect(20, 60, 4, 4, shoe);
  fillRect(16, 52, 4, 12, pantsDark);
  fillRect(24, 52, 4, 12, pantsDark);
  fillRect(28, 52, 4, 12, pantsDark);

  return pixels;
}

export function generateAlexSkin() {
  // Alex has 3-pixel wide arms instead of 4
  // Start from Steve and adjust colors
  const pixels = generateSteveSkin();
  const orange = '#cc6600';
  const ginger = '#ff8844';
  const green = '#44aa44';
  const greenDark = '#338833';
  const skin = '#f0c8a0';
  const skinDark = '#d0a080';

  function fillRect(px, py, pw, ph, color) {
    for (let y = py; y < py + ph && y < 64; y++) {
      for (let x = px; x < px + pw && x < 64; x++) {
        pixels[y][x] = color;
      }
    }
  }

  // Replace hair with ginger
  fillRect(8, 0, 8, 8, ginger);
  fillRect(24, 8, 8, 8, ginger);
  // Lighter skin
  fillRect(8, 8, 8, 8, skin);
  pixels[11][9] = '#ffffff'; pixels[11][10] = '#228822';
  pixels[11][13] = '#228822'; pixels[11][14] = '#ffffff';
  pixels[13][10] = skinDark; pixels[13][11] = skinDark;
  pixels[13][12] = skinDark; pixels[13][13] = skinDark;
  fillRect(0, 8, 8, 8, skin);
  fillRect(16, 8, 8, 8, skin);
  // Green shirt
  fillRect(20, 16, 8, 4, green);
  fillRect(20, 20, 8, 8, green);
  fillRect(16, 20, 4, 12, greenDark);
  fillRect(28, 20, 4, 12, greenDark);
  fillRect(32, 20, 8, 12, greenDark);
  // Arms green
  fillRect(44, 20, 4, 8, green);
  fillRect(40, 20, 4, 12, greenDark);
  fillRect(48, 20, 4, 12, greenDark);
  fillRect(36, 52, 4, 8, green);
  fillRect(32, 52, 4, 12, greenDark);
  fillRect(40, 52, 4, 12, greenDark);

  return pixels;
}
