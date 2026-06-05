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

// --- Drag & Drop Image onto Canvas ---
function loadImageToEditor(img) {
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
