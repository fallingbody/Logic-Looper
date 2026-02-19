// A simple Seeded RNG (Linear Congruential Generator)
function mulberry32(a) {
    return function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Convert string "2023-10-24" into a number seed
function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return (h1 ^ h2 ^ h3 ^ h4) >>> 0;
}

export function getDailyPuzzle() {
    const today = new Date().toISOString().split('T')[0];
    const seed = cyrb128(today);
    const rng = mulberry32(seed);

    // 1. Pick a Game Type (0 to 4)
    const games = ['sudoku', 'pattern', 'sequence', 'binary', 'deduct'];
    const gameIdx = Math.floor(rng() * games.length);

    // 2. Pick a Difficulty Level (10 to 50 for daily)
    const level = 10 + Math.floor(rng() * 40);

    return {
        gameId: games[gameIdx],
        level: level,
        date: today,
        seed: seed // Pass this to game generators if needed for deeper consistency
    };
}