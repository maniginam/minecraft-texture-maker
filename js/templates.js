// Simple 16x16 pixel art templates for common Minecraft blocks
// Each template is a 16x16 array of hex colors (null = transparent)

const T = null; // transparent

export const TEMPLATES = {
  dirt: {
    name: 'Dirt',
    category: 'blocks',
    mcPath: 'assets/minecraft/textures/block/dirt.png',
    pixels: generateDirt(),
  },
  stone: {
    name: 'Stone',
    category: 'blocks',
    mcPath: 'assets/minecraft/textures/block/stone.png',
    pixels: generateStone(),
  },
  planks: {
    name: 'Planks',
    category: 'blocks',
    mcPath: 'assets/minecraft/textures/block/oak_planks.png',
    pixels: generatePlanks(),
  },
  cobblestone: {
    name: 'Cobble',
    category: 'blocks',
    mcPath: 'assets/minecraft/textures/block/cobblestone.png',
    pixels: generateCobblestone(),
  },
  sand: {
    name: 'Sand',
    category: 'blocks',
    mcPath: 'assets/minecraft/textures/block/sand.png',
    pixels: generateSand(),
  },
  glass: {
    name: 'Glass',
    category: 'blocks',
    mcPath: 'assets/minecraft/textures/block/glass.png',
    pixels: generateGlass(),
  },
  brick: {
    name: 'Bricks',
    category: 'blocks',
    mcPath: 'assets/minecraft/textures/block/bricks.png',
    pixels: generateBricks(),
  },
  tnt_side: {
    name: 'TNT',
    category: 'blocks',
    mcPath: 'assets/minecraft/textures/block/tnt_side.png',
    pixels: generateTNT(),
  },
  diamond_ore: {
    name: 'Diamond',
    category: 'blocks',
    mcPath: 'assets/minecraft/textures/block/diamond_ore.png',
    pixels: generateDiamondOre(),
  },
  pvp_sword_blue: {
    name: 'PvP Blue',
    category: 'items',
    mcPath: 'assets/minecraft/textures/item/diamond_sword.png',
    pixels: generatePvpSword('blue'),
  },
  pvp_sword_red: {
    name: 'PvP Red',
    category: 'items',
    mcPath: 'assets/minecraft/textures/item/diamond_sword.png',
    pixels: generatePvpSword('red'),
  },
  pvp_sword_purple: {
    name: 'PvP Purple',
    category: 'items',
    mcPath: 'assets/minecraft/textures/item/netherite_sword.png',
    pixels: generatePvpSword('purple'),
  },
  diamond_sword: {
    name: 'Sword',
    category: 'items',
    mcPath: 'assets/minecraft/textures/item/diamond_sword.png',
    pixels: generateSword('#2CB8C5', '#5DECF5'),
  },
  diamond_pickaxe: {
    name: 'Pickaxe',
    category: 'items',
    mcPath: 'assets/minecraft/textures/item/diamond_pickaxe.png',
    pixels: generatePickaxe('#2CB8C5', '#5DECF5'),
  },
  diamond_axe: {
    name: 'Axe',
    category: 'items',
    mcPath: 'assets/minecraft/textures/item/diamond_axe.png',
    pixels: generateAxe('#2CB8C5', '#5DECF5'),
  },
  bow: {
    name: 'Bow',
    category: 'items',
    mcPath: 'assets/minecraft/textures/item/bow.png',
    pixels: generateBow(),
  },
  arrow: {
    name: 'Arrow',
    category: 'items',
    mcPath: 'assets/minecraft/textures/item/arrow.png',
    pixels: generateArrow(),
  },
  trident: {
    name: 'Trident',
    category: 'items',
    mcPath: 'assets/minecraft/textures/item/trident.png',
    pixels: generateTrident(),
  },
  blank: {
    name: 'Blank',
    category: 'blocks',
    mcPath: null,
    pixels: generateBlank(),
  },
};

