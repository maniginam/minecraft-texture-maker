import { PixelEditor } from './pixel-editor.js';
import { SkinEditor, generateSteveSkin, generateAlexSkin } from './skin-editor.js';
import { createPalette } from './color-palette.js';
import { TEMPLATES, TEXTURE_TARGETS, templateToImageData, templateToScaledImageData } from './templates.js';
import { PackExporter } from './pack-exporter.js';
import { showToast } from './toast.js';
import { playPlace, playSuccess, playUndo, playClear, playClick, playError } from './sounds.js';

// ===== TEXTURE EDITOR (RIGHT PANEL) =====
const pixelCanvas = document.getElementById('pixel-canvas');
const gridCanvas = document.getElementById('grid-canvas');
const editor = new PixelEditor(pixelCanvas, gridCanvas, { displaySize: 512, gridSize: 16 });
const exporter = new PackExporter();

// ===== SKIN EDITOR (LEFT PANEL) =====
const skinPixelCanvas = document.getElementById('skin-pixel-canvas');
const skinGridCanvas = document.getElementById('skin-grid-canvas');
const skinPreviewCanvas = document.getElementById('skin-preview-canvas');
const skinEditor = new SkinEditor(skinPixelCanvas, skinGridCanvas, skinPreviewCanvas);
const skinInner = skinEditor.getEditor();

// Track which panel was last active (for keyboard shortcuts)
let activePanel = 'texture';
document.getElementById('panel-skins').addEventListener('mousedown', () => { activePanel = 'skin'; });
document.getElementById('panel-textures').addEventListener('mousedown', () => { activePanel = 'texture'; });

// ===== TEXTURE COLOR PALETTE =====
const paletteContainer = document.getElementById('color-palette');
const currentColorEl = document.getElementById('current-color');
const currentColorLabel = document.getElementById('current-color-label');
const customColorInput = document.getElementById('custom-color');

function setTextureColor(color) {
  editor.setColor(color);
  currentColorEl.style.backgroundColor = color;
  currentColorLabel.textContent = color.toUpperCase();
  customColorInput.value = color;
}

createPalette(paletteContainer, (color) => {
  setTextureColor(color);
  playClick();
});

customColorInput.addEventListener('input', (e) => {
  setTextureColor(e.target.value);
  paletteContainer.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
});

editor.onColorPicked = (color) => {
  setTextureColor(color);
  showToast('Color picked!', 'info');
};

// ===== SKIN COLOR PALETTE =====
const skinPaletteContainer = document.getElementById('skin-color-palette');
const skinCurrentColorEl = document.getElementById('skin-current-color');
const skinColorLabel = document.getElementById('skin-color-label');
const skinCustomColorInput = document.getElementById('skin-custom-color');

function setSkinColor(color) {
  skinInner.setColor(color);
  skinCurrentColorEl.style.backgroundColor = color;
  skinColorLabel.textContent = color.toUpperCase();
  skinCustomColorInput.value = color;
}

createPalette(skinPaletteContainer, (color) => {
  setSkinColor(color);
  playClick();
});

skinCustomColorInput.addEventListener('input', (e) => {
  setSkinColor(e.target.value);
  skinPaletteContainer.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
});

skinInner.onColorPicked = (color) => {
  setSkinColor(color);
  showToast('Color picked!', 'info');
};

// ===== TOOLS (scoped per panel) =====
const textureCanvasWrapper = document.querySelector('.panel-textures .canvas-wrapper');
const skinCanvasWrapper = document.querySelector('.panel-skins .skin-canvas-wrapper');

document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const panel = btn.dataset.panel;
    // Deactivate sibling tools in same panel
    document.querySelectorAll(`.tool-btn[data-panel="${panel}"]`).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (panel === 'texture') {
      editor.setTool(btn.dataset.tool);
      textureCanvasWrapper.dataset.tool = btn.dataset.tool;
    } else {
      skinInner.setTool(btn.dataset.tool);
      skinCanvasWrapper.dataset.tool = btn.dataset.tool;
    }
    playClick();
  });
});

// ===== TEXTURE CANVAS SIZE =====
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    editor.setGridSize(parseInt(btn.dataset.size));
    playClick();
  });
});

