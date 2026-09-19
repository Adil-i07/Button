import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, Download, Copy, Share2, Check, ExternalLink } from 'lucide-react';
import { GameStats } from '../types';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  stats: GameStats;
  totalAchievements: number;
  unlockedCount: number;
  personalityTitle: string;
  cloudCode: string;
  onShareRecorded?: () => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  score,
  stats,
  totalAchievements,
  unlockedCount,
  personalityTitle,
  cloudCode,
  onShareRecorded,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);

  const fullShareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#${cloudCode}`
    : `https://ai.studio/#${cloudCode}`;

  useEffect(() => {
    if (!isOpen) return;

    // Draw the aesthetic canvas card
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1000;
    const height = 600;
    canvas.width = width;
    canvas.height = height;

    // 1. Background: Pure clean minimalist gradient with subtle geometry
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#f8fafc');
    bgGrad.addColorStop(0.5, '#f0f9ff');
    bgGrad.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 40; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Outer framing border
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // 2. Left Column: Player Title, Score, and Badge
    // Brand header
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('BLUE BUTTON • MINIMALIST EXPERIMENT', 60, 75);

    // Personality Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px "Plus Jakarta Sans", "Prompt", sans-serif';
    ctx.fillText(personalityTitle || 'นักสำรวจปุ่มสีฟ้า', 60, 130);

    // Subtitle
    ctx.fillStyle = '#64748b';
    ctx.font = '500 16px "Plus Jakarta Sans", "Prompt", sans-serif';
    ctx.fillText('รายงานผลการวิเคราะห์พฤติกรรมและความแม่นยำของเคอร์เซอร์', 60, 160);

    // Big Score
    ctx.fillStyle = '#2563eb';
    ctx.font = '800 64px "Plus Jakarta Sans", sans-serif';
    const scoreStr = Math.round(score).toLocaleString();
    ctx.fillText(scoreStr, 60, 245);

    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    const scoreWidth = ctx.measureText(scoreStr).width;
    ctx.fillText('PTS', 75 + scoreWidth, 220);

    // Achievements progress
    const pct = ((unlockedCount / totalAchievements) * 100).toFixed(1);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px "Plus Jakarta Sans", "Prompt", sans-serif';
    ctx.fillText(`ความสำเร็จปลดล็อกแล้ว: ${unlockedCount} / ${totalAchievements} (${pct}%)`, 60, 305);

    // Progress bar
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(60, 320, 420, 12, 6);
    ctx.fill();

    const progressFill = ctx.createLinearGradient(60, 0, 480, 0);
    progressFill.addColorStop(0, '#3b82f6');
    progressFill.addColorStop(1, '#06b6d4');
    ctx.fillStyle = progressFill;
    ctx.beginPath();
    ctx.roundRect(60, 320, Math.max(12, 420 * (unlockedCount / totalAchievements)), 12, 6);
    ctx.fill();

    // 4 Stat Metric Cards
    const statsBox = [
      { label: 'คลิกทั้งหมด', val: `${stats.totalClicks.toLocaleString()} ครั้ง` },
      { label: 'ความเร็วสูงสุด', val: `${stats.maxCPS.toFixed(1)} CPS` },
      { label: 'ระยะทางเมาส์', val: `${(stats.totalDistance / 3779.5).toFixed(1)} เมตร` },
      { label: 'เส้นตรงสมบูรณ์แบบ', val: `${stats.straightLineCount} ครั้ง` },
    ];

    statsBox.forEach((b, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const bx = 60 + col * 215;
      const by = 355 + row * 75;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.roundRect(bx, by, 205, 62, 12);
      ctx.fill();
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.9)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '500 13px "Prompt", sans-serif';
      ctx.fillText(b.label, bx + 14, by + 26);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 18px "Plus Jakarta Sans", "Prompt", sans-serif';
      ctx.fillText(b.val, bx + 14, by + 50);
    });

    // Cloud code pill at bottom
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(60, 520, 420, 42, 10);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`CLOUD SYNC CODE: #${cloudCode}`, 80, 546);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 12px monospace';
    ctx.fillText('ย้ายไปเล่นต่อได้ทันทีด้วย /#รหัสนี้', 300, 546);

    // 3. Right Column: Aesthetic Radar / Behavioral Polygon & Orb
    const centerX = 750;
    const centerY = 300;
    const radius = 170;

    // Glowing Ambient Orb behind radar
    const orbGlow = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius + 30);
    orbGlow.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
    orbGlow.addColorStop(0.7, 'rgba(6, 182, 212, 0.1)');
    orbGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = orbGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 30, 0, Math.PI * 2);
    ctx.fill();

    // Radar 5 Axes: Precision (Straight lines), Speed (CPS), Zen (Stillness), Travel (Distance), Agility (Combos)
    const axes = [
      { name: 'ความแม่นยำ (Precision)', val: Math.min(1, stats.straightLineCount / 30) },
      { name: 'ความเร็ว (Speed)', val: Math.min(1, stats.maxCPS / 15) },
      { name: 'ความนิ่ง (Zen)', val: Math.min(1, stats.maxIdleSeconds / 30) },
      { name: 'ความอดทน (Travel)', val: Math.min(1, stats.totalDistance / 20000) },
      { name: 'คอมโบ (Combo)', val: Math.min(1, stats.maxCombo / 40) },
    ];

    // Draw concentric polygons
    const numAxes = axes.length;
    for (let level = 1; level <= 4; level++) {
      const r = (radius * level) / 4;
      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.stroke();
    }

    // Draw spokes
    for (let i = 0; i < numAxes; i++) {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.stroke();

      // Axis Labels
      const labelX = centerX + Math.cos(angle) * (radius + 28);
      const labelY = centerY + Math.sin(angle) * (radius + 18);
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 12px "Prompt", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(axes[i].name, labelX, labelY);
    }
    ctx.textAlign = 'start';

    // Draw data polygon
    ctx.beginPath();
    for (let i = 0; i < numAxes; i++) {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const scoreScale = Math.max(0.2, axes[i].val);
      const r = radius * scoreScale;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(14, 165, 233, 0.35)';
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Data points dots
    for (let i = 0; i < numAxes; i++) {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const scoreScale = Math.max(0.2, axes[i].val);
      const r = radius * scoreScale;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Set Data URL for download/preview
    setDataUrl(canvas.toDataURL('image/png'));
  }, [isOpen, score, stats, totalAchievements, unlockedCount, personalityTitle, cloudCode]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `blue-button-stats-${cloudCode}.png`;
    link.href = dataUrl;
    link.click();
    onShareRecorded?.();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    onShareRecorded?.();
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
        onShareRecorded?.();
      });
    } catch (err) {
      handleCopyLink();
    }
  };

  const handleShareToX = () => {
    const text = encodeURIComponent(
      `ผมได้คะแนน ${Math.round(score).toLocaleString()} PTS และปลดล็อกความสำเร็จ ${unlockedCount}/${totalAchievements} ใน Blue Button Challenge! มาประลองกันที่:\n${fullShareUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    onShareRecorded?.();
  };

  const handleShareToLine = () => {
    const text = encodeURIComponent(
      `Blue Button Challenge • คะแนน: ${Math.round(score).toLocaleString()} PTS\n${fullShareUrl}`
    );
    window.open(`https://social-plugins.line.me/lineit/share?url=${text}`, '_blank');
    onShareRecorded?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-xs">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                แชร์ภาพสถิติผลงานของคุณ
              </h3>
              <p className="text-xs text-slate-500">
                ดาวน์โหลดภาพคุณภาพสูง หรือคัดลอกลิงก์เพื่อส่งต่อความท้าทาย
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

        {/* Preview Area */}
        <div className="p-4 sm:p-6 bg-slate-100/70 flex flex-col items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full max-w-2xl h-auto rounded-2xl shadow-md border border-slate-200/80"
          />
        </div>

        {/* Share Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Social Icons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            <button
              onClick={handleShareToX}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>X (Twitter)</span>
            </button>
            <button
              onClick={handleShareToLine}
              className="px-3 py-1.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>LINE</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'คัดลอกลิงก์แล้ว!' : 'คัดลอกลิงก์'}</span>
            </button>
          </div>

          {/* Primary Action */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopyImage}
              className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedImage ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedImage ? 'คัดลอกรูปแล้ว!' : 'คัดลอกรูปภาพ'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดภาพ PNG</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
