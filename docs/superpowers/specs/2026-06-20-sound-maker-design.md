# Sound Maker — Design

Date: 2026-06-20
Repo: minecraft-texture-maker (Cloudflare Pages, vanilla JS ES modules)

## Goal

Let kids attach custom sounds to weapons/items in their Minecraft Java resource
pack. Three sound sources: built-in presets, mic recording, and upload/drag-drop.
Output bundled into the same downloadable zip the app already produces.

## Background / constraints

- **Resource packs can only replace existing vanilla sound events.** They cannot
  bind a new sound to a brand-new item.
- **Custom-item sounds require a datapack** (advancement trigger + function +
  `/playsound`) plus a resource-pack-side custom item model.
- **Minecraft only plays OGG Vorbis audio.** Browser mic capture yields
  WebM/Opus; uploads are arbitrary formats. Everything must be re-encoded to OGG
  Vorbis client-side.
- App targets resource `pack_format` 46 (MC 1.21.4). Must work across
  1.21.4 → latest 1.21.x via `supported_formats` ranges in both `pack.mcmeta`
  files.

## Two delivery mechanisms (both auto-generated into one zip)

### 1. Custom-weapon sounds (datapack + resource pack)

The headline feature: "give my sword its own swing sound."

Kid picks: a base item (sword/axe/pickaxe/etc.), a texture they already drew
(reused from the pack), a trigger action, and a sound.

App generates:
- **Resource pack:**
  - `assets/minecraft/sounds.json` — registers a custom sound event
    (e.g. `texturemaker.sword_swing`) pointing at the `.ogg`.
  - `assets/minecraft/sounds/texturemaker/<name>.ogg` — the encoded audio.
  - Custom item model via `custom_model_data` overriding the base item, pointing
    at the kid's texture (extends existing item-model handling).
- **Datapack** (a separate pack — see Delivery structure below):
  - An **advancement** with the trigger and an item condition matching the
    custom item.
  - A **function** that runs `playsound` for the registered event at the player,
    then revokes + re-grants the advancement so it can fire again.
  - A `/give` command card shown in the UI so the kid can spawn the item.

**Reliable triggers only:**
- **Attack a mob (combat):** `minecraft:player_hurt_entity` advancement trigger.
- **Eat/drink (consume):** `minecraft:consume_item` advancement trigger.

Mining-a-specific-block and bow-release have no clean per-item advancement
trigger, so those are delivered as vanilla replacements (mechanism 2), not
custom-item triggers.

### 2. Vanilla sound replacement (resource pack only)

Reskin an existing game sound — works instantly, no commands. Covers everything
that is a vanilla sound *event*:
- Combat: `entity.player.attack.sweep`, attack hit variants, `item.shield.block`
- Tools/mining: block break sounds
- Ranged/misc: `entity.arrow.shoot`, `item.crossbow.shoot`, eating/drinking
- Fun/global: `entity.player.levelup`, `entity.experience_orb.pickup`,
  `entity.item.pickup`, `item.totem.use`

Kid picks the slot, supplies a sound, app writes
`assets/minecraft/sounds.json` entries that point the vanilla event name at the
new `.ogg` (with `"replace": true`).

## Sound sources (shared capture UI)

All three funnel into one pipeline: produce **Float32 PCM** → encode to OGG
Vorbis bytes.

- **Presets:** reuse the Web Audio oscillator engine already in `sounds.js`.
  Expand into a pickable library of fun effects (zap, boing, explosion, laser,
  etc.). Render offline via `OfflineAudioContext` → PCM.
- **Mic record:** `getUserMedia` + `MediaRecorder` (or Web Audio capture).
  Record / stop / preview controls. Decode captured blob → PCM.
- **Upload / drag-drop:** accept any audio file, `decodeAudioData` → PCM.

Each captured/selected sound is previewable before adding.

## Format pipeline (the hard part)

`Float32 PCM (one or two channels, sample rate) → OGG Vorbis bytes`

- Encoder: a **vendored WASM Vorbis encoder** committed into the repo (no CDN
  dependency). Loaded lazily on first encode.
- Mono downmix + resample acceptable; Minecraft positional audio prefers mono.
- Encoded bytes handed to the pack exporter as a Uint8Array/Blob.

## Delivery structure

