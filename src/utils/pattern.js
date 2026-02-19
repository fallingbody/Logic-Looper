export function generatePattern(level = 1) {
    // 1. INFINITE DIMENSION FORMULA
    // Level 1-5: 3x3
    // Level 6-10: 4x4
    // Level 11-15: 5x5
    // Formula: Base 3 + 1 every 5 levels
    const size = 3 + Math.floor((level - 1) / 5);

    // 2. INFINITE TOUGHNESS (Tile Count)
    // L1: 3 tiles
    // L3: 4 tiles
    // L5: 5 tiles
    // Formula: Base 3 + 1 every 2 levels
    let tileCount = 3 + Math.floor((level - 1) / 2);

    // Safety Cap: Don't fill more than 70% of the board (impossible to memorize)
    const maxTiles = Math.floor((size * size) * 0.70);
    tileCount = Math.min(tileCount, maxTiles);

    // 3. GENERATE
    const totalCells = size * size;
    const patternSet = new Set();

    while (patternSet.size < tileCount) {
        const r = Math.floor(Math.random() * totalCells);
        patternSet.add(r);
    }

    return {
        size,
        targetPattern: Array.from(patternSet),
        level
    };
}