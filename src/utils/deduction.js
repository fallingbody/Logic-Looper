// src/utils/deduction.js

// --- DATABASE EXPANSION (12x12) ---
const NAMES = [
    'Alice', 'Bob', 'Charlie', 'Dave', 'Eve', 'Frank',
    'Grace', 'Hank', 'Ivy', 'Jack', 'Karen', 'Leo'
];

const ITEMS = [
    'Book', 'Key', 'Ring', 'Phone', 'Watch', 'Tablet',
    'Camera', 'Wallet', 'Laptop', 'Badge', 'Map', 'File'
];

const LOCATIONS = [
    'the library', 'the break room', 'the warehouse', 'sector 7',
    'the archives', 'the underground lab', 'the rooftop', 'the lobby'
];

// --- COMPLEX GRAMMAR TEMPLATES ---

// Type 1: Simple Negative (Level 1-3)
const SIMPLE_NEGATIVES = [
    (p, o) => `${p} did not have the ${o}.`,
    (p, o) => `The ${o} was not found on ${p}.`,
    (p, o) => `Search of ${p} revealed no ${o}.`,
    (p, o) => `${p} denied having the ${o}.`
];

// Type 2: The "Alibi" (Level 4-6) - Adds fluff text to distract
const ALIBI_NEGATIVES = [
    (p, o) => `Since ${p} was seen at ${getRandomLoc()}, they could not have retrieved the ${o}.`,
    (p, o) => `Forensics found traces of ${p} at ${getRandomLoc()}, proving they were nowhere near the ${o}.`,
    (p, o) => `Despite the rumors, ${p}'s security clearance would not allow them to take the ${o}.`,
    (p, o) => `Surveillance footage confirms ${p} left the building empty-handed, sans the ${o}.`
];

// Type 3: "Double Subject" (Level 7+) - Groups 2 people clearing 1 item
// Logic: A != X AND B != X
const DOUBLE_SUBJECT_NEGATIVES = [
    (p1, p2, o) => `Neither ${p1} nor ${p2} were in possession of the ${o}.`,
    (p1, p2, o) => `The ${o} was missing from both ${p1}'s and ${p2}'s lockers.`,
    (p1, p2, o) => `Both ${p1} and ${p2} were cleared of holding the ${o} after a thorough search.`,
    (p1, p2, o) => `Investigation cleared suspects ${p1} and ${p2} regarding the missing ${o}.`
];

// Type 4: "Double Object" (Level 7+) - Groups 1 person clearing 2 items
// Logic: A != X AND A != Y
const DOUBLE_OBJECT_NEGATIVES = [
    (p, o1, o2) => `${p} was found to be carrying neither the ${o1} nor the ${o2}.`,
    (p, o1, o2) => `We can rule out ${p} for both the ${o1} and the ${o2}.`,
    (p, o1, o2) => `The search of ${p} yielded negative results for the ${o1}, as well as the ${o2}.`
];

function getRandomLoc() {
    return LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
}

export function generateDeduction(level = 1) {
    // 1. DYNAMIC DIFFICULTY SCALING
    let size = 3; // Tutorial
    if (level > 2) size = 4;
    if (level > 5) size = 5;
    if (level > 10) size = 6; // Expert
    if (level > 20) size = 8; // Mastermind

    // Cap size at max available
    size = Math.min(size, NAMES.length);

    const people = NAMES.slice(0, size);
    const objects = ITEMS.slice(0, size);

    // 2. RANDOMIZE SOLUTION
    const shuffledObjects = [...objects].sort(() => Math.random() - 0.5);
    const solution = {};
    people.forEach((p, i) => solution[p] = shuffledObjects[i]);

    // 3. GENERATE RAW LOGIC FACTS
    // Returns array like: [{type:'neq', p:'Alice', o:'Key'}, ...]
    const constraints = generateConstraints(people, objects, solution, level);

    // 4. GENERATE NARRATIVE (Textifier)
    const story = buildAdvancedNarrative(constraints, level);

    return { people, objects, story, solution, level };
}

// --- NARRATIVE ENGINE ---