// ===== TEXTURE CONTROLS =====
document.getElementById('btn-undo').addEventListener('click', () => { editor.undo(); playUndo(); });
document.getElementById('btn-redo').addEventListener('click', () => { editor.redo(); playUndo(); });
document.getElementById('btn-clear').addEventListener('click', () => {
  if (!confirm('Clear your whole drawing?')) return;
  editor.clear();
  playClear();
  showToast('Canvas cleared!', 'warning');
});
document.getElementById('btn-flip-h').addEventListener('click', () => {
  editor.flipHorizontal(); playClick(); showToast('Flipped!', 'info');
});
document.getElementById('btn-flip-v').addEventListener('click', () => {
  editor.flipVertical(); playClick(); showToast('Flipped!', 'info');
});
document.getElementById('show-grid').addEventListener('change', (e) => { editor.setGridVisible(e.target.checked); });
document.getElementById('mirror-mode').addEventListener('change', (e) => {
  editor.setMirrorMode(e.target.checked);
  if (e.target.checked) showToast('Mirror mode ON!', 'info');
});

// ===== SKIN CONTROLS =====
document.getElementById('skin-undo').addEventListener('click', () => { skinInner.undo(); playUndo(); });
document.getElementById('skin-redo').addEventListener('click', () => { skinInner.redo(); playUndo(); });
document.getElementById('skin-clear').addEventListener('click', () => {
  if (!confirm('Clear your whole skin?')) return;
  skinInner.clear();
  skinEditor.refreshOverlay();
  playClear();
  showToast('Skin cleared!', 'warning');
});
document.getElementById('skin-flip-h').addEventListener('click', () => {
  skinInner.flipHorizontal(); playClick(); showToast('Flipped!', 'info');
});
document.getElementById('skin-show-grid').addEventListener('change', (e) => {
  skinInner.setGridVisible(e.target.checked);
  skinEditor.refreshOverlay();
});
document.getElementById('skin-mirror').addEventListener('change', (e) => {
  skinInner.setMirrorMode(e.target.checked);
  if (e.target.checked) showToast('Mirror mode ON!', 'info');
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    const ed = activePanel === 'skin' ? skinInner : editor;
    if (e.shiftKey) { ed.redo(); } else { ed.undo(); }
    playUndo();
  }
});

// ===== TEXTURE PREVIEW (Isometric 3D Block) =====
const previewCanvas = document.getElementById('preview-canvas');
const previewCtx = previewCanvas.getContext('2d');

function drawIsometricBlock(ctx, texture, cx, cy, size) {
  const h = size * 0.5;

  // Top face
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - h);
  ctx.lineTo(cx + size, cy);
  ctx.lineTo(cx, cy + h);
  ctx.lineTo(cx - size, cy);
  ctx.closePath();
  ctx.clip();
  ctx.setTransform(1, 0.5, -1, 0.5, cx, cy - h);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(texture, 0, 0, size, size);
  ctx.restore();

  // Left face
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - size, cy);
  ctx.lineTo(cx, cy + h);
  ctx.lineTo(cx, cy + h + size);
  ctx.lineTo(cx - size, cy + size);
  ctx.closePath();
  ctx.clip();
  ctx.setTransform(1, 0.5, 0, 1, cx - size, cy);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(texture, 0, 0, size, size);
  ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.moveTo(cx - size, cy);
  ctx.lineTo(cx, cy + h);
  ctx.lineTo(cx, cy + h + size);
  ctx.lineTo(cx - size, cy + size);
  ctx.closePath();
  ctx.fill();

  // Right face
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx + size, cy);
  ctx.lineTo(cx, cy + h);
  ctx.lineTo(cx, cy + h + size);
  ctx.lineTo(cx + size, cy + size);
  ctx.closePath();
  ctx.clip();
  ctx.setTransform(1, -0.5, 0, 1, cx, cy + h);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(texture, 0, 0, size, size);
  ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.moveTo(cx + size, cy);
  ctx.lineTo(cx, cy + h);
  ctx.lineTo(cx, cy + h + size);
  ctx.lineTo(cx + size, cy + size);
  ctx.closePath();
  ctx.fill();
}

function updateTexturePreview() {
  const textureCanvas = editor.getTextureData();
  previewCtx.imageSmoothingEnabled = false;
  previewCtx.clearRect(0, 0, 192, 192);
  drawIsometricBlock(previewCtx, textureCanvas, 96, 46, 80);
  debouncedAutoSave();
}

editor.onPreviewUpdate = updateTexturePreview;

