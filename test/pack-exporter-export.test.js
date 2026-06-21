// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Fire sweep generates real canvases; stub it so exportPack is testable in node.
vi.mock('../js/fire-sweep.js', () => ({
  getFireSweepFrames: () => [{
    canvas: { toBlob: (cb) => cb({ arrayBuffer: async () => new ArrayBuffer(4) }) },
    path: 'particle/sweep_0',
  }],
}));

import { PackExporter } from '../js/pack-exporter.js';

function fakeCanvas() {
  return { width: 16, height: 16, toBlob: (cb) => cb({ arrayBuffer: async () => new ArrayBuffer(4) }) };
}

describe('PackExporter.exportPack writes the full plan into the zip', () => {
  let written;
  beforeEach(() => {
    written = {};
    globalThis.JSZip = class {
      file(path, content) { written[path] = content; }
      async generateAsync() { return { __zip: true }; }
    };
    // _downloadBlob touches DOM/URL; stub it out.
    vi.spyOn(PackExporter.prototype, '_downloadBlob').mockImplementation(() => {});
  });

  it('writes datapack json, mcfunction text, the real ogg blob, textures, and fire sweep', async () => {
    const ex = new PackExporter();
    ex.addTexture('Sword', 'item/diamond_sword', fakeCanvas());
    const ogg = { size: 4151 };
    ex.addSound({ slug: 'zap', label: 'Zap', oggBlob: ogg, kind: 'item', trigger: 'attack', itemId: 'minecraft:diamond_sword', triggerLabel: 'Sword swing' });
    ex.addSound({ slug: 'lvl', label: 'LevelUp', oggBlob: ogg, kind: 'vanilla', vanillaEvent: 'entity.player.levelup' });

    await ex.exportPack('My Pack');
    const paths = Object.keys(written);

    expect(paths).toContain('My Pack Resource Pack/pack.mcmeta');
    expect(paths).toContain('My Pack Datapack/pack.mcmeta');
    expect(paths).toContain('My Pack Datapack/data/texturemaker/advancement/attack_zap.json');
    expect(paths).toContain('My Pack Datapack/data/texturemaker/function/attack_zap.mcfunction');
    expect(paths).toContain('My Pack Resource Pack/assets/texturemaker/sounds/zap.ogg');
    expect(paths).toContain('My Pack Resource Pack/assets/minecraft/sounds/lvl.ogg');
    expect(paths).toContain('My Pack Resource Pack/assets/minecraft/textures/item/diamond_sword.png');
    expect(paths).toContain('My Pack Resource Pack/assets/minecraft/textures/particle/sweep_0.png');
    expect(paths).toContain('HOW-TO-INSTALL.txt');

    // The real ogg blob object is what gets written, not a stringified copy.
    expect(written['My Pack Resource Pack/assets/texturemaker/sounds/zap.ogg']).toBe(ogg);
    // mcfunction carries the weapon gate.
    expect(written['My Pack Datapack/data/texturemaker/function/attack_zap.mcfunction'])
      .toContain('weapon.mainhand minecraft:diamond_sword');
  });
});
