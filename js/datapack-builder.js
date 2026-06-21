// Pure builders for the custom-sound datapack + resource-pack sounds.json.
// No I/O — every function returns a plain object or array of command lines.

const NS = 'texturemaker';

// Resource pack_format 46 = MC 1.21.4; datapack pack_format 61 = MC 1.21.4.
// supported_formats ranges let one pack load across 1.21.4 -> latest 1.21.x.
const RESOURCE_FORMAT = 46;
const RESOURCE_MAX = 99;
const DATAPACK_FORMAT = 61;
const DATAPACK_MAX = 99;

export function slugify(name) {
  const s = String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return s || 'sound';
}

export function buildItemSoundsJson(entries) {
  const json = {};
  for (const { event } of entries) {
    json[event] = { sounds: [`${NS}:${event}`] };
  }
  return json;
}

export function buildVanillaSoundsJson(entries) {
  const json = {};
  for (const { vanillaEvent, soundName } of entries) {
    json[vanillaEvent] = { replace: true, sounds: [soundName] };
  }
  return json;
}

export function buildAttackAdvancement(soundSlug) {
  return {
    criteria: {
      trigger: { trigger: 'minecraft:player_hurt_entity' },
    },
    rewards: { function: `${NS}:attack_${soundSlug}` },
  };
}

export function buildAttackFunction(itemId, soundSlug) {
  return [
    `advancement revoke @s only ${NS}:attack_${soundSlug}`,
    `execute if items entity @s weapon.mainhand ${itemId} run playsound ${NS}:${soundSlug} player @s ~ ~ ~ 1 1`,
  ];
}

export function buildConsumeAdvancement(itemId, soundSlug) {
  return {
    criteria: {
      trigger: {
        trigger: 'minecraft:consume_item',
        conditions: { item: { items: [itemId] } },
      },
    },
    rewards: { function: `${NS}:consume_${soundSlug}` },
  };
}

export function buildConsumeFunction(soundSlug) {
  return [
    `advancement revoke @s only ${NS}:consume_${soundSlug}`,
    `playsound ${NS}:${soundSlug} player @s ~ ~ ~ 1 1`,
  ];
}

export function resourceMcmeta(packName) {
  return {
    pack: {
      pack_format: RESOURCE_FORMAT,
      supported_formats: { min_inclusive: RESOURCE_FORMAT, max_inclusive: RESOURCE_MAX },
      description: `${packName} - Made with Texture Maker!`,
    },
  };
}

export function datapackMcmeta(packName) {
  return {
    pack: {
      pack_format: DATAPACK_FORMAT,
      supported_formats: { min_inclusive: DATAPACK_FORMAT, max_inclusive: DATAPACK_MAX },
      description: `${packName} sounds - Made with Texture Maker!`,
    },
  };
}
