import React from 'react';
import { Trophy, Share2, Cloud, Zap, Compass, Ruler, Sparkles } from 'lucide-react';
import { GameStats } from '../types';

interface StatsHUDProps {
  score: number;
  stats: GameStats;
  totalAchievements: number;
  unlockedCount: number;
  cloudCode: string;
  isCloudSynced: boolean;
  onOpenAchievements: () => void;
  onOpenShareModal: () => void;
  onOpenCloudSync: () => void;
}

export const StatsHUD: React.FC<StatsHUDProps> = ({
  score,
  stats,
  totalAchievements,
  unlockedCount,
  cloudCode,
  isCloudSynced,
  onOpenAchievements,
  onOpenShareModal,
  onOpenCloudSync,
}) => {
  const percentUnlocked = ((unlockedCount / totalAchievements) * 100).toFixed(1);
  const distanceMeters = (stats.totalDistance / 3779.5).toFixed(1);

  return (
    <header className="w-full max-w-5xl mx-auto px-4 pt-3 sm:pt-4" id="main-stats-hud">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs">
        {/* Left: Score & Achievement summary */}
        <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto justify-between md:justify-start">
          {/* Main Score Display */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              คะแนนรวมทั้งหมด
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-sans tracking-tight">
              {Math.round(score).toLocaleString()}
              <span className="text-xs font-semibold text-blue-400 ml-1">PTS</span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200" />

          {/* Achievements Summary Button */}
          <button
            id="btn-open-achievements"
            onClick={onOpenAchievements}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-blue-50/80 hover:bg-blue-100/90 text-blue-700 transition-all border border-blue-200/60 cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-blue-500">ความสำเร็จ</div>
              <div className="text-xs sm:text-sm font-bold text-slate-800">
                {unlockedCount} / {totalAchievements}
                <span className="text-[11px] font-normal text-slate-500 ml-1">
                  ({percentUnlocked}%)
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Center/Right: Live Telemetry Metrics */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-medium text-slate-600 flex-wrap justify-center">
          {/* CPS */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 border border-slate-200/60">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>{stats.currentCPS.toFixed(1)} CPS</span>
          </div>

          {/* Straight Lines */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 border border-slate-200/60">
            <Ruler className="w-3.5 h-3.5 text-blue-500" />
            <span>{stats.straightLineCount} เส้นตรง</span>
          </div>

          {/* Distance */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 border border-slate-200/60">
            <Compass className="w-3.5 h-3.5 text-cyan-500" />
            <span>{distanceMeters} ม.</span>
          </div>
        </div>

        {/* Right: Cloud Sync & Social Share Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Cloud Sync Status & Modal */}
          <button
            id="btn-open-cloud-sync"
            onClick={onOpenCloudSync}
            title="รหัสคลาวด์สำหรับเล่นต่อข้ามเครื่อง"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium text-xs transition-colors border border-slate-200/80 cursor-pointer"
          >
            <Cloud className={`w-3.5 h-3.5 ${isCloudSynced ? 'text-emerald-500' : 'text-slate-400'}`} />
            <span className="font-mono">#{cloudCode}</span>
          </button>

          {/* Share Stats Card */}
          <button
            id="btn-open-share-card"
            onClick={onOpenShareModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium text-xs shadow-xs transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>แชร์ภาพสถิติ</span>
          </button>
        </div>
      </div>
    </header>
  );
};
