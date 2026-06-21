import { describe, it, expect, beforeEach } from 'vitest';
import { PackExporter } from '../js/pack-exporter.js';

function planMap(plan) {
  const m = {};
  for (const f of plan.files) m[f.path] = f;
  return m;
}
function jsonAt(plan, path) {
  return JSON.parse(planMap(plan)[path].value);
}

describe('PackExporter._buildFilePlan', () => {
  let exporter;
  const fakeCanvas = { width: 16, height: 16 };
  beforeEach(() => {
    exporter = new PackExporter();
  });

  it('textures-only: pack.mcmeta + texture png at zip root, no datapack', () => {
    exporter.addTexture('Diamond Sword', 'item/diamond_sword', fakeCanvas);
    const plan = exporter._buildFilePlan('My Pack');
    expect(plan.hasDatapack).toBe(false);
    const m = planMap(plan);
    expect(m['pack.mcmeta']).toBeTruthy();
    expect(jsonAt(plan, 'pack.mcmeta').pack.pack_format).toBe(46);
    expect(m['assets/minecraft/textures/item/diamond_sword.png'].type).toBe('png');
    expect(m['assets/minecraft/textures/item/diamond_sword.png'].canvas).toBe(fakeCanvas);
    expect(plan.files.some((f) => f.type === 'fire-sweep')).toBe(true);
  });

  it('vanilla sound replacement stays in the resource pack at root', () => {
    exporter.addSound({ slug: 'my_levelup', kind: 'vanilla', vanillaEvent: 'entity.player.levelup', oggBlob: 'OGG' });
    const plan = exporter._buildFilePlan('My Pack');
    expect(plan.hasDatapack).toBe(false);
    const sounds = jsonAt(plan, 'assets/minecraft/sounds.json');
    expect(sounds['entity.player.levelup']).toEqual({ replace: true, sounds: ['my_levelup'] });
    const ogg = planMap(plan)['assets/minecraft/sounds/my_levelup.ogg'];
    expect(ogg.type).toBe('ogg');
    expect(ogg.value).toBe('OGG');
  });

  it('attack item sound produces a two-folder layout with datapack + readme', () => {
    exporter.addSound({ slug: 'sword_swing', label: 'Sword Swing', kind: 'item', trigger: 'attack', itemId: 'minecraft:diamond_sword', oggBlob: 'OGG' });
    const plan = exporter._buildFilePlan('My Pack');
    expect(plan.hasDatapack).toBe(true);
    const m = planMap(plan);

    // Resource pack nested under its own folder, with its own pack.mcmeta.
    expect(jsonAt(plan, 'My Pack Resource Pack/pack.mcmeta').pack.pack_format).toBe(46);
    expect(jsonAt(plan, 'My Pack Resource Pack/assets/texturemaker/sounds.json').sword_swing)
      .toEqual({ sounds: ['texturemaker:sword_swing'] });
    expect(m['My Pack Resource Pack/assets/texturemaker/sounds/sword_swing.ogg'].value).toBe('OGG');

    // Datapack with its own pack.mcmeta, advancement + function.
    expect(jsonAt(plan, 'My Pack Datapack/pack.mcmeta').pack.pack_format).toBe(61);
    const adv = jsonAt(plan, 'My Pack Datapack/data/texturemaker/advancement/attack_sword_swing.json');
    expect(adv.criteria.trigger.trigger).toBe('minecraft:player_hurt_entity');
    const fn = m['My Pack Datapack/data/texturemaker/function/attack_sword_swing.mcfunction'];
    expect(fn.type).toBe('text');
    expect(fn.value).toContain('weapon.mainhand minecraft:diamond_sword');

    expect(m['HOW-TO-INSTALL.txt']).toBeTruthy();
  });

  it('consume item sound uses the consume advancement + function', () => {
    exporter.addSound({ slug: 'crunch', label: 'Crunch', kind: 'item', trigger: 'consume', itemId: 'minecraft:golden_apple', oggBlob: 'OGG' });
    const plan = exporter._buildFilePlan('My Pack');
    const adv = jsonAt(plan, 'My Pack Datapack/data/texturemaker/advancement/consume_crunch.json');
    expect(adv.criteria.trigger.trigger).toBe('minecraft:consume_item');
    expect(adv.criteria.trigger.conditions.item.items).toEqual(['minecraft:golden_apple']);
    const fn = planMap(plan)['My Pack Datapack/data/texturemaker/function/consume_crunch.mcfunction'];
    expect(fn.value).toContain('playsound texturemaker:crunch');
  });

  it('textures move under the resource folder when a datapack is present', () => {
    exporter.addTexture('Diamond Sword', 'item/diamond_sword', fakeCanvas);
    exporter.addSound({ slug: 'sword_swing', kind: 'item', trigger: 'attack', itemId: 'minecraft:diamond_sword', oggBlob: 'OGG' });
    const plan = exporter._buildFilePlan('My Pack');
    const m = planMap(plan);
    expect(m['My Pack Resource Pack/assets/minecraft/textures/item/diamond_sword.png']).toBeTruthy();
    expect(m['assets/minecraft/textures/item/diamond_sword.png']).toBeUndefined();
  });

  it('rejects an empty pack', () => {
    expect(() => exporter._buildFilePlan('My Pack')).toThrow();
  });
});
