import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Sparkles } from 'lucide-react';
import { Achievement } from '../types';

interface AchievementToastProps {
  toasts: Achievement[];
  onDismiss: (id: string) => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((ach) => (
          <motion.div
            key={ach.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="pointer-events-auto p-3.5 rounded-2xl bg-slate-900/95 text-white shadow-xl border border-blue-500/40 backdrop-blur-md flex items-center gap-3 cursor-pointer"
            onClick={() => onDismiss(ach.id)}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shrink-0 shadow-xs">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-300 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>ปลดล็อกความสำเร็จใหม่!</span>
              </div>
              <div className="font-bold text-sm text-white truncate">
                {ach.titleTh}
              </div>
              <div className="text-xs text-slate-300 line-clamp-1">
                +{ach.points} แต้ม • {ach.descTh}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