// Texture target options for the resource pack
export const TEXTURE_TARGETS = [
  { value: 'block/dirt', label: 'Dirt' },
  { value: 'block/stone', label: 'Stone' },
  { value: 'block/oak_planks', label: 'Oak Planks' },
  { value: 'block/cobblestone', label: 'Cobblestone' },
  { value: 'block/sand', label: 'Sand' },
  { value: 'block/glass', label: 'Glass' },
  { value: 'block/bricks', label: 'Bricks' },
  { value: 'block/tnt_side', label: 'TNT Side' },
  { value: 'block/diamond_ore', label: 'Diamond Ore' },
  { value: 'block/gold_ore', label: 'Gold Ore' },
  { value: 'block/iron_ore', label: 'Iron Ore' },
  { value: 'block/coal_ore', label: 'Coal Ore' },
  { value: 'block/grass_block_top', label: 'Grass Top' },
  { value: 'block/grass_block_side', label: 'Grass Side' },
  { value: 'block/oak_log', label: 'Oak Log Side' },
  { value: 'block/oak_log_top', label: 'Oak Log Top' },
  { value: 'block/oak_leaves', label: 'Oak Leaves' },
  { value: 'block/netherrack', label: 'Netherrack' },
  { value: 'block/obsidian', label: 'Obsidian' },
  { value: 'block/glowstone', label: 'Glowstone' },
  { value: 'block/bookshelf', label: 'Bookshelf' },
  { value: 'block/crafting_table_top', label: 'Crafting Table Top' },
  { value: 'block/furnace_front', label: 'Furnace Front' },
  { value: 'block/ice', label: 'Ice' },
  { value: 'block/snow', label: 'Snow' },
  // --- Swords ---
  { value: 'item/wooden_sword', label: 'Wooden Sword' },
  { value: 'item/stone_sword', label: 'Stone Sword' },
  { value: 'item/iron_sword', label: 'Iron Sword' },
  { value: 'item/golden_sword', label: 'Gold Sword' },
  { value: 'item/diamond_sword', label: 'Diamond Sword' },
  { value: 'item/netherite_sword', label: 'Netherite Sword' },
  // --- Pickaxes ---
  { value: 'item/wooden_pickaxe', label: 'Wooden Pickaxe' },
  { value: 'item/stone_pickaxe', label: 'Stone Pickaxe' },
  { value: 'item/iron_pickaxe', label: 'Iron Pickaxe' },
  { value: 'item/golden_pickaxe', label: 'Gold Pickaxe' },
  { value: 'item/diamond_pickaxe', label: 'Diamond Pickaxe' },
  { value: 'item/netherite_pickaxe', label: 'Netherite Pickaxe' },
  // --- Axes ---
  { value: 'item/wooden_axe', label: 'Wooden Axe' },
  { value: 'item/stone_axe', label: 'Stone Axe' },
  { value: 'item/iron_axe', label: 'Iron Axe' },
  { value: 'item/golden_axe', label: 'Gold Axe' },
  { value: 'item/diamond_axe', label: 'Diamond Axe' },
  { value: 'item/netherite_axe', label: 'Netherite Axe' },
  // --- Shovels ---
  { value: 'item/wooden_shovel', label: 'Wooden Shovel' },
  { value: 'item/stone_shovel', label: 'Stone Shovel' },
  { value: 'item/iron_shovel', label: 'Iron Shovel' },
  { value: 'item/diamond_shovel', label: 'Diamond Shovel' },
  { value: 'item/netherite_shovel', label: 'Netherite Shovel' },
  // --- Ranged ---
  { value: 'item/bow', label: 'Bow' },
  { value: 'item/crossbow_standby', label: 'Crossbow' },
  { value: 'item/arrow', label: 'Arrow' },
  { value: 'item/trident', label: 'Trident' },
  // --- Armor ---
  { value: 'item/diamond_helmet', label: 'Diamond Helmet' },
  { value: 'item/diamond_chestplate', label: 'Diamond Chestplate' },
  { value: 'item/diamond_leggings', label: 'Diamond Leggings' },
  { value: 'item/diamond_boots', label: 'Diamond Boots' },
  { value: 'item/netherite_helmet', label: 'Netherite Helmet' },
  { value: 'item/netherite_chestplate', label: 'Netherite Chestplate' },
  { value: 'item/netherite_leggings', label: 'Netherite Leggings' },
  { value: 'item/netherite_boots', label: 'Netherite Boots' },
  { value: 'item/shield_base', label: 'Shield' },
  // --- Food & Items ---
  { value: 'item/apple', label: 'Apple' },
  { value: 'item/golden_apple', label: 'Golden Apple' },
  { value: 'item/ender_pearl', label: 'Ender Pearl' },
  { value: 'item/diamond', label: 'Diamond (Item)' },
  { value: 'item/emerald', label: 'Emerald (Item)' },
];

