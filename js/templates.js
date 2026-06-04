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
  { value: 'item/diamond_sword', label: 'Diamond Sword' },
  { value: 'item/diamond_pickaxe', label: 'Diamond Pickaxe' },
  { value: 'item/apple', label: 'Apple' },
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
