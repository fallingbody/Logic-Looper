import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import {
  loadUserData,
  saveProgress,
  saveDailyHunt,
  getTodayKey,
  updateNickname,
  getIdentity // <--- CRITICAL: You were missing this import
} from './utils/progress';
import { getDailyPuzzle } from './utils/daily';
import { localDB } from './db';

// Components
import Welcome from './components/Welcome';
import GameMenu from './components/GameMenu';
import Heatmap from './components/Heatmap';
import Leaderboard from './components/Leaderboard';
import Background from './components/Background';

// Puzzles
import Sudoku from './components/puzzles/Sudoku';
import PatternMatch from './components/puzzles/PatternMatch';
import SequenceSolver from './components/puzzles/SequenceSolver';
import BinaryLogic from './components/puzzles/BinaryLogic';
import DeductionGrid from './components/puzzles/DeductionGrid';

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ points: 0, history: [], progress: {}, nickname: '' });
  const [screen, setScreen] = useState('loading');
  const [activeGame, setActiveGame] = useState(null);

  // Renaming State
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  // 1. AUTH & INITIAL LOAD
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);

      try {
        if (u) {
          const existingUser = await localDB.profile.get(u.uid);
          if (!existingUser) {
            await localDB.profile.put({ uid: u.uid, nickname: u.displayName || u.email.split('@')[0], points: 0 });
          }
          const data = await loadUserData(u);
          setUserData(data);
          setScreen('menu');

        } else if (localStorage.getItem('guest_mode') === 'true') {
          // GUEST SETUP - FIXED TO USE UNIQUE ID
          const guestId = getIdentity(null);
          const existingGuest = await localDB.profile.get(guestId);
          if (!existingGuest) {
            await localDB.profile.put({ uid: guestId, nickname: 'Guest Player', points: 0 });
          }
          const data = await loadUserData(null);
          setUserData(data);
          setScreen('menu');
        } else {
          setScreen('welcome');
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setScreen('welcome');
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. LOGIC HANDLERS
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Blocked:", error.message);
    }
  };

  const handleGuest = async () => {
    localStorage.setItem('guest_mode', 'true');
    // GUEST SETUP - FIXED TO USE UNIQUE ID
    const guestId = getIdentity(null);
    const existingGuest = await localDB.profile.get(guestId);
    if (!existingGuest) {
      await localDB.profile.put({ uid: guestId, nickname: 'Guest Player', points: 0 });
    }
    const data = await loadUserData(null);
    setUserData(data);
    setScreen('menu');
  };

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('guest_mode');
    setUser(null);
    setUserData({ points: 0, history: [], progress: {}, nickname: '' });
    setScreen('welcome');
  };

  // --- NAME CHANGE FIX ---
  const handleNameSave = async () => {
    if (!tempName.trim()) {
      setIsEditingName(false);
      return;
    }
    // CRITICAL FIX: Pass userData.points to ensure we don't wipe the score!
    await updateNickname(user, tempName, userData.points);
    setUserData(prev => ({ ...prev, nickname: tempName }));
    setIsEditingName(false);
  };

  const startGame = (gameId, isDaily = false) => {
    if (isDaily) {
      const puzzle = getDailyPuzzle();
      setActiveGame({ id: puzzle.gameId, level: puzzle.level, isDaily: true });
    } else {
      const savedLevel = userData.progress?.[`progress_${gameId}`] || userData.progress?.[gameId] || 1;
      setActiveGame({ id: gameId, level: Number(savedLevel), isDaily: false });
    }
    setScreen('game');
  };

  const handleGameComplete = async (success) => {
    if (!success) return;
    try {
      if (activeGame.isDaily) await saveDailyHunt(user);
      else await saveProgress(user, activeGame.id, activeGame.level + 1);

      const updatedData = await loadUserData(user);
      setUserData(updatedData);

      if (activeGame.isDaily) {
        setScreen('menu');
        setActiveGame(null);
      } else {
        setActiveGame(prev => ({ ...prev, level: prev.level + 1 }));
      }
    } catch (err) {
      console.error("Completion sync failed:", err);
    }
  };

  // --- RENDER CONTENT ---
  const renderContent = () => {
    if (screen === 'loading') return <div className="h-screen flex items-center justify-center font-mono animate-pulse text-cyan-500">INITIALIZING_CORE_SYSTEMS...</div>;
    if (screen === 'welcome') return <div className="flex items-center justify-center min-h-screen w-full"><Welcome onLogin={handleLogin} onGuest={handleGuest} /></div>;

    if (screen === 'menu') {
      const dailyPuzzle = getDailyPuzzle();
      const isDailyDone = (userData.history || []).includes(getTodayKey());

      return (
        <div className="min-h-screen p-4 pb-20 flex flex-col items-center max-w-6xl mx-auto w-full">
          {/* HEADER */}
          <div className="w-full flex justify-between items-center mb-8 pt-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Logic Looper</h1>

              <div className="flex items-center gap-2 mt-1 h-8">
                {isEditingName ? (
                  <div className="flex items-center gap-2 animate-in fade-in duration-200">
                    <input
                      type="text"
                      className="bg-slate-800 border border-slate-600 rounded px-2 py-0.5 text-xs text-white outline-none focus:border-cyan-500 w-32 font-mono"
                      placeholder="Enter Name"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      maxLength={12}
                      autoFocus
                    />
                    <button onClick={handleNameSave} className="text-[10px] bg-green-900/30 text-green-400 border border-green-800/50 px-2 py-0.5 rounded hover:bg-green-900/50 transition-colors">SAVE</button>
                    <button onClick={() => setIsEditingName(false)} className="text-[10px] text-slate-500 hover:text-white transition-colors">✕</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setTempName(userData.nickname || 'Player'); setIsEditingName(true); }}>
                    <p className="text-xs text-slate-400 font-mono font-bold">{userData.nickname || (user ? 'Player' : 'Guest Player')}</p>
                    <span className="text-[10px] text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all">✎</span>
                  </div>
                )}
              </div>

              {/* ONLINE STATUS FIX - GUESTS ARE NOW ONLINE TOO */}
              <p className="text-[10px] text-slate-600 font-mono mt-0.5 flex items-center gap-1 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></span>
                ONLINE_SYNC_ACTIVE • {user ? 'VERIFIED_ACCOUNT' : 'GUEST_ACCOUNT'}
              </p>
            </div>

            <div className="flex gap-4 items-center">
              <div className="bg-yellow-900/20 border border-yellow-700/50 px-3 py-1 rounded text-yellow-400 font-bold font-mono">{userData.points || 0} PTS</div>
              <button onClick={handleLogout} className="text-xs text-red-400 border border-red-900/50 px-4 py-2 rounded hover:bg-red-900/20 transition-colors">EXIT</button>
            </div>
          </div>

          <div className="w-full grid lg:grid-cols-[1fr_350px] gap-8">
            <div className="flex flex-col gap-8">
              <button onClick={() => !isDailyDone && startGame(null, true)} disabled={isDailyDone} className={`w-full p-6 rounded-2xl border flex items-center justify-between group transition-all relative overflow-hidden shadow-lg ${isDailyDone ? 'bg-green-950/30 border-green-800 cursor-default opacity-80' : 'bg-slate-900/60 border-indigo-500/50 hover:border-indigo-400 hover:shadow-indigo-500/20'}`}>
                <div className="relative z-10 text-left">
                  <h3 className={`text-2xl font-bold mb-1 ${isDailyDone ? 'text-green-400' : 'text-white'}`}>{isDailyDone ? 'DAILY HUNT COMPLETE' : 'DAILY HUNT'}</h3>
                  <p className="text-slate-400 text-sm font-mono">{isDailyDone ? "Reward claimed. Reset in 24h." : `CHALLENGE: ${dailyPuzzle.gameId.toUpperCase()} • STAGE ${dailyPuzzle.level}`}</p>
                </div>
                <div className="text-4xl">{isDailyDone ? '✅' : '🎯'}</div>
              </button>
              <GameMenu user={user} onSelectGame={(id) => startGame(id, false)} />
            </div>

            <div className="flex flex-col gap-6">
              <Heatmap history={userData.history || []} />
              <Leaderboard />
            </div>
          </div>
        </div>
      );
    }

    if (screen === 'game' && activeGame) {
      const commonProps = { onComplete: handleGameComplete, initialLevel: activeGame.level };
      const components = { sudoku: Sudoku, pattern: PatternMatch, sequence: SequenceSolver, binary: BinaryLogic, deduct: DeductionGrid };
      const GameComponent = components[activeGame.id];

      return (
        <div className="min-h-screen flex flex-col items-center p-4 w-full">
          <div className="w-full max-w-5xl flex justify-start mb-4">
            <button onClick={() => setScreen('menu')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold tracking-wider"><span>←</span> ABORT MISSION</button>
          </div>
          <div className="w-full flex-1 flex justify-center">
            {GameComponent ? <GameComponent {...commonProps} /> : <div>Game Not Found</div>}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500 selection:text-white relative overflow-x-hidden">
      <Background />
      <div className="relative z-10 w-full min-h-screen flex flex-col">{renderContent()}</div>
    </div>
  );
}