// ===== TEXTURE TEMPLATES =====
const templateList = document.getElementById('template-list');

Object.entries(TEMPLATES).forEach(([key, template]) => {
  const item = document.createElement('div');
  item.className = 'template-item';

  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = 16;
  thumbCanvas.height = 16;
  thumbCanvas.getContext('2d').putImageData(templateToImageData(template), 0, 0);

  const label = document.createElement('span');
  label.textContent = template.name;

  item.appendChild(thumbCanvas);
  item.appendChild(label);

  item.addEventListener('click', () => {
    const scaledData = templateToScaledImageData(template, editor.displaySize);
    if (template.pixels.length !== editor.gridSize) {
      editor.setGridSize(template.pixels.length);
      document.querySelectorAll('.size-btn').forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.size) === template.pixels.length);
      });
    }
    editor.loadImageData(scaledData);
    playPlace();
    showToast(`Loaded ${template.name}!`, 'info');
  });

  templateList.appendChild(item);
});

// ===== SKIN TEMPLATES =====
function loadSkinTemplate(pixels) {
  const size = 64;
  const imgData = new ImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const color = pixels[y] && pixels[y][x];
      if (!color) continue;
      const i = (y * size + x) * 4;
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      imgData.data[i] = r;
      imgData.data[i + 1] = g;
      imgData.data[i + 2] = b;
      imgData.data[i + 3] = 255;
    }
  }
  // Scale to display size
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = size;
  tempCanvas.height = size;
  tempCanvas.getContext('2d').putImageData(imgData, 0, 0);

  const scaled = document.createElement('canvas');
  scaled.width = 512;
  scaled.height = 512;
  const sCtx = scaled.getContext('2d');
  sCtx.imageSmoothingEnabled = false;
  sCtx.drawImage(tempCanvas, 0, 0, 512, 512);

  skinInner.loadImageData(sCtx.getImageData(0, 0, 512, 512));
  skinEditor.refreshOverlay();
  playPlace();
}

document.querySelectorAll('.skin-template-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const skin = btn.dataset.skin;
    if (skin === 'steve') {
      loadSkinTemplate(generateSteveSkin());
      showToast('Loaded Steve!', 'info');
    } else if (skin === 'alex') {
      loadSkinTemplate(generateAlexSkin());
      showToast('Loaded Alex!', 'info');
    } else {
      skinInner.clear();
      skinEditor.refreshOverlay();
      showToast('Blank skin!', 'info');
    }
  });
});

// ===== SKIN DOWNLOAD =====
document.getElementById('btn-download-skin').addEventListener('click', () => {
  const name = document.getElementById('skin-name').value.trim() || 'my-skin';
  skinEditor.downloadSkin(name);
  playSuccess();
  showToast('Skin downloaded!', 'success');
});

// ===== TEXTURE TARGET SELECT (grouped) =====
const targetSelect = document.getElementById('texture-target-select');

const groups = {};
TEXTURE_TARGETS.forEach(target => {
  const category = target.value.startsWith('block/') ? 'Blocks' :
    target.value.includes('sword') ? 'Swords' :
    target.value.includes('pickaxe') ? 'Pickaxes' :
    target.value.includes('axe') && !target.value.includes('pickaxe') ? 'Axes' :
    target.value.includes('shovel') ? 'Shovels' :
    (target.value.includes('bow') || target.value.includes('arrow') || target.value.includes('trident') || target.value.includes('crossbow')) ? 'Ranged Weapons' :
    (target.value.includes('helmet') || target.value.includes('chestplate') || target.value.includes('leggings') || target.value.includes('boots') || target.value.includes('shield')) ? 'Armor' :
    'Food & Items';
  if (!groups[category]) groups[category] = [];
  groups[category].push(target);
});

Object.entries(groups).forEach(([groupName, targets]) => {
  const optgroup = document.createElement('optgroup');
  optgroup.label = groupName;
  targets.forEach(target => {
    const option = document.createElement('option');
    option.value = target.value;
    option.textContent = target.label;
    optgroup.appendChild(option);
  });
  targetSelect.appendChild(optgroup);
});

// ===== PACK MANAGEMENT =====
const packTexturesEl = document.getElementById('pack-textures');

