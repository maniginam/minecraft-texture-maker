import { hexToRgba, colorsMatch } from './color-palette.js';

export class PixelEditor {
  constructor(canvas, gridCanvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gridCanvas = gridCanvas;
    this.gridCtx = gridCanvas.getContext('2d');
    this.displaySize = options.displaySize || 512;
    this.gridSize = options.gridSize || 16;
    this.pixelSize = this.displaySize / this.gridSize;
    this.currentColor = '#000000';
    this.currentTool = 'pencil';
    this.showGrid = true;
    this.isDrawing = false;
    this.undoStack = [];
    this.redoStack = [];
    this.maxUndo = 50;
    this.mirrorMode = false;

    this._initCanvas();
    this._drawGrid();
    this._bindEvents();
  }

  _initCanvas() {
    this.canvas.width = this.displaySize;
    this.canvas.height = this.displaySize;
    this.gridCanvas.width = this.displaySize;
    this.gridCanvas.height = this.displaySize;
    this.ctx.imageSmoothingEnabled = false;
    this.clear(false);
  }

  _bindEvents() {
    const getPixelCoords = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.displaySize / rect.width;
      const scaleY = this.displaySize / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX / this.pixelSize);
      const y = Math.floor((e.clientY - rect.top) * scaleY / this.pixelSize);
      return { x: Math.max(0, Math.min(x, this.gridSize - 1)), y: Math.max(0, Math.min(y, this.gridSize - 1)) };
    };

    // Use the grid canvas parent for events since grid canvas has pointer-events: none
    const eventTarget = this.canvas.parentElement;

    eventTarget.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const { x, y } = getPixelCoords(e);
      this.isDrawing = true;

      if (this.currentTool === 'fill') {
        this._saveState();
        this._floodFill(x, y);
        this._updatePreview();
      } else if (this.currentTool === 'picker') {
        this._pickColor(x, y);
      } else {
        this._saveState();
        this._applyTool(x, y);
        this._updatePreview();
      }
    });

    eventTarget.addEventListener('mousemove', (e) => {
      if (!this.isDrawing) return;
      if (this.currentTool === 'fill' || this.currentTool === 'picker') return;
      const { x, y } = getPixelCoords(e);
      this._applyTool(x, y);
      this._updatePreview();
    });

    eventTarget.addEventListener('mouseup', () => {
      this.isDrawing = false;
    });

    eventTarget.addEventListener('mouseleave', () => {
      this.isDrawing = false;
    });

    // Touch support for tablets
    eventTarget.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      eventTarget.dispatchEvent(mouseEvent);
    });

    eventTarget.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      eventTarget.dispatchEvent(mouseEvent);
    });

    eventTarget.addEventListener('touchend', () => {
      eventTarget.dispatchEvent(new MouseEvent('mouseup'));
    });
  }

  _applyTool(x, y) {
    if (this.currentTool === 'pencil') {
      this._setPixel(x, y, this.currentColor);
      if (this.mirrorMode) {
        this._setPixel(this.gridSize - 1 - x, y, this.currentColor);
      }
    } else if (this.currentTool === 'eraser') {
      this._clearPixel(x, y);
      if (this.mirrorMode) {
        this._clearPixel(this.gridSize - 1 - x, y);
      }
    }
  }

  _setPixel(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.clearRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
    this.ctx.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
  }

  _clearPixel(x, y) {
    this.ctx.clearRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
  }

  _getPixelColor(x, y) {
    const px = x * this.pixelSize + Math.floor(this.pixelSize / 2);
    const py = y * this.pixelSize + Math.floor(this.pixelSize / 2);
    const data = this.ctx.getImageData(px, py, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2], a: data[3] };
  }

  _pickColor(x, y) {
    const { r, g, b, a } = this._getPixelColor(x, y);
    if (a === 0) return;
    const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    this.currentColor = hex;
    if (this.onColorPicked) this.onColorPicked(hex);
  }

  _floodFill(startX, startY) {
    // Batch: read all pixels once, then write once at the end
    const fullData = this.ctx.getImageData(0, 0, this.displaySize, this.displaySize);
    const data = fullData.data;
    const ps = this.pixelSize;
    const half = Math.floor(ps / 2);

    const getColor = (x, y) => {
      const px = x * ps + half;
      const py = y * ps + half;
      const i = (py * this.displaySize + px) * 4;
      return { r: data[i], g: data[i+1], b: data[i+2], a: data[i+3] };
    };

    const target = getColor(startX, startY);
    const fill = hexToRgba(this.currentColor);
    if (colorsMatch(target.r, target.g, target.b, target.a, fill.r, fill.g, fill.b, fill.a)) return;

    const visited = new Uint8Array(this.gridSize * this.gridSize);
    const stack = [startX, startY];

    while (stack.length > 0) {
      const y = stack.pop();
      const x = stack.pop();
      const key = y * this.gridSize + x;

      if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) continue;
      if (visited[key]) continue;
      visited[key] = 1;

      const current = getColor(x, y);
      if (!colorsMatch(current.r, current.g, current.b, current.a, target.r, target.g, target.b, target.a)) continue;

      // Fill the pixel block in the image data
      for (let py = y * ps; py < (y + 1) * ps; py++) {
        for (let px = x * ps; px < (x + 1) * ps; px++) {
          const i = (py * this.displaySize + px) * 4;
          data[i] = fill.r;
          data[i+1] = fill.g;
          data[i+2] = fill.b;
          data[i+3] = fill.a;
        }
      }

      stack.push(x + 1, y);
      stack.push(x - 1, y);
      stack.push(x, y + 1);
      stack.push(x, y - 1);
    }

    this.ctx.putImageData(fullData, 0, 0);
  }

  _drawGrid() {
    this.gridCtx.clearRect(0, 0, this.displaySize, this.displaySize);
    if (!this.showGrid) return;

    this.gridCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    this.gridCtx.lineWidth = 1;

    for (let i = 0; i <= this.gridSize; i++) {
      const pos = i * this.pixelSize;
      this.gridCtx.beginPath();
      this.gridCtx.moveTo(pos, 0);
      this.gridCtx.lineTo(pos, this.displaySize);
      this.gridCtx.stroke();

      this.gridCtx.beginPath();
      this.gridCtx.moveTo(0, pos);
      this.gridCtx.lineTo(this.displaySize, pos);
      this.gridCtx.stroke();
    }
  }

  _saveState() {
    this.undoStack.push(this.ctx.getImageData(0, 0, this.displaySize, this.displaySize));
    if (this.undoStack.length > this.maxUndo) {
      this.undoStack.shift();
    }
    this.redoStack = [];
  }

  _updatePreview() {
    if (this.onPreviewUpdate) this.onPreviewUpdate();
  }

  setTool(tool) {
    this.currentTool = tool;
  }

  setColor(color) {
    this.currentColor = color;
  }

  setMirrorMode(enabled) {
    this.mirrorMode = enabled;
  }

  setGridVisible(visible) {
    this.showGrid = visible;
    this._drawGrid();
  }

  setGridSize(size) {
    this.gridSize = size;
    this.pixelSize = this.displaySize / this.gridSize;
    this.clear(false);
    this._drawGrid();
    this.undoStack = [];
    this.redoStack = [];
  }

  clear(saveState = true) {
    if (saveState) this._saveState();
    this.ctx.clearRect(0, 0, this.displaySize, this.displaySize);
    this._updatePreview();
  }

  undo() {
    if (this.undoStack.length === 0) return;
    this.redoStack.push(this.ctx.getImageData(0, 0, this.displaySize, this.displaySize));
    this.ctx.putImageData(this.undoStack.pop(), 0, 0);
    this._updatePreview();
  }

  redo() {
    if (this.redoStack.length === 0) return;
    this.undoStack.push(this.ctx.getImageData(0, 0, this.displaySize, this.displaySize));
    this.ctx.putImageData(this.redoStack.pop(), 0, 0);
    this._updatePreview();
  }

  loadImageData(imageData) {
    this._saveState();
    this.ctx.clearRect(0, 0, this.displaySize, this.displaySize);
    // Scale the image data to fill canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    tempCanvas.getContext('2d').putImageData(imageData, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(tempCanvas, 0, 0, this.displaySize, this.displaySize);
    this._updatePreview();
  }

  getTextureData() {
    // Return a small canvas at actual texture resolution (16x16 or 32x32)
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = this.gridSize;
    textureCanvas.height = this.gridSize;
    const textureCtx = textureCanvas.getContext('2d');
    textureCtx.imageSmoothingEnabled = false;
    textureCtx.drawImage(this.canvas, 0, 0, this.gridSize, this.gridSize);
    return textureCanvas;
  }

  getDisplayImageData() {
    return this.ctx.getImageData(0, 0, this.displaySize, this.displaySize);
  }

  _flip(scaleX, scaleY, drawX, drawY) {
    this._saveState();
    const imgData = this.ctx.getImageData(0, 0, this.displaySize, this.displaySize);
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.displaySize;
    tempCanvas.height = this.displaySize;
    tempCanvas.getContext('2d').putImageData(imgData, 0, 0);
    this.ctx.clearRect(0, 0, this.displaySize, this.displaySize);
    this.ctx.save();
    this.ctx.scale(scaleX, scaleY);
    this.ctx.drawImage(tempCanvas, drawX, drawY);
    this.ctx.restore();
    this._updatePreview();
  }

  flipHorizontal() { this._flip(-1, 1, -this.displaySize, 0); }
  flipVertical() { this._flip(1, -1, 0, -this.displaySize); }
}
