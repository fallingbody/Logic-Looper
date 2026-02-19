import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { generateCircuit, evaluateCircuit } from '../../utils/binary';

export default function BinaryLogic({ onComplete, initialLevel = 1 }) {
    const [level, setLevel] = useState(initialLevel);
    const [data, setData] = useState(null);
    const [inputState, setInputState] = useState({});
    const [output, setOutput] = useState(0);
    const [scale, setScale] = useState(1);

    // --- DRAG TO PAN STATE ---
    const scrollRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);

    // --- GAME INITIALIZATION ---
    useEffect(() => {
        setLevel(initialLevel);
        const newData = generateCircuit(initialLevel);
        setData(newData);

        if (newData.depth >= 4) setScale(0.7);
        else if (newData.depth === 3) setScale(0.85);
        else setScale(1);

        let initialInputs = {};
        let isSafe = false;
        let attempts = 0;

        while (!isSafe && attempts < 20) {
            initialInputs = {};
            newData.inputs.forEach(inp => {
                initialInputs[inp.id] = Math.floor(Math.random() * 2);
            });
            const currentResult = evaluateCircuit(newData.circuit, initialInputs);
            if (currentResult === 0) isSafe = true;
            attempts++;
        }

        if (!isSafe) newData.inputs.forEach(inp => initialInputs[inp.id] = 0);
        setInputState(initialInputs);

        // Reset scroll position on new level
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = (scrollRef.current.scrollWidth - scrollRef.current.clientWidth) / 2;
        }
    }, [initialLevel]);

    // --- WIN CHECK ---
    useEffect(() => {
        if (!data) return;
        const res = evaluateCircuit(data.circuit, inputState);
        setOutput(res);

        if (res === 1) {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.3 } });
            setTimeout(() => {
                if (onComplete) onComplete(true);
            }, 1200);
        }
    }, [inputState, data, onComplete]);

    const toggleInput = (id) => {
        setInputState(prev => ({ ...prev, [id]: prev[id] ? 0 : 1 }));
    };

    // --- MOUSE DRAG HANDLERS ---
    const onMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setStartY(e.pageY - scrollRef.current.offsetTop);
        setScrollLeft(scrollRef.current.scrollLeft);
        setScrollTop(scrollRef.current.scrollTop);
    };
    const onMouseLeave = () => setIsDragging(false);
    const onMouseUp = () => setIsDragging(false);
    const onMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const y = e.pageY - scrollRef.current.offsetTop;
        scrollRef.current.scrollLeft = scrollLeft - (x - startX);
        scrollRef.current.scrollTop = scrollTop - (y - startY);
    };

    if (!data) return <div className="text-cyan-500 font-mono animate-pulse text-center mt-20">GENERATING CIRCUIT...</div>;

    return (
        <div className="flex flex-col items-center w-full h-screen max-h-screen overflow-hidden bg-slate-950 p-4 select-none">

            {/* HEADER HUD */}
            <div className="flex justify-between items-end w-full max-w-6xl border-b border-cyan-900/30 pb-4 mb-4 shrink-0 z-50">
                <div>
                    <h2 className="text-3xl font-bold text-cyan-400 tracking-tighter uppercase">Circuit Solver</h2>
                    <p className="text-[10px] text-cyan-700 font-mono mt-1 uppercase tracking-widest">
                        Level {level} • Depth {data.depth}
                    </p>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="flex gap-1">
                        <button onClick={() => setScale(s => Math.max(0.4, s - 0.1))} className="px-3 py-1 bg-slate-900 border border-slate-700 rounded text-slate-400 hover:text-white transition-colors">-</button>
                        <span className="px-2 py-1 text-slate-500 text-[10px] font-mono self-center uppercase">Zoom</span>
                        <button onClick={() => setScale(s => Math.min(1.5, s + 0.1))} className="px-3 py-1 bg-slate-900 border border-slate-700 rounded text-slate-400 hover:text-white transition-colors">+</button>
                    </div>

                    <div className={`px-4 py-1 rounded border font-mono font-bold text-sm transition-all duration-500 ${output ? 'border-yellow-500 text-yellow-400 bg-yellow-900/20 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'border-slate-800 text-slate-700'}`}>
                        {output ? '⚡ POWER ACTIVE' : '⛔ POWER OFFLINE'}
                    </div>
                </div>
            </div>

            {/* CIRCUIT BOARD CONTAINER */}
            <div className="relative w-full flex-1 bg-slate-900/50 rounded-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">

                {/* Grid Background */}
                <div className="absolute inset-0 opacity-5 pointer-events-none z-0"
                    style={{
                        backgroundImage: `linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)`,
                        backgroundSize: '30px 30px'
                    }}>
                </div>

                {/* Interactive Area (FIXED FOR OVERFLOW AND DRAGGING) */}
                <div
                    ref={scrollRef}
                    onMouseDown={onMouseDown}
                    onMouseLeave={onMouseLeave}
                    onMouseUp={onMouseUp}
                    onMouseMove={onMouseMove}
                    className={`flex-1 overflow-auto p-12 relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                >
                    <div
                        className="w-max mx-auto min-h-full flex flex-col items-center transition-transform duration-300 origin-top pt-10 pb-32 px-32"
                        style={{ transform: `scale(${scale})` }}
                    >
                        {/* Final Output Bulb */}
                        <div className="relative z-20 mb-4">
                            <OutputNode value={output} />
                        </div>

                        {/* Recursive Gate Tree */}
                        <GateNode node={data.circuit} inputState={inputState} onToggle={toggleInput} isRoot={true} />
                    </div>
                </div>

            </div>

            <div className="mt-4 text-center text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em] shrink-0">
                Configure Inputs to activate the main output • Click and drag to pan
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS (Unchanged, provided for completeness) ---

function OutputNode({ value }) {
    return (
        <div className="relative flex flex-col items-center">
            <motion.div
                animate={{ scale: value ? 1.1 : 1, boxShadow: value ? "0 0 50px #facc15" : "none" }}
                className={`
                    w-16 h-16 rounded-lg flex items-center justify-center text-xl font-bold border-4 transition-all duration-500 z-20 relative
                    ${value
                        ? 'bg-yellow-400 border-white text-black'
                        : 'bg-slate-950 border-slate-800 text-slate-800'}
                `}
            >
                {value ? 'ON' : 'OFF'}
            </motion.div>
        </div>
    );
}

function GateNode({ node, inputState, onToggle, isRoot }) {
    const wireHeight = 40;

    if (node.type === 'INPUT') {
        const val = inputState[node.id] || 0;
        return (
            <div className="flex flex-col items-center relative">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the pan drag
                        onToggle(node.id);
                    }}
                    className={`
                        w-12 h-12 rounded border-2 flex items-center justify-center font-bold text-lg transition-all relative z-10 cursor-pointer
                        ${val
                            ? 'bg-cyan-600 border-cyan-300 text-white shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                            : 'bg-slate-950 border-slate-800 text-slate-700 hover:border-slate-600'}
                    `}
                >
                    {val}
                </motion.button>
            </div>
        );
    }

    const val = evaluateCircuit(node, inputState);
    const valL = evaluateCircuit(node.left, inputState);
    const valR = evaluateCircuit(node.right, inputState);

    return (
        <div className="flex flex-col items-center relative min-w-[120px]">
            <div className={`w-1 h-6 transition-colors duration-300 ${val ? 'bg-yellow-400 shadow-[0_0_10px_#facc15]' : 'bg-slate-800'}`} />

            <div className={`
                relative z-10 px-4 py-2 rounded border-2 font-mono font-bold text-xs tracking-widest uppercase flex flex-col items-center justify-center min-w-[70px] bg-slate-950
                ${val
                    ? 'border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'border-slate-800 text-slate-800'}
            `}>
                {node.op}
            </div>

            <div className="flex items-start justify-center gap-8 relative w-full">
                <svg className="absolute top-0 left-0 w-full pointer-events-none overflow-visible z-0" style={{ height: wireHeight }}>
                    <path
                        d={`M 50% 0 V ${wireHeight / 2} H 25% V ${wireHeight}`}
                        fill="none"
                        stroke={valL ? '#facc15' : '#1e293b'}
                        strokeWidth="3"
                        className="transition-colors duration-300"
                    />
                    <path
                        d={`M 50% 0 V ${wireHeight / 2} H 75% V ${wireHeight}`}
                        fill="none"
                        stroke={valR ? '#facc15' : '#1e293b'}
                        strokeWidth="3"
                        className="transition-colors duration-300"
                    />
                </svg>

                <div className="w-1/2 flex justify-center" style={{ paddingTop: wireHeight }}>
                    <GateNode node={node.left} inputState={inputState} onToggle={onToggle} />
                </div>
                <div className="w-1/2 flex justify-center" style={{ paddingTop: wireHeight }}>
                    <GateNode node={node.right} inputState={inputState} onToggle={onToggle} />
                </div>
            </div>
        </div>
    );
}