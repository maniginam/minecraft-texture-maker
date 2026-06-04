export class PackExporter {
  constructor() {
    this.textures = [];
  }

  addTexture(name, targetPath, canvasElement) {
    this.textures.push({ name, targetPath, canvas: canvasElement });
  }

  removeTexture(index) {
    this.textures.splice(index, 1);
  }

  getTextures() {
    return this.textures;
  }

  clear() {
    this.textures = [];
  }

  async exportPack(packName) {
    if (typeof JSZip === 'undefined') {
      throw new Error('JSZip not loaded');
    }
    if (this.textures.length === 0) {
      throw new Error('No textures in pack');
    }

    const zip = new JSZip();
    const safeName = packName.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'My Texture Pack';

    // pack.mcmeta - required for Java Edition
    zip.file('pack.mcmeta', JSON.stringify({
      pack: {
        pack_format: 46,
        description: safeName + ' - Made with Texture Maker!'
      }
    }, null, 2));

    // Add each texture as PNG
    for (const texture of this.textures) {
      const pngData = await this._canvasToPngBlob(texture.canvas);
      const path = `assets/minecraft/textures/${texture.targetPath}.png`;
      zip.file(path, pngData);
    }

    // Generate and download
    const blob = await zip.generateAsync({ type: 'blob' });
    this._downloadBlob(blob, safeName + '.zip');
  }

  _canvasToPngBlob(canvas) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        blob.arrayBuffer().then(buf => resolve(buf));
      }, 'image/png');
    });
  }

  _downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
