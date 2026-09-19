import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Sparkles, RefreshCw, Bot } from 'lucide-react';

interface CommentatorBarProps {
  commentary: string;
  personalityTitle: string;
  roastMood: 'teasing' | 'impressed' | 'amused' | 'mystical' | 'worried';
  voiceEnabled: boolean;
  soundFxEnabled: boolean;
  isAnalyzing: boolean;
  onToggleVoice: () => void;
  onToggleSoundFx: () => void;
  onReplayVoice: () => void;
  onRequestAnalysis: () => void;
}

export const CommentatorBar: React.FC<CommentatorBarProps> = ({
  commentary,
  personalityTitle,
  roastMood,
  voiceEnabled,
  soundFxEnabled,
  isAnalyzing,
  onToggleVoice,
  onToggleSoundFx,
  onReplayVoice,
  onRequestAnalysis,
}) => {
  const moodLabels = {
    teasing: { text: 'แซวแสบ', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    impressed: { text: 'ทึ่งในฝีมือ', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    amused: { text: 'ขบขัน', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    mystical: { text: 'วิเคราะห์ลึก', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    worried: { text: 'เป็นห่วงนิ้ว', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  };

  const currentMood = moodLabels[roastMood] || moodLabels.amused;

  return (
    <div
      id="ai-commentator-bar"
      className="w-full max-w-2xl mx-auto px-4 py-2"
    >
      <div className="relative rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm p-3.5 sm:p-4 transition-all hover:shadow-md">
        <div className="flex items-start gap-3">
          {/* AI Avatar with subtle animation */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            {isAnalyzing && (
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            )}
          </div>

          {/* Commentary Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1">
                AI ผู้สังเกตการณ์พฤติกรรม
              </span>

              {/* Personality Archetype Badge */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/70">
                <Sparkles className="w-3 h-3 text-blue-500" />
                {personalityTitle || 'นักทดลองเมาส์'}
              </span>

              {/* Mood Tag */}
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${currentMood.color}`}
              >
                {currentMood.text}
              </span>
            </div>

            {/* Commentary Live Speech Text */}
            <AnimatePresence mode="wait">
              <motion.p
                key={commentary}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-sm sm:text-base text-slate-700 font-normal leading-relaxed break-words"
              >
                "{commentary || 'กำลังประเมินการเคลื่อนไหวของเมาส์และจังหวะคลิกของคุณ...'}"
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Controls toolbar */}
          <div className="flex flex-col sm:flex-row items-center gap-1 shrink-0">
            {/* Replay Voice */}
            <button
              onClick={onReplayVoice}
              title="อ่านออกเสียงอีกครั้ง"
              id="btn-replay-voice"
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Toggle Voice Mute */}
            <button
              onClick={onToggleVoice}
              title={voiceEnabled ? 'ปิดเสียงพากย์' : 'เปิดเสียงพากย์'}
              id="btn-toggle-voice"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                voiceEnabled
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Request Fresh AI Analysis */}
            <button
              onClick={onRequestAnalysis}
              disabled={isAnalyzing}
              title="ขอให้ AI วิเคราะห์พฤติกรรมตอนนี้"
              id="btn-request-ai-roast"
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin text-blue-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