A resource pack and a datapack are separate packs, each needing its own
`pack.mcmeta` at its own root. When a kid has only vanilla replacements or only
texture sounds, the download is a single resource-pack zip (unchanged behavior).
When custom-item sounds exist, the download is **one zip containing two clearly
named folders**, each independently installable:

```
<PackName>.zip
├── <PackName> Resource Pack/   (pack.mcmeta + assets/...)
├── <PackName> Datapack/        (pack.mcmeta + data/...)
└── HOW-TO-INSTALL.txt          (where each folder goes + /give commands)
```

`HOW-TO-INSTALL.txt` is a kid-readable card: resource pack → Options ▸ Resource
Packs (or `.minecraft/resourcepacks`), datapack → world's `datapacks/` folder,
plus the `/give` command(s) to copy.

## Module boundaries (new + changed files)

- **`js/sound-maker.js`** (new) — capture (preset/mic/upload), preview, and the
  PCM→OGG encode call. Public: `captureFromPreset(id)`, `captureFromMic()`,
  `captureFromFile(file)`, each resolving to `{ name, oggBytes, previewUrl }`.
  Depends on the encoder module and Web Audio. No DOM knowledge beyond the
  capture widgets it owns.
- **`js/ogg-encoder.js`** (new) — thin wrapper over the vendored WASM:
  `encodeToOgg(pcmChannels, sampleRate) → Uint8Array`. Single responsibility,
  swappable.
- **`js/datapack-builder.js`** (new) — pure functions that build the JSON for a
  custom-item sound: `buildAdvancement(trigger, itemId)`,
  `buildFunction(soundEvent)`, `buildSoundsJson(entries)`,
  `buildGiveCommand(item, modelData)`. No I/O, fully unit-testable.
- **`js/pack-exporter.js`** (changed) — accept sounds + datapack files; write
  `.ogg` files, `sounds.json`, and the `data/` datapack tree into the zip;
  emit `supported_formats` ranges in both `pack.mcmeta` files.
- **`js/presets-audio.js`** (new) — the preset effect definitions + offline
  render to PCM. Keeps `sounds.js` (UI feedback) untouched and focused.
- **`index.html` / `css/styles.css`** (changed) — a "Sounds" section/panel with
  the source tabs, preview, trigger/slot pickers, and the `/give` card.

## Data flow

1. Kid opens Sounds panel, picks a source → `sound-maker.js` produces PCM →
   `ogg-encoder.js` returns OGG bytes → preview.
2. Kid assigns the sound to either a custom item (trigger + base item + texture)
   or a vanilla slot.
3. `datapack-builder.js` produces the JSON for custom-item assignments.
4. On download, `pack-exporter.js` bundles textures + `.ogg` + `sounds.json` +
   datapack tree into the zip and writes both `pack.mcmeta` files.
5. UI shows the `/give` command(s) to copy.

## Error handling

- No mic permission → friendly toast, fall back to presets/upload.
- Unsupported/corrupt upload (`decodeAudioData` fails) → toast, reject.
- Encoder load/encode failure → toast, block adding that sound (don't ship a
  silent/broken pack).
- Empty sound list on download → existing "nothing to export" path still valid
  (textures may still export).
- Filenames/event ids sanitized to `[a-z0-9_]` to keep `sounds.json` valid.

## Testing (TDD, vitest + jsdom)

Pure logic gets real unit tests; Web Audio / WASM mocked.
- `datapack-builder` — advancement/function/sounds.json/give-command shape for
  each trigger; id sanitization; replace-vs-custom entries.
- `pack-exporter` — given fake sounds + datapack files, asserts the correct zip
  paths and both `pack.mcmeta` contents (mock JSZip).
- `presets-audio` — each preset renders non-silent PCM of expected length.
- `sound-maker` — source dispatch and the `{name, oggBytes, previewUrl}`
  contract, with encoder + Web Audio mocked.
- `ogg-encoder` — wrapper calls the WASM with correct args (encoder mocked);
  smoke-encode a short PCM buffer if feasible in jsdom.

## Out of scope (YAGNI)

- Per-item mining-action sounds (no reliable trigger).
- Sound looping / music discs / ambient layers.
- In-app waveform editing/trimming.
- Multi-version datapacks beyond a `supported_formats` range.