function fill16(color) {
  return Array(16).fill(null).map(() => Array(16).fill(color));
}

function generateBlank() {
  return fill16(null);
}

function generateDirt() {
  const base = '#8B6914';
  const dark = '#6B4423';
  const light = '#A07830';
  const grid = fill16(base);
  // Add noise
  const noisePositions = [
    [0,2],[0,9],[1,5],[1,12],[2,1],[2,7],[2,14],[3,3],[3,10],
    [4,0],[4,6],[4,13],[5,4],[5,8],[5,15],[6,2],[6,11],
    [7,1],[7,7],[7,14],[8,5],[8,9],[9,0],[9,3],[9,12],
    [10,6],[10,10],[10,15],[11,2],[11,8],[11,13],
    [12,0],[12,5],[12,11],[13,3],[13,7],[13,14],
    [14,1],[14,9],[14,12],[15,4],[15,8],[15,15]
  ];
  noisePositions.forEach(([y, x], i) => {
    grid[y][x] = i % 3 === 0 ? dark : light;
  });
  return grid;
}

function generateStone() {
  const base = '#808080';
  const dark = '#666666';
  const light = '#999999';
  const grid = fill16(base);
  const noisePositions = [
    [0,1],[0,5],[0,10],[0,14],[1,3],[1,8],[1,12],
    [2,0],[2,6],[2,11],[2,15],[3,4],[3,9],[3,13],
    [4,2],[4,7],[4,14],[5,0],[5,5],[5,10],[5,15],
    [6,3],[6,8],[6,12],[7,1],[7,6],[7,11],[7,14],
    [8,4],[8,9],[8,13],[9,0],[9,7],[9,15],
    [10,2],[10,5],[10,10],[10,14],[11,3],[11,8],[11,12],
    [12,1],[12,6],[12,11],[12,15],[13,4],[13,9],[13,13],
    [14,0],[14,7],[14,12],[15,2],[15,5],[15,10],[15,14]
  ];
  noisePositions.forEach(([y, x], i) => {
    grid[y][x] = i % 2 === 0 ? dark : light;
  });
  return grid;
}

function generatePlanks() {
  const base = '#B8945A';
  const dark = '#9B7A42';
  const line = '#A0823E';
  const grid = fill16(base);
  // Horizontal plank lines
  [3, 7, 11, 15].forEach(y => {
    for (let x = 0; x < 16; x++) grid[y][x] = dark;
  });
  // Vertical grain lines
  [4, 12].forEach(x => {
    for (let y = 0; y < 16; y++) {
      if (grid[y][x] !== dark) grid[y][x] = line;
    }
  });
  return grid;
}