function buildAdvancedNarrative(constraints, level) {
    let sentences = [];
    let pool = [...constraints]; // Copy of constraints to process

    // HEADER
    const headers = [
        "INCIDENT REPORT #992-A:",
        "DETECTIVE'S LOG - 04:00 AM:",
        "WITNESS TESTIMONY TRANSCRIPT:",
        "EVIDENCE ANALYSIS SUMMARY:"
    ];
    let text = headers[Math.floor(Math.random() * headers.length)] + "\n\n";

    // While we have logical facts to write...
    while (pool.length > 0) {

        // STRATEGY: Try to group facts for higher levels
        const fact = pool.pop();

        if (fact.type === 'eq') {
            // Positive Clue (Rare/Tutorial)
            sentences.push(`CONFIRMED: ${fact.p} was definitely holding the ${fact.o}.`);
            continue;
        }

        // COMPLEXITY: Try to merge with another fact
        if (level >= 5 && pool.length > 0 && Math.random() > 0.4) {

            // Attempt 1: Same Item, Different Person (Neither A nor B has X)
            const sameItemIdx = pool.findIndex(f => f.o === fact.o && f.type === 'neq');
            if (sameItemIdx !== -1) {
                const other = pool.splice(sameItemIdx, 1)[0]; // Remove from pool
                const tpl = DOUBLE_SUBJECT_NEGATIVES[Math.floor(Math.random() * DOUBLE_SUBJECT_NEGATIVES.length)];
                sentences.push(tpl(fact.p, other.p, fact.o));
                continue;
            }

            // Attempt 2: Same Person, Different Item (A has neither X nor Y)
            const samePersonIdx = pool.findIndex(f => f.p === fact.p && f.type === 'neq');
            if (samePersonIdx !== -1) {
                const other = pool.splice(samePersonIdx, 1)[0];
                const tpl = DOUBLE_OBJECT_NEGATIVES[Math.floor(Math.random() * DOUBLE_OBJECT_NEGATIVES.length)];
                sentences.push(tpl(fact.p, fact.o, other.o));
                continue;
            }
        }

        // FALLBACK: Single Sentence
        if (level >= 4) {
            // Use Alibi / Fluff text
            const tpl = ALIBI_NEGATIVES[Math.floor(Math.random() * ALIBI_NEGATIVES.length)];
            sentences.push(tpl(fact.p, fact.o));
        } else {
            // Simple text
            const tpl = SIMPLE_NEGATIVES[Math.floor(Math.random() * SIMPLE_NEGATIVES.length)];
            sentences.push(tpl(fact.p, fact.o));
        }
    }

    // Shuffle sentences so the story isn't linear
    sentences.sort(() => Math.random() - 0.5);

    return text + sentences.join(" ");
}

// --- LOGIC SOLVER ENGINE (Unchanged but robust) ---
function generateConstraints(people, objects, solution, level) {
    const constraints = [];
    const grid = {};
    people.forEach(p => {
        grid[p] = {};
        objects.forEach(o => grid[p][o] = true);
    });

    const isSolved = () => people.every(p => objects.filter(o => grid[p][o]).length === 1);

    const propagateLogic = () => {
        let changed = false;
        // Row Logic
        people.forEach(p => {
            const possible = objects.filter(o => grid[p][o]);
            if (possible.length === 1) {
                const item = possible[0];
                people.forEach(other => {
                    if (p !== other && grid[other][item]) {
                        grid[other][item] = false;
                        changed = true;
                    }
                });
            }
        });
        // Col Logic
        objects.forEach(o => {
            const owners = people.filter(p => grid[p][o]);
            if (owners.length === 1) {
                const owner = owners[0];
                objects.forEach(other => {
                    if (o !== other && grid[owner][other]) {
                        grid[owner][other] = false;
                        changed = true;
                    }
                });
            }
        });
        if (changed) propagateLogic();
    };

    // Level 1: One freebie
    if (level === 1) {
        const p = people[0];
        const o = solution[p];
        constraints.push({ type: 'eq', p, o });
        objects.forEach(obj => { if (obj !== o) grid[p][obj] = false; });
        people.forEach(person => { if (person !== p) grid[person][o] = false; });
        propagateLogic();
    }

    let safety = 0;
    while (!isSolved() && safety < 150) { // Increased safety limit for larger grids
        safety++;
        const candidates = [];
        people.forEach(p => objects.forEach(o => {
            if (grid[p][o] && solution[p] !== o) candidates.push({ p, o });
        }));

        if (candidates.length === 0) break;
        const target = candidates[Math.floor(Math.random() * candidates.length)];

        constraints.push({ type: 'neq', p: target.p, o: target.o });
        grid[target.p][target.o] = false;
        propagateLogic();
    }

    return constraints;
}