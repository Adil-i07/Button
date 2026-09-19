import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  CheckCircle2,
  Lock,
  Trophy,
  Filter,
  Zap,
  MousePointer,
  Ruler,
  Compass,
  Maximize2,
  Sparkles,
  Keyboard,
  Crown,
} from 'lucide-react';
import { Achievement, AchievementCategory, AchievementTier } from '../types';
import { CATEGORY_LABELS } from '../data/achievements';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  unlockedSet: Set<string>;
  unlockedTimestamps: Record<string, number>;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
  unlockedSet,
  unlockedTimestamps,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [visibleLimit, setVisibleLimit] = useState(60);

  // Filtered achievements
  const filteredList = useMemo(() => {
    return achievements.filter((ach) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ach.titleTh.toLowerCase().includes(q) || ach.titleEn.toLowerCase().includes(q);
        const matchDesc = ach.descTh.toLowerCase().includes(q) || ach.descEn.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }

      // Category
      if (selectedCategory !== 'all' && ach.category !== selectedCategory) {
        return false;
      }

      // Status
      const isUnlocked = unlockedSet.has(ach.id);
      if (statusFilter === 'unlocked' && !isUnlocked) return false;
      if (statusFilter === 'locked' && isUnlocked) return false;

      return true;
    });
  }, [achievements, searchQuery, selectedCategory, statusFilter, unlockedSet]);

  const unlockedCount = unlockedSet.size;
  const totalCount = achievements.length;
  const progressPercent = ((unlockedCount / totalCount) * 100).toFixed(1);

  if (!isOpen) return null;

  const tierColors: Record<AchievementTier, { badge: string; border: string }> = {
    bronze: { badge: 'bg-amber-100 text-amber-800 border-amber-200', border: 'border-slate-200' },
    silver: { badge: 'bg-slate-100 text-slate-800 border-slate-300', border: 'border-slate-300' },
    gold: { badge: 'bg-yellow-100 text-yellow-800 border-yellow-300', border: 'border-yellow-200' },
    platinum: { badge: 'bg-cyan-100 text-cyan-800 border-cyan-300', border: 'border-cyan-200' },
    diamond: { badge: 'bg-blue-100 text-blue-800 border-blue-300', border: 'border-blue-300' },
  };

  const getCategoryIcon = (cat: AchievementCategory) => {
    switch (cat) {
      case 'clicks': return <MousePointer className="w-3.5 h-3.5" />;
      case 'speed': return <Zap className="w-3.5 h-3.5" />;
      case 'geometry': return <Ruler className="w-3.5 h-3.5" />;
      case 'distance': return <Compass className="w-3.5 h-3.5" />;
      case 'window': return <Maximize2 className="w-3.5 h-3.5" />;
      case 'gestures': return <Sparkles className="w-3.5 h-3.5" />;
      case 'controls': return <Keyboard className="w-3.5 h-3.5" />;
      case 'mastery': return <Crown className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                รายการความสำเร็จทั้งหมด (500+ รายการ)
              </h2>
              <p className="text-xs text-slate-500">
                ปลดล็อกแล้ว {unlockedCount} จาก {totalCount} รายการ ({progressPercent}%)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-white">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อหรือวิธีปลดล็อก..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ล้าง
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
              {(['all', 'unlocked', 'locked'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st === 'all' ? 'ทั้งหมด' : st === 'unlocked' ? 'ปลดแล้ว' : 'ยังไม่ปลด'}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด ({achievements.length})
            </button>
            {(Object.keys(CATEGORY_LABELS) as AchievementCategory[]).map((cat) => {
              const label = CATEGORY_LABELS[cat];
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {getCategoryIcon(cat)}
                  <span>{label.th}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Achievement Grid / List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Trophy className="w-10 h-10 mx-auto text-slate-300 mb-2 opacity-50" />
              <p className="text-sm">ไม่พบความสำเร็จที่ตรงกับเงื่อนไขการค้นหา</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredList.slice(0, visibleLimit).map((ach) => {
                const isUnlocked = unlockedSet.has(ach.id);
                const timestamp = unlockedTimestamps[ach.id];
                const tierInfo = tierColors[ach.tier] || tierColors.bronze;

                return (
                  <div
                    key={ach.id}
                    className={`relative p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                      isUnlocked
                        ? 'bg-white border-blue-200/80 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 opacity-60 hover:opacity-80'
                    }`}
                  >
                    {/* Status Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                        isUnlocked
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isUnlocked ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                          {ach.titleTh}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border uppercase tracking-wider ${tierInfo.badge}`}
                        >
                          {ach.tier}
                        </span>
                        <span className="text-[11px] font-semibold text-blue-600 ml-auto">
                          +{ach.points} PTS
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {ach.descTh}
                      </p>

                      {isUnlocked && timestamp && (
                        <div className="mt-1 text-[10px] text-emerald-600 font-medium">
                          ปลดล็อกเมื่อ: {new Date(timestamp).toLocaleDateString()} {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Show More Button if over visibleLimit */}
          {filteredList.length > visibleLimit && (
            <div className="text-center pt-4 pb-2">
              <button
                onClick={() => setVisibleLimit((prev) => prev + 60)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                โหลดเพิ่มอีก 60 รายการ ({visibleLimit} / {filteredList.length})
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>แสดง {Math.min(visibleLimit, filteredList.length)} จาก {filteredList.length} รายการ</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </motion.div>
    </div>
  );
};