function generateCobblestone() {
  const base = '#7A7A7A';
  const dark = '#5A5A5A';
  const light = '#999999';
  const grid = fill16(base);
  // Create stone-like pattern with outlines
  const outlines = [
    // Top-left stone
    [0,0],[0,1],[0,2],[0,3],[1,0],[2,0],[2,1],[2,2],[2,3],[1,3],
    // Top-right area
    [0,5],[0,6],[0,7],[0,8],[0,9],[1,9],[2,9],[2,5],[2,6],[2,7],[2,8],
    // Middle stones
    [4,0],[4,1],[4,2],[5,2],[6,2],[6,0],[6,1],
    [4,4],[4,5],[4,6],[4,7],[5,7],[6,7],[6,4],[6,5],[6,6],
    [8,0],[8,1],[8,2],[8,3],[9,3],[10,3],[10,0],[10,1],[10,2],
  ];
  outlines.forEach(([y, x]) => { if (y < 16 && x < 16) grid[y][x] = dark; });
  // Light spots
  [[1,1],[1,6],[5,1],[5,5],[9,1],[9,6],[13,3],[13,10]].forEach(([y,x]) => {
    if (y < 16 && x < 16) grid[y][x] = light;
  });
  return grid;
}

function generateSand() {
  const base = '#DEB887';
  const dark = '#C4A44A';
  const light = '#F0D9A0';
  const grid = fill16(base);
  const noisePositions = [
    [0,3],[0,8],[0,13],[1,1],[1,6],[1,11],[1,15],
    [2,4],[2,9],[2,14],[3,0],[3,7],[3,12],
    [4,2],[4,5],[4,10],[5,3],[5,8],[5,13],
    [6,1],[6,6],[6,11],[6,15],[7,4],[7,9],[7,14],
    [8,0],[8,7],[8,12],[9,2],[9,5],[9,10],
    [10,3],[10,8],[10,13],[11,1],[11,6],[11,11],
    [12,4],[12,9],[12,14],[13,0],[13,7],[13,12],
    [14,2],[14,5],[14,10],[15,3],[15,8],[15,13]
  ];
  noisePositions.forEach(([y, x], i) => {
    grid[y][x] = i % 3 === 0 ? dark : light;
  });
  return grid;
}

function generateGlass() {
  const grid = fill16(null);
  const border = '#C8DFF0';
  const highlight = '#FFFFFF';
  // Border
  for (let i = 0; i < 16; i++) {
    grid[0][i] = border;
    grid[15][i] = border;
    grid[i][0] = border;
    grid[i][15] = border;
  }
  // Highlight streak
  grid[1][1] = highlight;
  grid[2][1] = highlight;
  grid[1][2] = highlight;
  return grid;
}

function generateBricks() {
  const brick = '#9B4A2C';
  const mortar = '#BCAC9C';
  const dark = '#7A3820';
  const grid = fill16(brick);
  // Mortar lines (horizontal)
  [0, 4, 8, 12].forEach(y => {
    for (let x = 0; x < 16; x++) grid[y][x] = mortar;
  });
  // Vertical mortar (offset pattern)
  for (let y = 1; y <= 3; y++) grid[y][7] = mortar;
  for (let y = 5; y <= 7; y++) grid[y][15] = mortar;
  for (let y = 9; y <= 11; y++) grid[y][7] = mortar;
  for (let y = 13; y <= 15; y++) grid[y][15] = mortar;
  // Dark spots on bricks
  [[2,3],[2,11],[6,5],[6,13],[10,2],[10,10],[14,4],[14,12]].forEach(([y,x]) => {
    grid[y][x] = dark;
  });
  return grid;
}

function generateTNT() {
  const red = '#CC2200';
  const darkRed = '#991100';
  const white = '#EEEEEE';
  const gray = '#CCCCCC';
  const grid = fill16(red);
  // Top/bottom dark bands
  for (let x = 0; x < 16; x++) {
    grid[0][x] = darkRed;
    grid[1][x] = darkRed;
    grid[14][x] = darkRed;
    grid[15][x] = darkRed;
  }
  // White label band
  for (let y = 5; y <= 10; y++) {
    for (let x = 2; x <= 13; x++) {
      grid[y][x] = white;
    }
  }
  // TNT letters (simplified)
  // T
  for (let x = 3; x <= 5; x++) grid[6][x] = darkRed;
  grid[7][4] = darkRed; grid[8][4] = darkRed; grid[9][4] = darkRed;
  // N
  grid[6][7] = darkRed; grid[7][7] = darkRed; grid[8][7] = darkRed; grid[9][7] = darkRed;
  grid[6][8] = darkRed;
  grid[7][9] = darkRed;
  grid[6][10] = darkRed; grid[7][10] = darkRed; grid[8][10] = darkRed; grid[9][10] = darkRed;
  // T
  for (let x = 11; x <= 13; x++) grid[6][x] = darkRed;
  grid[7][12] = darkRed; grid[8][12] = darkRed; grid[9][12] = darkRed;

  return grid;
}