function renderPackTextures() {
  packTexturesEl.innerHTML = '';
  const textures = exporter.getTextures();
  if (textures.length === 0) {
    packTexturesEl.innerHTML = '<div class="pack-empty">No textures yet! Draw something and click "Add to Pack"</div>';
    return;
  }
  textures.forEach((tex, index) => {
    const item = document.createElement('div');
    item.className = 'pack-texture-item';
    item.title = tex.name;

    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = tex.canvas.width;
    thumbCanvas.height = tex.canvas.height;
    thumbCanvas.getContext('2d').drawImage(tex.canvas, 0, 0);

    thumbCanvas.addEventListener('click', () => {
      const imgData = tex.canvas.getContext('2d').getImageData(0, 0, tex.canvas.width, tex.canvas.height);
      editor.setGridSize(tex.canvas.width);
      document.querySelectorAll('.size-btn').forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.size) === tex.canvas.width);
      });
      editor.loadImageData(templateToScaledImageData(
        { pixels: imageDataToPixels(imgData, tex.canvas.width) },
        editor.displaySize
      ));
      playPlace();
      showToast(`Loaded ${tex.name}`, 'info');
    });

    const removeBtn = document.createElement('button');
    removeBtn.className = 'pack-texture-remove';
    removeBtn.textContent = 'x';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!confirm(`Remove ${tex.name} from your pack?`)) return;
      exporter.removeTexture(index);
      renderPackTextures();
      savePackToStorage();
      playUndo();
      showToast(`Removed ${tex.name}`, 'warning');
    });

    item.appendChild(thumbCanvas);
    item.appendChild(removeBtn);
    packTexturesEl.appendChild(item);
  });
}

function imageDataToPixels(imageData, size) {
  const pixels = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      if (imageData.data[i + 3] === 0) {
        row.push(null);
      } else {
        row.push('#' + [imageData.data[i], imageData.data[i+1], imageData.data[i+2]]
          .map(v => v.toString(16).padStart(2, '0')).join(''));
      }
    }
    pixels.push(row);
  }
  return pixels;
}

