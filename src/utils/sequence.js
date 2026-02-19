export function generateSequence(level = 1) {
    let sequence = [];
    let answer = 0;
    let type = "";

    // 1. DETERMINE DIFFICULTY TIER
    // Tier 0: L1-5 (Add)
    // Tier 1: L6-10 (Multiply)
    // Tier 2: L11-15 (Squares)
    // Tier 3: L16+ (Complex)
    const tier = Math.floor((level - 1) / 5);

    const length = 5; // Display 4, Ask for 5th

    // Scale starting number by level (L1=2, L10=20, L100=200)
    const start = Math.floor(Math.random() * (level * 2)) + 1;

    // --- GENERATOR LOGIC ---

    if (tier === 0) {
        // LINEAR (Addition)
        type = "LINEAR";
        const step = Math.floor(Math.random() * 5) + 1 + Math.floor(level / 2);
        for (let i = 0; i < length; i++) sequence.push(start + (i * step));
    }
    else if (tier === 1) {
        // GEOMETRIC (Multiplication)
        type = "GEOMETRIC";
        const mult = Math.floor(Math.random() * 2) + 2; // *2 or *3
        // Keep start small for multiplication to avoid massive numbers
        let curr = Math.min(start, 5);
        for (let i = 0; i < length; i++) {
            sequence.push(curr);
            curr *= mult;
        }
    }
    else if (tier === 2) {
        // POWER (Squares)
        type = "EXPONENTIAL";
        // x^2 or x^2 + 1
        const offset = Math.floor(Math.random() * 3);
        for (let i = 0; i < length; i++) {
            sequence.push(Math.pow(start + i, 2) + offset);
        }
    }
    else {
        // COMPLEX (Fibonacci or Alternating)
        if (level % 2 === 0) {
            type = "FIBONACCI";
            let a = start, b = start + 1;
            sequence.push(a, b);
            for (let i = 2; i < length; i++) {
                let next = a + b;
                sequence.push(next);
                a = b; b = next;
            }
        } else {
            type = "ALTERNATING";
            // +2, +4, +6... (Increasing Step)
            let curr = start;
            let step = 2;
            for (let i = 0; i < length; i++) {
                sequence.push(curr);
                curr += step;
                step += 2;
            }
        }
    }

    answer = sequence.pop(); // Remove last one for the user to guess

    return { sequence, answer, type, level };
}