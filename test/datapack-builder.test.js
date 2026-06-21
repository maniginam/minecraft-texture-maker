import { describe, it, expect } from 'vitest';
import {
  slugify,
  buildItemSoundsJson,
  buildVanillaSoundsJson,
  buildAttackAdvancement,
  buildAttackFunction,
  buildConsumeAdvancement,
  buildConsumeFunction,
  datapackMcmeta,
  resourceMcmeta,
} from '../js/datapack-builder.js';

describe('slugify', () => {
  it('lowercases and replaces non-alphanumerics with underscore', () => {
    expect(slugify('Sword Swing!')).toBe('sword_swing');
  });
  it('collapses repeats and trims edge underscores', () => {
    expect(slugify('  My --Cool-- Zap  ')).toBe('my_cool_zap');
  });
  it('falls back to a default when empty', () => {
    expect(slugify('!!!')).toBe('sound');
  });
});

describe('buildItemSoundsJson', () => {
  it('maps each event slug to a texturemaker-namespaced sound file', () => {
    const json = buildItemSoundsJson([{ event: 'sword_swing' }, { event: 'crunch' }]);
    expect(json).toEqual({
      sword_swing: { sounds: ['texturemaker:sword_swing'] },
      crunch: { sounds: ['texturemaker:crunch'] },
    });
  });
});

describe('buildVanillaSoundsJson', () => {
  it('overrides vanilla events with replace:true pointing at custom files', () => {
    const json = buildVanillaSoundsJson([
      { vanillaEvent: 'entity.player.levelup', soundName: 'my_levelup' },
    ]);
    expect(json).toEqual({
      'entity.player.levelup': { replace: true, sounds: ['my_levelup'] },
    });
  });
});

describe('buildAttackAdvancement', () => {
  it('fires on any player_hurt_entity and rewards the matching function', () => {
    const adv = buildAttackAdvancement('sword_swing');
    expect(adv.criteria.trigger.trigger).toBe('minecraft:player_hurt_entity');
    expect(adv.rewards.function).toBe('texturemaker:attack_sword_swing');
    expect(adv.display).toBeUndefined();
  });
});

describe('buildAttackFunction', () => {
  it('revokes then gates playsound on the held weapon type', () => {
    const lines = buildAttackFunction('minecraft:diamond_sword', 'sword_swing');
    expect(lines[0]).toBe('advancement revoke @s only texturemaker:attack_sword_swing');
    expect(lines[1]).toBe(
      'execute if items entity @s weapon.mainhand minecraft:diamond_sword run playsound texturemaker:sword_swing player @s ~ ~ ~ 1 1'
    );
  });
});

describe('buildConsumeAdvancement', () => {
  it('fires on consuming the chosen item', () => {
    const adv = buildConsumeAdvancement('minecraft:golden_apple', 'crunch');
    expect(adv.criteria.trigger.trigger).toBe('minecraft:consume_item');
    expect(adv.criteria.trigger.conditions.item.items).toEqual(['minecraft:golden_apple']);
    expect(adv.rewards.function).toBe('texturemaker:consume_crunch');
  });
});

describe('buildConsumeFunction', () => {
  it('revokes then plays unconditionally', () => {
    const lines = buildConsumeFunction('crunch');
    expect(lines).toEqual([
      'advancement revoke @s only texturemaker:consume_crunch',
      'playsound texturemaker:crunch player @s ~ ~ ~ 1 1',
    ]);
  });
});

describe('pack.mcmeta builders', () => {
  it('resource mcmeta carries pack_format 46 and a supported range', () => {
    const meta = resourceMcmeta('My Pack');
    expect(meta.pack.pack_format).toBe(46);
    expect(meta.pack.supported_formats.min_inclusive).toBe(46);
    expect(meta.pack.supported_formats.max_inclusive).toBeGreaterThanOrEqual(46);
    expect(meta.pack.description).toContain('My Pack');
  });
  it('datapack mcmeta carries pack_format 61 and a supported range', () => {
    const meta = datapackMcmeta('My Pack');
    expect(meta.pack.pack_format).toBe(61);
    expect(meta.pack.supported_formats.min_inclusive).toBe(61);
  });
});