// ===== CONFETTI =====
function burstConfetti(originEl) {
  const rect = originEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const colors = ['#4caf50', '#ff9800', '#2196f3', '#e91e63', '#ffeb3b', '#9c27b0'];
  for (let i = 0; i < 24; i++) {
    const particle = document.createElement('div');
    const angle = (Math.PI * 2 * i) / 24 + (Math.random() - 0.5) * 0.5;
    const dist = 60 + Math.random() * 80;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 40;
    const size = 6 + Math.random() * 6;
    particle.style.cssText = `
      position: fixed; left: ${cx}px; top: ${cy}px; width: ${size}px; height: ${size}px;
      background: ${colors[i % colors.length]}; border-radius: 2px; z-index: 9999;
      pointer-events: none; transition: all 0.6s cubic-bezier(.2,.8,.3,1);
    `;
    document.body.appendChild(particle);
    requestAnimationFrame(() => {
      particle.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.random() * 360}deg)`;
      particle.style.opacity = '0';
    });
    setTimeout(() => particle.remove(), 700);
  }
}

const addToPackBtn = document.getElementById('btn-add-to-pack');
addToPackBtn.addEventListener('click', () => {
  const target = targetSelect.value;
  const label = targetSelect.options[targetSelect.selectedIndex].text;
  const textureCanvas = editor.getTextureData();
  exporter.addTexture(label, target, textureCanvas);
  renderPackTextures();
  savePackToStorage();
  playSuccess();
  burstConfetti(addToPackBtn);
  showToast(`Added ${label} to your pack!`, 'success');
});

document.getElementById('btn-download').addEventListener('click', async () => {
  const packName = document.getElementById('pack-name').value.trim() || 'My Cool Pack';
  try {
    await exporter.exportPack(packName);
    playSuccess();
    showToast('Pack downloaded! Check your Downloads folder', 'success');
  } catch (err) {
    playError();
    showToast(err.message, 'error');
  }
});

// ===== localStorage AUTO-SAVE =====
const STORAGE_KEY = 'mc-texture-maker';
let autoSaveTimer = null;
function debouncedAutoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(autoSave, 500);
}

function autoSave() {
  try {
    const dataURL = pixelCanvas.toDataURL('image/png');
    const skinDataURL = skinPixelCanvas.toDataURL('image/png');
    const saved = {
      drawing: dataURL,
      gridSize: editor.gridSize,
      packName: document.getElementById('pack-name').value,
      skinDrawing: skinDataURL,
      skinName: document.getElementById('skin-name').value,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch (e) {
    // localStorage full or unavailable
  }
}

function savePackToStorage() {
  try {
    const textures = exporter.getTextures().map(tex => ({
      name: tex.name,
      targetPath: tex.targetPath,
      dataURL: tex.canvas.toDataURL('image/png'),
      width: tex.canvas.width,
      height: tex.canvas.height,
    }));
    localStorage.setItem(STORAGE_KEY + '-pack', JSON.stringify(textures));
  } catch (e) {
    // silently ignore
  }
}

function loadFromStorage() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) {
      if (saved.gridSize && saved.gridSize !== editor.gridSize) {
        editor.setGridSize(saved.gridSize);
        document.querySelectorAll('.size-btn').forEach(b => {
          b.classList.toggle('active', parseInt(b.dataset.size) === saved.gridSize);
        });
      }
      if (saved.packName) {
        document.getElementById('pack-name').value = saved.packName;
      }
      if (saved.skinName) {
        document.getElementById('skin-name').value = saved.skinName;
      }
      if (saved.drawing) {
        const img = new Image();
        img.onload = () => {
          editor.ctx.clearRect(0, 0, editor.displaySize, editor.displaySize);
          editor.ctx.drawImage(img, 0, 0);
          updateTexturePreview();
        };
        img.src = saved.drawing;
      }
      if (saved.skinDrawing) {
        const img = new Image();
        img.onload = () => {
          skinInner.ctx.clearRect(0, 0, skinInner.displaySize, skinInner.displaySize);
          skinInner.ctx.drawImage(img, 0, 0);
          skinEditor.updatePreview();
        };
        img.src = saved.skinDrawing;
      }
    }

    // Restore pack textures
    const packData = JSON.parse(localStorage.getItem(STORAGE_KEY + '-pack'));
    if (packData && packData.length > 0) {
      let loaded = 0;
      packData.forEach(tex => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement('canvas');
          c.width = tex.width;
          c.height = tex.height;
          c.getContext('2d').drawImage(img, 0, 0);
          exporter.addTexture(tex.name, tex.targetPath, c);
          loaded++;
          if (loaded === packData.length) renderPackTextures();
        };
        img.src = tex.dataURL;
      });
    }
  } catch (e) {
    // corrupted storage
  }
}

// Save on name changes
document.getElementById('pack-name').addEventListener('input', autoSave);
document.getElementById('skin-name').addEventListener('input', autoSave);

// Also save skin on every skin edit
skinInner.onPreviewUpdate = () => {
  skinEditor.updatePreview();
  debouncedAutoSave();
};

// ===== BACKGROUND REMOVAL =====
function removeBackground(imageData, width, height) {
  const data = imageData.data;
  const corners = [
    0,
    (width - 1) * 4,
    (height - 1) * width * 4,
    ((height - 1) * width + (width - 1)) * 4,
  ];
  const edges = [
    (Math.floor(width / 2)) * 4,
    ((height - 1) * width + Math.floor(width / 2)) * 4,
    (Math.floor(height / 2) * width) * 4,
    (Math.floor(height / 2) * width + (width - 1)) * 4,
  ];
  const samples = [...corners, ...edges];
  const colorCounts = {};
  samples.forEach(i => {
    const key = `${data[i]},${data[i+1]},${data[i+2]}`;
    colorCounts[key] = (colorCounts[key] || 0) + 1;
  });
  const bgColor = Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])[0][0]
    .split(',').map(Number);

  const tolerance = 35;
  for (let i = 0; i < data.length; i += 4) {
    const dr = Math.abs(data[i] - bgColor[0]);
    const dg = Math.abs(data[i+1] - bgColor[1]);
    const db = Math.abs(data[i+2] - bgColor[2]);
    if (dr + dg + db < tolerance) {
      data[i+3] = 0;
    }
  }
  return imageData;
}

// ===== OBJECT DETECTION =====
function findObjects(imageData, width, height) {
  const data = imageData.data;
  const labels = new Int32Array(width * height);
  let nextLabel = 1;

  function isVisible(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    return data[(y * width + x) * 4 + 3] > 30;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (labels[idx] !== 0 || !isVisible(x, y)) continue;
      const label = nextLabel++;
      const stack = [{ x, y }];
      while (stack.length > 0) {
        const p = stack.pop();
        const pi = p.y * width + p.x;
        if (p.x < 0 || p.x >= width || p.y < 0 || p.y >= height) continue;
        if (labels[pi] !== 0 || !isVisible(p.x, p.y)) continue;
        labels[pi] = label;
        stack.push({ x: p.x + 1, y: p.y });
        stack.push({ x: p.x - 1, y: p.y });
        stack.push({ x: p.x, y: p.y + 1 });
        stack.push({ x: p.x, y: p.y - 1 });
      }
    }
  }

  const boxes = {};
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const label = labels[y * width + x];
      if (label === 0) continue;
      if (!boxes[label]) {
        boxes[label] = { minX: x, minY: y, maxX: x, maxY: y, pixelCount: 0 };
      }
      const b = boxes[label];
      b.minX = Math.min(b.minX, x);
      b.minY = Math.min(b.minY, y);
      b.maxX = Math.max(b.maxX, x);
      b.maxY = Math.max(b.maxY, y);
      b.pixelCount++;
    }
  }

  const minPixels = width * height * 0.02;
  return Object.values(boxes).filter(b => b.pixelCount >= minPixels);
}

function extractObject(img, box, bgRemovedData, srcWidth, srcHeight) {
  const objW = box.maxX - box.minX + 1;
  const objH = box.maxY - box.minY + 1;
  const maxDim = Math.max(objW, objH);
  const pad = Math.max(2, Math.floor(maxDim * 0.1));
  const squareSize = maxDim + pad * 2;

  const canvas = document.createElement('canvas');
  canvas.width = squareSize;
  canvas.height = squareSize;
  const ctx = canvas.getContext('2d');

  const offsetX = pad + Math.floor((maxDim - objW) / 2);
  const offsetY = pad + Math.floor((maxDim - objH) / 2);

  const srcData = bgRemovedData.data;
  const destData = ctx.createImageData(squareSize, squareSize);
  for (let y = box.minY; y <= box.maxY; y++) {
    for (let x = box.minX; x <= box.maxX; x++) {
      const si = (y * srcWidth + x) * 4;
      if (srcData[si + 3] <= 30) continue;
      const dx = x - box.minX + offsetX;
      const dy = y - box.minY + offsetY;
      const di = (dy * squareSize + dx) * 4;
      destData.data[di] = srcData[si];
      destData.data[di + 1] = srcData[si + 1];
      destData.data[di + 2] = srcData[si + 2];
      destData.data[di + 3] = srcData[si + 3];
    }
  }
  ctx.putImageData(destData, 0, 0);
  return canvas;
}

function showObjectPicker(objectCanvases) {
  const existing = document.getElementById('object-picker-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'object-picker-overlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.8); display: flex; flex-direction: column;
    align-items: center; justify-content: center; z-index: 1000;
  `;

  const title = document.createElement('div');
  title.textContent = 'Pick the one you want!';
  title.style.cssText = `
    color: white; font-size: 28px; font-weight: bold; margin-bottom: 20px;
    text-shadow: 2px 2px 0 #1b5e20;
  `;
  overlay.appendChild(title);

  const grid = document.createElement('div');
  grid.style.cssText = `
    display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;
    max-width: 800px;
  `;

  objectCanvases.forEach((objCanvas) => {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      cursor: pointer; border: 3px solid #555; border-radius: 12px;
      padding: 8px; background: #383838; transition: all 0.15s;
      display: flex; align-items: center; justify-content: center;
    `;
    wrapper.addEventListener('mouseenter', () => {
      wrapper.style.borderColor = '#4caf50';
      wrapper.style.transform = 'scale(1.05)';
    });
    wrapper.addEventListener('mouseleave', () => {
      wrapper.style.borderColor = '#555';
      wrapper.style.transform = '';
    });

    const display = document.createElement('canvas');
    display.width = 128;
    display.height = 128;
    const dCtx = display.getContext('2d');
    dCtx.imageSmoothingEnabled = false;
    for (let cy = 0; cy < 128; cy += 8) {
      for (let cx = 0; cx < 128; cx += 8) {
        dCtx.fillStyle = ((cx + cy) / 8) % 2 === 0 ? '#666' : '#555';
        dCtx.fillRect(cx, cy, 8, 8);
      }
    }
    dCtx.drawImage(objCanvas, 0, 0, 128, 128);
    display.style.cssText = 'image-rendering: pixelated; border-radius: 8px;';

    wrapper.appendChild(display);
    wrapper.addEventListener('click', () => {
      loadSingleObjectToEditor(objCanvas);
      overlay.remove();
      playPlace();
    });
    grid.appendChild(wrapper);
  });

  overlay.appendChild(grid);

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.cssText = `
    margin-top: 20px; padding: 12px 36px; border: none; border-radius: 8px;
    background: #666; color: white; font-size: 18px; cursor: pointer;
    font-weight: bold;
  `;
  cancelBtn.addEventListener('click', () => overlay.remove());
  overlay.appendChild(cancelBtn);

  document.body.appendChild(overlay);
}

function loadSingleObjectToEditor(objCanvas) {
  const size = editor.gridSize;
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = size;
  tempCanvas.height = size;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.imageSmoothingEnabled = false;
  tempCtx.drawImage(objCanvas, 0, 0, size, size);
  const smallData = tempCtx.getImageData(0, 0, size, size);
  const pixels = imageDataToPixels(smallData, size);
  editor.loadImageData(templateToScaledImageData({ pixels }, editor.displaySize));
}

// ===== DRAG & DROP (texture panel only) =====
function loadImageToEditor(img) {
  const detectSize = 256;
  const detectCanvas = document.createElement('canvas');
  detectCanvas.width = detectSize;
  detectCanvas.height = detectSize;
  const detectCtx = detectCanvas.getContext('2d');
  detectCtx.imageSmoothingEnabled = false;
  detectCtx.drawImage(img, 0, 0, detectSize, detectSize);
  let detectData = detectCtx.getImageData(0, 0, detectSize, detectSize);
  detectData = removeBackground(detectData, detectSize, detectSize);

  const objects = findObjects(detectData, detectSize, detectSize);

  if (objects.length <= 1) {
    const size = editor.gridSize;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = size;
    tempCanvas.height = size;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = false;
    tempCtx.drawImage(img, 0, 0, size, size);
    let smallData = tempCtx.getImageData(0, 0, size, size);
    smallData = removeBackground(smallData, size, size);
    const pixels = imageDataToPixels(smallData, size);
    editor.loadImageData(templateToScaledImageData({ pixels }, editor.displaySize));
    playPlace();
    showToast('Image loaded!', 'success');
  } else {
    showToast(`Found ${objects.length} items — pick one!`, 'info');
    const objectCanvases = objects.map(box =>
      extractObject(img, box, detectData, detectSize, detectSize)
    );
    showObjectPicker(objectCanvases);
  }
}

textureCanvasWrapper.addEventListener('dragover', (e) => {
  e.preventDefault();
  textureCanvasWrapper.style.outline = '3px dashed #4caf50';
});

textureCanvasWrapper.addEventListener('dragleave', () => {
  textureCanvasWrapper.style.outline = '';
});

textureCanvasWrapper.addEventListener('drop', (e) => {
  e.preventDefault();
  textureCanvasWrapper.style.outline = '';
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      loadImageToEditor(img);
    };
    img.src = URL.createObjectURL(file);
  }
});

// Paste goes to texture editor
document.addEventListener('paste', (e) => {
  const items = e.clipboardData.items;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault();
      const blob = item.getAsFile();
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        loadImageToEditor(img);
      };
      img.src = URL.createObjectURL(blob);
      break;
    }
  }
});

// ===== SPLIT DIVIDER DRAG =====
const divider = document.getElementById('split-divider');
const skinPanel = document.getElementById('panel-skins');
const texturePanel = document.getElementById('panel-textures');
const splitContainer = document.querySelector('.split-container');

let isDragging = false;

divider.addEventListener('mousedown', (e) => {
  e.preventDefault();
  isDragging = true;
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const containerRect = splitContainer.getBoundingClientRect();
  const x = e.clientX - containerRect.left;
  const total = containerRect.width - 8; // minus divider width
  const pct = Math.max(20, Math.min(80, (x / containerRect.width) * 100));
  skinPanel.style.flex = 'none';
  skinPanel.style.width = pct + '%';
  texturePanel.style.flex = 'none';
  texturePanel.style.width = (100 - pct) + '%';
});

document.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
});

// ===== STARTUP =====
loadFromStorage();
renderPackTextures();
updateTexturePreview();
