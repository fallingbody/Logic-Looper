export function generateSudoku(level = 1) {
    // --- 1. INFINITE DIMENSION FORMULA ---
    // Cycle increases every 5 levels (0, 1, 2...)
    const cycle = Math.floor((level - 1) / 5);

    // Base 4x4. 
    // Odd cycles (1,3,5...) add to Rows.
    // Even cycles (1,3,5...) add to Cols? No, we alternate.
    // Cycle 0 (L1-5):   4x4 (Base)
    // Cycle 1 (L6-10):  4x5 (Cols +1)
    // Cycle 2 (L11-15): 5x5 (Rows +1)
    // Cycle 3 (L16-20): 5x6 (Cols +1)

    const rows = 4 + Math.floor(cycle / 2);
    const cols = 4 + Math.ceil(cycle / 2);

    // The numbers to use (e.g., 1 to 5 for a 4x5 grid)
    const maxNum = Math.max(rows, cols);

    // --- 2. MISSING INPUTS (GRADUAL) ---
    // L1: 2 missing
    // L2: 3 missing
    // Slow growth: +1 missing every 2 levels
    // Cap at 60% of the board to prevent it being impossible
    const totalCells = rows * cols;
    const rawMissing = 2 + Math.floor((level - 1) / 2);
    const safeCap = Math.floor(totalCells * 0.6);
    const emptyCells = Math.min(rawMissing, safeCap);

    // --- 3. GENERATE LOGIC GRID (Latin Square) ---
    const board = Array.from({ length: rows }, () => Array(cols).fill(0));

    // Solve (Generate valid board)
    solveLatinSquare(board, rows, cols, maxNum);

    // Save Solution
    const solution = board.map(row => [...row]);

    // --- 4. CREATE PUZZLE ---
    const puzzle = board.map(row => [...row]);
    let attempts = emptyCells;
    let safety = 2000;

    while (attempts > 0 && safety > 0) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * cols);
        if (puzzle[r][c] !== 0) {
            puzzle[r][c] = 0;
            attempts--;
        }
        safety--;
    }

    return { initial: puzzle, solution, rows, cols, maxNum, level };
}

// --- RECTANGULAR SOLVER (Backtracking) ---
function solveLatinSquare(board, rows, cols, maxNum) {
    let r = -1, c = -1, isEmpty = false;

    // Find empty cell
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (board[i][j] === 0) { r = i; c = j; isEmpty = true; break; }
        }
        if (isEmpty) break;
    }

    if (!isEmpty) return true;

    // Try numbers 1 to maxNum (Randomized)
    const nums = Array.from({ length: maxNum }, (_, i) => i + 1).sort(() => Math.random() - 0.5);

    for (let num of nums) {
        if (isSafe(board, r, c, num, rows, cols)) {
            board[r][c] = num;
            if (solveLatinSquare(board, rows, cols, maxNum)) return true;
            board[r][c] = 0;
        }
    }
    return false;
}

function isSafe(board, r, c, num, rows, cols) {
    // Check Row
    for (let x = 0; x < cols; x++) if (board[r][x] === num) return false;
    // Check Col
    for (let x = 0; x < rows; x++) if (board[x][c] === num) return false;
    return true;
}