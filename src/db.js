import Dexie from 'dexie';

export const localDB = new Dexie('LogicLooper_Local');

// If you have issues, Open DevTools -> Application -> Clear Site Data
localDB.version(2).stores({
    profile: 'uid, nickname, points',

    // 1. STANDARD GAMES (Sudoku, Pattern, etc.)
    // Primary Key is 'gameId' so it updates in place (No duplicates!)
    progress: 'gameId, level, date',

    // 2. DAILY HISTORY
    // Primary Key is 'date' so we can track every day you played
    history: 'date, gameId, level'
});

// Helper to wipe DB if needed (call from console)
export const resetDB = async () => {
    await localDB.delete();
    window.location.reload();
};