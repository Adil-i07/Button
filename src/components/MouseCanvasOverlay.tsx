import React, { useEffect, useRef } from 'react';

interface MouseCanvasOverlayProps {
  lastStraightLine?: { x1: number; y1: number; x2: number; y2: number; timestamp: number } | null;
  lastShake?: { x: number; y: number; timestamp: number } | null;
}

export const MouseCanvasOverlay: React.FC<MouseCanvasOverlayProps> = ({
  lastStraightLine,
  lastShake,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trailRef = useRef<Array<{ x: number; y: number; time: number }>>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      trailRef.current.push({ x: e.clientX, y: e.clientY, time: performance.now() });
      if (trailRef.current.length > 25) {
        trailRef.current.shift();
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Clean old trail points
      trailRef.current = trailRef.current.filter(pt => now - pt.time < 350);

      // Draw subtle glowing cursor trail
      if (trailRef.current.length > 1) {
        ctx.beginPath();
        for (let i = 0; i < trailRef.current.length - 1; i++) {
          const pt1 = trailRef.current[i];
          const pt2 = trailRef.current[i + 1];
          const ageRatio = 1 - (now - pt2.time) / 350;

          ctx.strokeStyle = `rgba(59, 130, 246, ${Math.max(0, ageRatio * 0.35)})`;
          ctx.lineWidth = Math.max(1, ageRatio * 3.5);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y);
          ctx.lineTo(pt2.x, pt2.y);
          ctx.stroke();
        }
      }

      // Draw straight line beam if active
      if (lastStraightLine && now - lastStraightLine.timestamp < 1200) {
        const progress = (now - lastStraightLine.timestamp) / 1200;
        const opacity = (1 - progress) * 0.7;

        ctx.save();
        ctx.strokeStyle = `rgba(14, 165, 233, ${opacity})`;
        ctx.lineWidth = 3 + (1 - progress) * 4;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(lastStraightLine.x1, lastStraightLine.y1);
        ctx.lineTo(lastStraightLine.x2, lastStraightLine.y2);
        ctx.stroke();

        // End points
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(lastStraightLine.x1, lastStraightLine.y1, 4, 0, Math.PI * 2);
        ctx.arc(lastStraightLine.x2, lastStraightLine.y2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw shake burst if active
      if (lastShake && now - lastShake.timestamp < 800) {
        const progress = (now - lastShake.timestamp) / 800;
        const radius = progress * 60;
        const opacity = (1 - progress) * 0.5;

        ctx.save();
        ctx.strokeStyle = `rgba(244, 63, 94, ${opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(lastShake.x, lastShake.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [lastStraightLine, lastShake]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-10"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};
