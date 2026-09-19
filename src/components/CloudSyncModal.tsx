import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Cloud, Copy, Check, ArrowRight, RefreshCw, Smartphone, Laptop } from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  cloudCode: string;
  isSyncing: boolean;
  lastSyncedTime: number | null;
  score: number;
  unlockedCount: number;
  onLoadFromCode: (code: string) => Promise<boolean>;
  onForceSync: () => Promise<void>;
  onGenerateNewCode: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  cloudCode,
  isSyncing,
  lastSyncedTime,
  score,
  unlockedCount,
  onLoadFromCode,
  onForceSync,
  onGenerateNewCode,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingCode, setIsLoadingCode] = useState(false);

  const fullUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#${cloudCode}`
    : `https://ai.studio/#${cloudCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = async () => {
    const trimmed = inputCode.trim().replace(/^#/, '').toUpperCase();
    if (!trimmed) return;

    setIsLoadingCode(true);
    setLoadError(null);

    const success = await onLoadFromCode(trimmed);
    setIsLoadingCode(false);

    if (success) {
      setInputCode('');
      onClose();
    } else {
      setLoadError('ไม่พบข้อมูลสำหรับรหัสนี้ หรือยังไม่มีการซิงค์ข้อมูลบนคลาวด์');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-xs">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                ซิงค์คลาวด์ & โอนย้ายข้ามเครื่อง
              </h3>
              <p className="text-xs text-slate-500">
                เปิดเล่นต่อได้ทุกอุปกรณ์ด้วยรหัส /# เดียวกัน
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

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Current Code Banner */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/70">
            <div className="text-xs font-semibold text-blue-600 mb-1">
              รหัสคลาวด์ประจำตัวของคุณ (Cloud Sync Code)
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 tracking-wider">
                #{cloudCode}
              </div>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-600 font-mono truncate">
              {fullUrl}
            </p>
          </div>

          {/* Device Sync Explanation */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
            <div className="flex gap-1 text-blue-600 shrink-0 mt-0.5">
              <Laptop className="w-4 h-4" />
              <ArrowRight className="w-3 h-3 self-center" />
              <Smartphone className="w-4 h-4" />
            </div>
            <p className="leading-relaxed">
              เพียงเปิดเว็บนี้บนมือถือ แท็บเล็ต หรือคอมพิวเตอร์เครื่องอื่น แล้วพิมพ์รหัส <span className="font-mono font-bold text-slate-900">#{cloudCode}</span> ต่อท้าย URL ระบบจะเชื่อมต่อและดึงคะแนนรวมถึง {unlockedCount} ความสำเร็จกลับมาเล่นต่อได้ทันที!
            </p>
          </div>

          {/* Transfer / Load Other Code Input */}
          <div className="border-t border-slate-100 pt-4 space-y-2">
            <label className="block text-xs font-semibold text-slate-800">
              นำเข้ารหัสจากเครื่องอื่น หรือสลับโปรไฟล์
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-sm">
                  #
                </span>
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="เช่น 748291"
                  className="w-full pl-7 pr-3 py-2 text-sm font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 uppercase"
                />
              </div>
              <button
                onClick={handleImport}
                disabled={!inputCode.trim() || isLoadingCode}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isLoadingCode && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>โหลดข้อมูล</span>
              </button>
            </div>

            {loadError && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{loadError}</p>
            )}
          </div>

          {/* Sync Stats & Force Action */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>
              สถานะ: {isSyncing ? 'กำลังบันทึกขึ้นคลาวด์...' : lastSyncedTime ? `ซิงค์ล่าสุดเมื่อ ${new Date(lastSyncedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'พร้อมซิงค์'}
            </span>
            <button
              onClick={() => onForceSync()}
              disabled={isSyncing}
              className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>ซิงค์เดี๋ยวนี้</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onGenerateNewCode}
            className="text-xs text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
          >
            สร้างรหัสสุ่มใหม่
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition-colors cursor-pointer"
          >
            เสร็จสิ้น
          </button>
        </div>
      </motion.div>
    </div>
  );
};
