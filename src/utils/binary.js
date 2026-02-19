const GATES_BASIC = ['AND', 'OR'];
const GATES_TRICKY = ['AND', 'OR', 'XOR'];
const GATES_HARDCORE = ['AND', 'OR', 'XOR', 'NAND', 'NOR'];

const BLUEPRINTS = {
    HALF_ADDER: {
        type: 'custom',
        name: 'Half Adder',
        inputs: ['A', 'B'],
        outputs: ['Sum', 'Carry'],
        evaluate: (inputs) => ({
            Sum: inputs.A ^ inputs.B,
            Carry: inputs.A & inputs.B
        })
    },
    FULL_ADDER: {
        type: 'custom',
        name: 'Full Adder',
        inputs: ['A', 'B', 'Cin'],
        outputs: ['Sum', 'Cout'],
        evaluate: (inputs) => {
            const a_xor_b = inputs.A ^ inputs.B;
            return {
                Sum: a_xor_b ^ inputs.Cin,
                Cout: (a_xor_b & inputs.Cin) | (inputs.A & inputs.B)
            };
        }
    }
};

export function generateCircuit(level = 1) {
    if (level <= 40) {
        let allowedGates = GATES_BASIC;
        let depth = 2;

        if (level === 1) {
            depth = 2;
            allowedGates = GATES_BASIC;
        } else if (level <= 3) {
            depth = 3;
            allowedGates = GATES_TRICKY;
        } else if (level <= 6) {
            depth = 3;
            allowedGates = GATES_HARDCORE;
        } else {
            depth = 4;
            allowedGates = GATES_HARDCORE;
        }

        let circuit, inputs, isValid;
        let attempts = 0;

        do {
            circuit = buildTree(depth, allowedGates);
            inputs = getInputs(circuit);
            isValid = false;

            const zeroState = {};
            inputs.forEach(inp => zeroState[inp.id] = 0);
            const autoFinishes = evaluateCircuit(circuit, zeroState) === 1;

            if (!autoFinishes) {
                const totalCombos = 1 << inputs.length;
                for (let i = 1; i < totalCombos; i++) {
                    const testState = {};
                    inputs.forEach((inp, idx) => {
                        testState[inp.id] = (i >> idx) & 1;
                    });
                    if (evaluateCircuit(circuit, testState) === 1) {
                        isValid = true;
                        break;
                    }
                }
            }
            attempts++;
        } while (!isValid && attempts < 100);

        if (!isValid) {
            circuit = { type: 'GATE', op: 'AND', left: { type: 'INPUT', id: 'A' }, right: { type: 'INPUT', id: 'B' } };
            inputs = [{ type: 'INPUT', id: 'A' }, { type: 'INPUT', id: 'B' }];
        }

        return { type: 'tree', circuit, inputs, depth, level };
    }

    if (level === 41) return { ...BLUEPRINTS.HALF_ADDER, level };
    if (level === 42) return { ...BLUEPRINTS.FULL_ADDER, level };

    return generateCircuit(40);
}

function buildTree(currentDepth, allowedGates) {
    if (currentDepth === 0 || Math.random() < 0.05) {
        return { type: 'INPUT', id: Math.random().toString(36).substr(2, 5) };
    }

    let op = allowedGates[Math.floor(Math.random() * allowedGates.length)];

    return {
        type: 'GATE',
        op: op,
        left: buildTree(currentDepth - 1, allowedGates),
        right: buildTree(currentDepth - 1, allowedGates),
        id: Math.random().toString(36).substr(2, 5)
    };
}

function getInputs(node, list = []) {
    if (node.type === 'INPUT') {
        if (!list.find(i => i.id === node.id)) list.push(node);
    } else {
        getInputs(node.left, list);
        getInputs(node.right, list);
    }
    return list;
}

export function evaluateCircuit(node, inputValues) {
    if (node.type === 'INPUT') return inputValues[node.id] || 0;

    const valL = evaluateCircuit(node.left, inputValues);
    const valR = evaluateCircuit(node.right, inputValues);

    switch (node.op) {
        case 'AND': return valL & valR;
        case 'OR': return valL | valR;
        case 'XOR': return valL ^ valR;
        case 'NAND': return (valL & valR) ? 0 : 1;
        case 'NOR': return (valL | valR) ? 0 : 1;
        default: return 0;
    }
}