function generateDiamondOre() {
  const stone = '#808080';
  const dark = '#666666';
  const diamond = '#5DECF5';
  const diamondDark = '#2CB8C5';
  const grid = fill16(stone);
  // Stone noise
  [[0,2],[1,5],[2,10],[3,1],[4,8],[5,14],[6,3],[7,11],[8,6],[9,0],[10,13],[11,7],[12,2],[13,9],[14,5],[15,11]]
    .forEach(([y,x]) => { grid[y][x] = dark; });
  // Diamond gems
  const gems = [[3,4],[3,5],[4,3],[4,4],[4,5],[5,4],
                 [9,10],[9,11],[10,9],[10,10],[10,11],[11,10],
                 [6,12],[6,13],[7,12]];
  gems.forEach(([y, x]) => {
    grid[y][x] = diamond;
  });
  [[4,3],[10,9],[7,12]].forEach(([y,x]) => {
    grid[y][x] = diamondDark;
  });
  return grid;
}

function generatePvpSword(style) {
  const grid = fill16(null);
  const palettes = {
    blue: {
      blade: ['#0033AA', '#1155CC', '#2277EE', '#44AAFF', '#77CCFF', '#AAEEFF'],
      handle: ['#9988CC', '#BBAADD', '#DDCCEE', '#FFFFFF'],
      pommel: ['#0033AA', '#1155CC'],
    },
    red: {
      blade: ['#0044AA', '#1166DD', '#3399FF', '#55BBFF', '#88DDFF', '#BBFFFF'],
      handle: ['#881111', '#CC2222', '#DD4444', '#FF6633'],
      pommel: ['#0044AA', '#1166DD'],
    },
    purple: {
      blade: ['#CCBBDD', '#DDCCEE', '#EEDDFF', '#FFFFFF', '#EEDDFF', '#DDCCEE'],
      handle: ['#111111', '#222222', '#333333', '#CC44CC'],
      pommel: ['#AA33AA', '#CC44CC'],
    },
  };
  const p = palettes[style];
  // Blade — 3px wide diagonal, checkerboard shading
  // Rows 0-7: blade going from top-right to center
  const bladePixels = [
    // [row, cols[]]  — 3 pixels wide
    [0, [13, 14]],
    [1, [12, 13, 14]],
    [2, [11, 12, 13]],
    [3, [10, 11, 12]],
    [4, [9, 10, 11]],
    [5, [8, 9, 10]],
    [6, [7, 8, 9]],
    [7, [6, 7, 8]],
  ];
  bladePixels.forEach(([row, cols], ri) => {
    cols.forEach((col, ci) => {
      // Checkerboard: alternate colors based on (row+col) parity
      const idx = (ri + ci) % 2 === 0 ? ri % p.blade.length : (ri + 1) % p.blade.length;
      grid[row][col] = p.blade[idx];
    });
  });
  // Guard — crosspiece perpendicular to blade, 3px tall
  // Left side
  grid[7][4] = p.handle[0]; grid[7][5] = p.handle[1];
  grid[8][4] = p.handle[1]; grid[8][5] = p.handle[2];
  grid[8][6] = p.handle[0]; grid[8][7] = p.handle[1];
  grid[8][8] = p.handle[2]; grid[8][9] = p.handle[0];
  grid[9][6] = p.handle[0]; grid[9][7] = p.handle[1];
  // Handle — 2px wide diagonal
  grid[9][5] = p.handle[2]; grid[10][4] = p.handle[3];
  grid[10][5] = p.handle[1]; grid[11][3] = p.handle[2];
  grid[11][4] = p.handle[0]; grid[12][3] = p.handle[1];
  // Pommel
  grid[13][1] = p.pommel[0]; grid[13][2] = p.pommel[1];
  grid[12][2] = p.pommel[0]; grid[14][1] = p.pommel[1];
  return grid;
}

