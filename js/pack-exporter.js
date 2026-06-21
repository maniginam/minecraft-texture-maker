import { getFireSweepFrames } from './fire-sweep.js';
import {
  slugify,
  buildItemSoundsJson,
  buildVanillaSoundsJson,
  buildAttackAdvancement,
  buildAttackFunction,
  buildConsumeAdvancement,
  buildConsumeFunction,
  resourceMcmeta,
  datapackMcmeta,
} from './datapack-builder.js';

export class PackExporter {
  constructor() {
    this.textures = [];
    this.sounds = [];
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

  // sound = { slug, label, oggBlob, kind: 'item' | 'vanilla',
  //   vanillaEvent?, trigger?: 'attack'|'consume', itemId? }
  addSound(sound) {
    this.sounds.push({ ...sound, slug: slugify(sound.slug) });
  }

  removeSound(index) {
    this.sounds.splice(index, 1);
  }

  getSounds() {
    return this.sounds;
  }

  clear() {
    this.textures = [];
    this.sounds = [];
  }

  _itemSounds() {
    return this.sounds.filter((s) => s.kind === 'item');
  }
  _vanillaSounds() {
    return this.sounds.filter((s) => s.kind === 'vanilla');
  }

  // Pure-ish build of the zip contents. Returns { hasDatapack, files: [...] }
  // where each file is { path, type: 'json'|'text'|'ogg'|'png'|'fire-sweep', ... }.
  // No canvas conversion or zipping happens here, so it is unit-testable.
  _buildFilePlan(packName) {
    if (this.textures.length === 0 && this.sounds.length === 0) {
      throw new Error('Add a texture or a sound first!');
    }
    const safeName = packName.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'My Texture Pack';
    const itemSounds = this._itemSounds();
    const hasDatapack = itemSounds.length > 0;
    const rp = hasDatapack ? `${safeName} Resource Pack/` : '';
    const files = [];
    const json = (path, value) => files.push({ path, type: 'json', value: JSON.stringify(value, null, 2) });
    const text = (path, value) => files.push({ path, type: 'text', value });

    // ----- Resource pack -----
    json(`${rp}pack.mcmeta`, resourceMcmeta(safeName));

    for (const tex of this.textures) {
      files.push({ path: `${rp}assets/minecraft/textures/${tex.targetPath}.png`, type: 'png', canvas: tex.canvas });
    }
    files.push({ path: `${rp}assets/minecraft/textures`, type: 'fire-sweep' });

    const vanilla = this._vanillaSounds();
    if (vanilla.length) {
      json(`${rp}assets/minecraft/sounds.json`, buildVanillaSoundsJson(
        vanilla.map((s) => ({ vanillaEvent: s.vanillaEvent, soundName: s.slug }))
      ));
      for (const s of vanilla) {
        files.push({ path: `${rp}assets/minecraft/sounds/${s.slug}.ogg`, type: 'ogg', value: s.oggBlob });
      }
    }

    if (itemSounds.length) {
      json(`${rp}assets/texturemaker/sounds.json`, buildItemSoundsJson(
        itemSounds.map((s) => ({ event: s.slug }))
      ));
      for (const s of itemSounds) {
        files.push({ path: `${rp}assets/texturemaker/sounds/${s.slug}.ogg`, type: 'ogg', value: s.oggBlob });
      }
    }

    // ----- Datapack -----
    if (hasDatapack) {
      const dp = `${safeName} Datapack/`;
      json(`${dp}pack.mcmeta`, datapackMcmeta(safeName));
      for (const s of itemSounds) {
        if (s.trigger === 'consume') {
          json(`${dp}data/texturemaker/advancement/consume_${s.slug}.json`, buildConsumeAdvancement(s.itemId, s.slug));
          text(`${dp}data/texturemaker/function/consume_${s.slug}.mcfunction`, buildConsumeFunction(s.slug).join('\n') + '\n');
        } else {
          json(`${dp}data/texturemaker/advancement/attack_${s.slug}.json`, buildAttackAdvancement(s.slug));
          text(`${dp}data/texturemaker/function/attack_${s.slug}.mcfunction`, buildAttackFunction(s.itemId, s.slug).join('\n') + '\n');
        }
      }
      text('HOW-TO-INSTALL.txt', this._installReadme(safeName, itemSounds));
    }

    return { hasDatapack, files };
  }

  _installReadme(safeName, itemSounds) {
    const lines = [
      `${safeName} — How to install`,
      '',
      'This zip has TWO folders. After you unzip it:',
      '',
      `1. "${safeName} Resource Pack"`,
      '   - Put this folder in your .minecraft/resourcepacks folder.',
      '   - In Minecraft: Options > Resource Packs > turn it on.',
      '',
      `2. "${safeName} Datapack"`,
      '   - Put this folder in your world\'s "datapacks" folder',
      '     (saves/<your world>/datapacks).',
      '   - It makes your sounds play. Reload with /reload or rejoin the world.',
      '',
      'Your custom sounds:',
    ];
    for (const s of itemSounds) {
      const how = s.trigger === 'consume'
        ? `eat/drink a ${s.itemId.replace('minecraft:', '')}`
        : `hit a mob with a ${s.itemId.replace('minecraft:', '')}`;
      lines.push(`  - "${s.label || s.slug}" plays when you ${how}.`);
    }
    return lines.join('\n') + '\n';
  }

  async exportPack(packName) {
    if (typeof JSZip === 'undefined') {
      throw new Error('JSZip not loaded');
    }
    const plan = this._buildFilePlan(packName);
    const safeName = packName.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'My Texture Pack';
    const zip = new JSZip();

    for (const file of plan.files) {
      if (file.type === 'json' || file.type === 'text') {
        zip.file(file.path, file.value);
      } else if (file.type === 'ogg') {
        zip.file(file.path, file.value);
      } else if (file.type === 'png') {
        zip.file(file.path, await this._canvasToPngBlob(file.canvas));
      } else if (file.type === 'fire-sweep') {
        for (const frame of getFireSweepFrames()) {
          zip.file(`${file.path}/${frame.path}.png`, await this._canvasToPngBlob(frame.canvas));
        }
      }
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    this._downloadBlob(blob, safeName + '.zip');
  }

  _canvasToPngBlob(canvas) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        blob.arrayBuffer().then((buf) => resolve(buf));
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
