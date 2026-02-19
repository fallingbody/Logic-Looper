import { motion } from 'framer-motion';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

export default function Welcome({ onLogin, onGuest }) {

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            // We usually wait for the auth listener in App.jsx to trigger onLogin, 
            // but if you are passing it manually:
            if (onLogin) onLogin();
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden text-center p-6 z-10">

            {/* 1. Animated Logo / Hero */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="z-10 flex flex-col items-center"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 border-4 border-blue-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(59,130,246,0.5)] backdrop-blur-sm bg-slate-900/30"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-16 h-16 bg-yellow-400 rounded-lg rotate-45"
                    />
                </motion.div>

                <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter mb-2 drop-shadow-2xl">
                    LOGIC <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">LOOPER</span>
                </h1>
                <p className="text-slate-300 text-lg max-w-md drop-shadow-md">
                    Daily brain training protocols. <br />Infinite levels. Pure logic.
                </p>
            </motion.div>

            {/* 2. Action Buttons */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="z-10 mt-12 flex flex-col gap-4 w-full max-w-xs"
            >
                <button
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center gap-3 w-full bg-white text-slate-900 font-bold py-4 rounded-xl hover:bg-gray-100 transition-transform active:scale-95 shadow-xl"
                >
                    {/* INLINE GOOGLE SVG LOGO */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Continue with Google
                </button>

                <button
                    onClick={onGuest}
                    className="w-full bg-slate-800/80 backdrop-blur-md text-slate-300 font-bold py-4 rounded-xl border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
                >
                    Continue as Guest
                </button>
            </motion.div>

            <div className="absolute bottom-6 text-slate-500 text-xs">
                v1.0.5 • Project Capstone
            </div>
        </div>
    );
}