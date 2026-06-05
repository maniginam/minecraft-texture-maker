import { PixelEditor } from './pixel-editor.js';
import { createPalette } from './color-palette.js';
import { TEMPLATES, TEXTURE_TARGETS, templateToImageData, templateToScaledImageData } from './templates.js';
import { PackExporter } from './pack-exporter.js';

// --- Init Editor ---
const pixelCanvas = document.getElementById('pixel-canvas');
const gridCanvas = document.getElementById('grid-canvas');
const editor = new PixelEditor(pixelCanvas, gridCanvas, { displaySize: 512, gridSize: 16 });
const exporter = new PackExporter();

// --- Color Palette ---
const paletteContainer = document.getElementById('color-palette');
const currentColorEl = document.getElementById('current-color');
const currentColorLabel = document.getElementById('current-color-label');
const customColorInput = document.getElementById('custom-color');

function setColor(color) {
  editor.setColor(color);
  currentColorEl.style.backgroundColor = color;
  currentColorLabel.textContent = color.toUpperCase();
  customColorInput.value = color;
}

createPalette(paletteContainer, setColor);

customColorInput.addEventListener('input', (e) => {
  setColor(e.target.value);
  paletteContainer.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
});

editor.onColorPicked = (color) => {
  setColor(color);
};

// --- Tools ---
document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    editor.setTool(btn.dataset.tool);
  });
});

// --- Canvas Size ---
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    editor.setGridSize(parseInt(btn.dataset.size));
  });
});

// --- Controls ---
document.getElementById('btn-undo').addEventListener('click', () => editor.undo());
document.getElementById('btn-redo').addEventListener('click', () => editor.redo());
document.getElementById('btn-clear').addEventListener('click', () => editor.clear());
document.getElementById('show-grid').addEventListener('change', (e) => {
  editor.setGridVisible(e.target.checked);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    if (e.shiftKey) {
      editor.redo();
    } else {
      editor.undo();
    }
  }
});

// --- Preview ---
const previewCanvas = document.getElementById('preview-canvas');
const previewCtx = previewCanvas.getContext('2d');

function updatePreview() {
  const textureCanvas = editor.getTextureData();
  previewCtx.imageSmoothingEnabled = false;
  previewCtx.clearRect(0, 0, 192, 192);
  // Tile 3x3
  const tileSize = 64;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      previewCtx.drawImage(textureCanvas, col * tileSize, row * tileSize, tileSize, tileSize);
    }
  }
}

editor.onPreviewUpdate = updatePreview;

// --- Templates ---
const templateList = document.getElementById('template-list');

Object.entries(TEMPLATES).forEach(([key, template]) => {
  const item = document.createElement('div');
  item.className = 'template-item';

  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = 16;
  thumbCanvas.height = 16;
  const thumbCtx = thumbCanvas.getContext('2d');

  const imgData = templateToImageData(template);
  thumbCtx.putImageData(imgData, 0, 0);

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
  });

  templateList.appendChild(item);
});

// --- Texture Target Select ---
const targetSelect = document.getElementById('texture-target-select');
TEXTURE_TARGETS.forEach(target => {
  const option = document.createElement('option');
  option.value = target.value;
  option.textContent = target.label;
  targetSelect.appendChild(option);
});

// --- Pack Management ---
const packTexturesEl = document.getElementById('pack-textures');