function generateSword(dark, light) {
  const grid = fill16(null);
  const handle = '#6B4423';
  const handleLight = '#8B6914';
  const guard = '#555555';
  const guardLight = '#888888';
  // Blade — 2px wide diagonal for visibility
  // Right edge (light)
  grid[1][13] = light;
  grid[2][12] = light;
  grid[3][11] = light;
  grid[4][10] = light;
  grid[5][9] = light;
  grid[6][8] = light;
  grid[7][7] = light;
  // Left edge (dark)
  grid[2][13] = dark;
  grid[3][12] = dark;
  grid[4][11] = dark;
  grid[5][10] = dark;
  grid[6][9] = dark;
  grid[7][8] = dark;
  // Tip
  grid[0][14] = light;
  grid[1][14] = dark;
  // Guard (crosspiece perpendicular to blade)
  grid[8][5] = guardLight;
  grid[8][6] = guard;
  grid[8][7] = guard;
  grid[8][8] = guardLight;
  // Handle
  grid[9][6] = handleLight;
  grid[10][5] = handleLight;
  grid[11][4] = handle;
  grid[12][3] = handle;
  // Pommel
  grid[13][2] = guardLight;
  return grid;
}

function generatePickaxe(dark, light) {
  const grid = fill16(null);
  const handle = '#6B4423';
  const handleLight = '#8B6914';
  // Stick (diagonal)
  grid[14][1] = handle;
  grid[13][2] = handle;
  grid[12][3] = handleLight;
  grid[11][4] = handleLight;
  grid[10][5] = handleLight;
  grid[9][6] = handleLight;
  grid[8][7] = handleLight;
  grid[7][8] = handleLight;
  grid[6][9] = handleLight;
  // Pickaxe head — two pointed ends going top-left and bottom-right
  // The head sits perpendicular to the stick at the top
  // Top-left point
  grid[3][6] = light;
  grid[4][7] = dark;
  grid[2][5] = light;
  grid[1][4] = light;
  // Center block where stick meets head
  grid[5][8] = dark;
  grid[5][9] = dark;
  grid[5][10] = dark;
  grid[4][8] = light;
  grid[4][9] = light;
  grid[4][10] = light;
  grid[3][7] = light;
  grid[3][8] = light;
  grid[3][9] = dark;
  // Bottom-right point
  grid[4][11] = light;
  grid[5][11] = dark;
  grid[6][12] = light;
  grid[7][13] = light;
  return grid;
}

function generateAxe(dark, light) {
  const grid = fill16(null);
  const handle = '#6B4423';
  const handleLight = '#8B6914';
  // Stick (diagonal)
  grid[14][1] = handle;
  grid[13][2] = handle;
  grid[12][3] = handleLight;
  grid[11][4] = handleLight;
  grid[10][5] = handleLight;
  grid[9][6] = handleLight;
  grid[8][7] = handleLight;
  grid[7][8] = handleLight;
  grid[6][9] = handleLight;
  // Axe head — chunky blade on one side of stick top
  // Blade edge (curved)
  grid[2][10] = light;
  grid[2][11] = light;
  grid[3][12] = light;
  grid[4][12] = light;
  grid[4][13] = light;
  grid[5][13] = light;
  grid[6][13] = dark;
  grid[6][12] = dark;
  grid[7][11] = dark;
  // Blade fill
  grid[3][10] = light;
  grid[3][11] = dark;
  grid[4][10] = light;
  grid[4][11] = dark;
  grid[5][10] = dark;
  grid[5][11] = dark;
  grid[5][12] = dark;
  grid[6][10] = dark;
  grid[6][11] = dark;
  // Connect to stick
  grid[5][9] = dark;
  grid[4][9] = light;
  grid[3][9] = light;
  return grid;
}

