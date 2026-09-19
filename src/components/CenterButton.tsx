import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Zap, Sparkles } from 'lucide-react';

interface CenterButtonProps {
  buttonColor: 'blue' | 'green' | 'cyan' | 'indigo';
  combo: number;
  multiplier: number;
  onButtonClick: (e: React.MouseEvent, color: string) => void;
  onButtonHoldProgress?: (seconds: number) => void;
  onColorChange: (color: 'blue' | 'green' | 'cyan' | 'indigo') => void;
}

interface FloatingScore {
  id: number;
  text: string;
  x: number;
  y: number;
  colorClass: string;
}

export const CenterButton: React.FC<CenterButtonProps> = ({
  buttonColor,
  combo,
  multiplier,
  onButtonClick,
  onButtonHoldProgress,
  onColorChange,
}) => {
  const [isPressing, setIsPressing] = useState(false);
  const [holdDuration, setHoldDuration] = useState(0);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const holdTimerRef = useRef<any>(null);
  const holdStartTimeRef = useRef<number>(0);
  const nextScoreIdRef = useRef<number>(1);

  // Color theme styling maps
  const colorStyles = {
    blue: {
      bg: 'bg-gradient-to-b from-blue-500 to-blue-600',
      shadow: 'shadow-[0_20px_50px_rgba(37,99,235,0.35)] hover:shadow-[0_25px_60px_rgba(37,99,235,0.45)]',
      ring: 'border-blue-200/80',
      activeRing: 'ring-blue-400',
      glow: 'rgba(59,130,246,0.3)',
      text: 'text-blue-600',
    },
    green: {
      bg: 'bg-gradient-to-b from-emerald-500 to-emerald-600',
      shadow: 'shadow-[0_20px_50px_rgba(16,185,129,0.35)] hover:shadow-[0_25px_60px_rgba(16,185,129,0.45)]',
      ring: 'border-emerald-200/80',
      activeRing: 'ring-emerald-400',
      glow: 'rgba(16,185,129,0.3)',
      text: 'text-emerald-600',
    },
    cyan: {
      bg: 'bg-gradient-to-b from-cyan-400 to-cyan-600',
      shadow: 'shadow-[0_20px_50px_rgba(6,182,212,0.35)] hover:shadow-[0_25px_60px_rgba(6,182,212,0.45)]',
      ring: 'border-cyan-200/80',
      activeRing: 'ring-cyan-400',
      glow: 'rgba(6,182,212,0.3)',
      text: 'text-cyan-600',
    },
    indigo: {
      bg: 'bg-gradient-to-b from-indigo-500 to-indigo-600',
      shadow: 'shadow-[0_20px_50px_rgba(99,102,241,0.35)] hover:shadow-[0_25px_60px_rgba(99,102,241,0.45)]',
      ring: 'border-indigo-200/80',
      activeRing: 'ring-indigo-400',
      glow: 'rgba(99,102,241,0.3)',
      text: 'text-indigo-600',
    },
  };

  const currentTheme = colorStyles[buttonColor] || colorStyles.blue;

  // Handle pointer down (press & hold detection)
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsPressing(true);
    holdStartTimeRef.current = Date.now();
    setHoldDuration(0);

    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    holdTimerRef.current = setInterval(() => {
      const elapsedSec = (Date.now() - holdStartTimeRef.current) / 1000;
      setHoldDuration(elapsedSec);
      if (onButtonHoldProgress) {
        onButtonHoldProgress(elapsedSec);
      }
    }, 100);
  };

  const handlePointerUpOrLeave = (e: React.PointerEvent) => {
    if (isPressing) {
      setIsPressing(false);
      if (holdTimerRef.current) {
        clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    onButtonClick(e, buttonColor);

    // Add floating score badge
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = (Math.random() - 0.5) * 60;
    const offsetY = -20 - Math.random() * 20;

    const basePts = 10 * multiplier;
    const scoreText = combo > 5 ? `+${basePts.toFixed(0)} (x${multiplier.toFixed(1)})` : `+${basePts.toFixed(0)}`;

    const newScore: FloatingScore = {
      id: nextScoreIdRef.current++,
      text: scoreText,
      x: rect.width / 2 + offsetX,
      y: rect.height / 2 + offsetY,
      colorClass: currentTheme.text,
    };

    setFloatingScores((prev) => [...prev.slice(-12), newScore]);
    setTimeout(() => {
      setFloatingScores((prev) => prev.filter((s) => s.id !== newScore.id));
    }, 900);
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none" id="center-button-container">
      {/* Surrounding Ambient Concentric Rings */}
      <div
        className="pointer-events-none absolute -inset-16 rounded-full border border-blue-100/70 opacity-60 animate-pulse"
        style={{ animationDuration: '4s' }}
      />
      <div
        className="pointer-events-none absolute -inset-8 rounded-full border border-blue-100/90 opacity-80"
      />

      {/* Charge Ring Indicator on Press */}
      {holdDuration > 0.3 && (
        <svg className="pointer-events-none absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)] -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="48%"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="400"
            strokeDashoffset={Math.max(0, 400 - holdDuration * 60)}
            className={`${currentTheme.text} transition-all duration-75`}
          />
        </svg>
      )}

      {/* Core Center Button */}
      <motion.button
        id="core-center-button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUpOrLeave}
        onPointerLeave={handlePointerUpOrLeave}
        onClick={handleClick}
        className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full ${currentTheme.bg} ${currentTheme.shadow}
          p-2.5 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center
          focus:outline-none focus:ring-4 ${currentTheme.activeRing} focus:ring-opacity-40`}
      >
        {/* Inner concentric highlight */}
        <div className="absolute inset-1.5 rounded-full border border-white/30 pointer-events-none" />

        {/* Minimalist button surface */}
        <div className="flex flex-col items-center justify-center text-white pointer-events-none">
          <div className="w-12 h-12 mb-1.5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
            <Zap className="w-6 h-6 text-white drop-shadow" />
          </div>

          <span className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-sm font-sans">
            CLICK
          </span>

          {combo > 1 ? (
            <motion.div
              key={combo}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-1 flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/25 backdrop-blur-md text-white border border-white/30"
            >
              <Sparkles className="w-3 h-3" />
              <span>COMBO x{combo}</span>
            </motion.div>
          ) : (
            <span className="text-xs text-white/80 font-medium tracking-wide mt-0.5">
              กดเพื่อสะสมแต้ม
            </span>
          )}

          {/* Hold time label */}
          {holdDuration > 0.5 && (
            <span className="text-[11px] text-white/90 font-mono mt-1">
              {holdDuration.toFixed(1)}s (Hold)
            </span>
          )}
        </div>

        {/* Floating click scores */}
        <AnimatePresence>
          {floatingScores.map((score) => (
            <motion.div
              key={score.id}
              initial={{ opacity: 1, y: score.y, x: score.x, scale: 0.85 }}
              animate={{ opacity: 0, y: score.y - 70, scale: 1.15 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
              className="pointer-events-none absolute font-bold text-sm sm:text-base drop-shadow-md text-white whitespace-nowrap"
              style={{ left: 0, top: 0 }}
            >
              {score.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.button>

      {/* Color Switcher Pills (Allows switching to Green as requested in prompt, Cyan, Indigo) */}
      <div className="mt-6 flex items-center gap-1.5 p-1 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/80 shadow-xs">
        <span className="text-[11px] font-medium text-slate-400 pl-2 pr-1 flex items-center gap-1">
          <Palette className="w-3 h-3 text-slate-400" />
          สีปุ่ม:
        </span>
        {(['blue', 'green', 'cyan', 'indigo'] as const).map((color) => {
          const isSelected = buttonColor === color;
          const bgColors = {
            blue: 'bg-blue-500',
            green: 'bg-emerald-500',
            cyan: 'bg-cyan-500',
            indigo: 'bg-indigo-500',
          };
          const labels = {
            blue: 'ฟ้า',
            green: 'เขียว',
            cyan: 'ฟ้าคราม',
            indigo: 'คราม',
          };
          return (
            <button
              key={color}
              id={`btn-color-${color}`}
              onClick={() => onColorChange(color)}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${bgColors[color]}`} />
              {labels[color]}
            </button>
          );
        })}
      </div>
    </div>
  );
};