function renderPackTextures() {
  packTexturesEl.innerHTML = '';
  exporter.getTextures().forEach((tex, index) => {
    const item = document.createElement('div');
    item.className = 'pack-texture-item';
    item.title = tex.name;

    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = tex.canvas.width;
    thumbCanvas.height = tex.canvas.height;
    thumbCanvas.getContext('2d').drawImage(tex.canvas, 0, 0);

    // Click to load back into editor
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
    });

    const removeBtn = document.createElement('button');
    removeBtn.className = 'pack-texture-remove';
    removeBtn.textContent = 'x';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      exporter.removeTexture(index);
      renderPackTextures();
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

document.getElementById('btn-add-to-pack').addEventListener('click', () => {
  const target = targetSelect.value;
  const label = targetSelect.options[targetSelect.selectedIndex].text;
  const textureCanvas = editor.getTextureData();
  exporter.addTexture(label, target, textureCanvas);
  renderPackTextures();
});

document.getElementById('btn-download').addEventListener('click', async () => {
  const packName = document.getElementById('pack-name').value.trim() || 'My Cool Pack';
  try {
    await exporter.exportPack(packName);
  } catch (err) {
    alert(err.message);
  }
});

// --- Background Removal ---
function removeBackground(imageData, width, height) {
  const data = imageData.data;
  // Sample corners to detect background color
  const corners = [
    0,                              // top-left
    (width - 1) * 4,               // top-right
    (height - 1) * width * 4,      // bottom-left
    ((height - 1) * width + (width - 1)) * 4, // bottom-right
  ];
  // Also sample edges (mid-top, mid-bottom, mid-left, mid-right)
  const edges = [
    (Math.floor(width / 2)) * 4,                          // mid-top
    ((height - 1) * width + Math.floor(width / 2)) * 4,   // mid-bottom
    (Math.floor(height / 2) * width) * 4,                  // mid-left
    (Math.floor(height / 2) * width + (width - 1)) * 4,   // mid-right
  ];
  const samples = [...corners, ...edges];
  // Find most common corner/edge color
  const colorCounts = {};
  samples.forEach(i => {
    const key = `${data[i]},${data[i+1]},${data[i+2]}`;
    colorCounts[key] = (colorCounts[key] || 0) + 1;
  });
  const bgColor = Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])[0][0]
    .split(',').map(Number);

  // Remove pixels that are close to the background color
  const tolerance = 35;
  for (let i = 0; i < data.length; i += 4) {
    const dr = Math.abs(data[i] - bgColor[0]);
    const dg = Math.abs(data[i+1] - bgColor[1]);
    const db = Math.abs(data[i+2] - bgColor[2]);
    if (dr + dg + db < tolerance) {
      data[i+3] = 0; // make transparent
    }
  }
  return imageData;
}

// --- Object Detection (find separate items in image) ---
function findObjects(imageData, width, height) {
  const data = imageData.data;
  const labels = new Int32Array(width * height);
  let nextLabel = 1;

  function isVisible(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    return data[(y * width + x) * 4 + 3] > 30;
  }

  // Connected component labeling (flood fill)
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

  // Find bounding boxes for each label
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

  // Filter out tiny noise (less than 2% of image area)
  const minPixels = width * height * 0.02;
  return Object.values(boxes).filter(b => b.pixelCount >= minPixels);
}

function extractObject(img, box, bgRemovedData, srcWidth, srcHeight) {
  const objW = box.maxX - box.minX + 1;
  const objH = box.maxY - box.minY + 1;
  const maxDim = Math.max(objW, objH);
  // Pad to square with some margin
  const pad = Math.max(2, Math.floor(maxDim * 0.1));
  const squareSize = maxDim + pad * 2;

  const canvas = document.createElement('canvas');
  canvas.width = squareSize;
  canvas.height = squareSize;
  const ctx = canvas.getContext('2d');

  // Center the object in the square
  const offsetX = pad + Math.floor((maxDim - objW) / 2);
  const offsetY = pad + Math.floor((maxDim - objH) / 2);

  // Copy only the object pixels from the bg-removed data
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
  // Remove existing picker if any
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
    color: white; font-size: 24px; font-weight: bold; margin-bottom: 20px;
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
    // Checkerboard background for transparency
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
    });
    grid.appendChild(wrapper);
  });

  overlay.appendChild(grid);

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.cssText = `
    margin-top: 20px; padding: 10px 30px; border: none; border-radius: 8px;
    background: #666; color: white; font-size: 16px; cursor: pointer;
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

// --- Drag & Drop Image onto Canvas ---
function loadImageToEditor(img) {
  // Work at higher resolution for object detection
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
    // Single object or no objects — load directly
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
  } else {
    // Multiple objects — let kid pick
    const objectCanvases = objects.map(box =>
      extractObject(img, box, detectData, detectSize, detectSize)
    );
    showObjectPicker(objectCanvases);
  }
}

const canvasWrapper = document.querySelector('.canvas-wrapper');

canvasWrapper.addEventListener('dragover', (e) => {
  e.preventDefault();
  canvasWrapper.style.outline = '3px dashed #4caf50';
});

canvasWrapper.addEventListener('dragleave', () => {
  canvasWrapper.style.outline = '';
});

canvasWrapper.addEventListener('drop', (e) => {
  e.preventDefault();
  canvasWrapper.style.outline = '';
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    const img = new Image();
    img.onload = () => loadImageToEditor(img);
    img.src = URL.createObjectURL(file);
  }
});

// --- Paste Image (Ctrl+V / Cmd+V) ---
document.addEventListener('paste', (e) => {
  const items = e.clipboardData.items;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault();
      const blob = item.getAsFile();
      const img = new Image();
      img.onload = () => loadImageToEditor(img);
      img.src = URL.createObjectURL(blob);
      break;
    }
  }
});

// Initial preview
updatePreview();