function generateBow() {
  const grid = fill16(null);
  const wood = '#6B4423';
  const woodLight = '#8B6914';
  const string = '#AAAAAA';
  // Bow limb — curved arc, right side
  grid[1][9] = wood;
  grid[2][10] = wood;
  grid[3][11] = woodLight;
  grid[4][11] = woodLight;
  grid[5][12] = woodLight;
  grid[6][12] = woodLight;
  grid[7][12] = woodLight;
  grid[8][12] = woodLight;
  grid[9][11] = woodLight;
  grid[10][11] = woodLight;
  grid[11][10] = wood;
  grid[12][9] = wood;
  // Bowstring — straight line connecting tips
  grid[1][9] = wood;
  grid[2][8] = string;
  grid[3][8] = string;
  grid[4][7] = string;
  grid[5][7] = string;
  grid[6][7] = string;
  grid[7][7] = string;
  grid[8][7] = string;
  grid[9][7] = string;
  grid[10][8] = string;
  grid[11][8] = string;
  grid[12][9] = wood;
  return grid;
}

function generateArrow() {
  const grid = fill16(null);
  const shaft = '#8B6914';
  const shaftDark = '#6B4423';
  const tip = '#777777';
  const tipLight = '#AAAAAA';
  const feather = '#EEEEEE';
  const featherGray = '#CCCCCC';
  // Shaft — straight diagonal
  grid[3][12] = shaft;
  grid[4][11] = shaft;
  grid[5][10] = shaft;
  grid[6][9] = shaft;
  grid[7][8] = shaft;
  grid[8][7] = shaft;
  grid[9][6] = shaft;
  grid[10][5] = shaftDark;
  grid[11][4] = shaftDark;
  // Arrowhead — triangle at top-right
  grid[1][14] = tipLight;
  grid[2][13] = tip;
  grid[2][14] = tipLight;
  grid[3][13] = tip;
  // Fletching — feathers at bottom-left
  grid[12][3] = feather;
  grid[11][3] = featherGray;
  grid[12][4] = featherGray;
  grid[13][2] = feather;
  grid[13][3] = featherGray;
  return grid;
}

function generateTrident() {
  const grid = fill16(null);
  const shaft = '#1A5276';
  const shaftLight = '#2471A3';
  const prong = '#2E86C1';
  const prongTip = '#5DADE2';
  // Shaft — straight vertical center
  grid[14][7] = shaft;
  grid[13][7] = shaft;
  grid[12][7] = shaft;
  grid[11][7] = shaftLight;
  grid[10][7] = shaftLight;
  grid[9][7] = shaftLight;
  grid[8][7] = shaftLight;
  grid[7][7] = shaftLight;
  grid[6][7] = prong;
  grid[5][7] = prong;
  // Center prong
  grid[4][7] = prong;
  grid[3][7] = prong;
  grid[2][7] = prongTip;
  // Left prong
  grid[5][5] = prong;
  grid[4][5] = prong;
  grid[3][5] = prong;
  grid[2][5] = prongTip;
  grid[5][6] = prong;
  // Right prong
  grid[5][9] = prong;
  grid[4][9] = prong;
  grid[3][9] = prong;
  grid[2][9] = prongTip;
  grid[5][8] = prong;
  // Crossbar connecting prongs
  grid[6][5] = shaft;
  grid[6][6] = shaft;
  grid[6][8] = shaft;
  grid[6][9] = shaft;
  return grid;
}

export function templateToImageData(template) {
  const size = template.pixels.length;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const color = template.pixels[y][x];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  return ctx.getImageData(0, 0, size, size);
}

export function templateToScaledImageData(template, targetSize) {
  const size = template.pixels.length;
  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const pxSize = targetSize / size;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const color = template.pixels[y][x];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * pxSize, y * pxSize, pxSize, pxSize);
      }
    }
  }
  return ctx.getImageData(0, 0, targetSize, targetSize);
}
