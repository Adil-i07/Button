import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ALL_ACHIEVEMENTS } from './data/achievements';
import { GameStats, Achievement, PlayerData } from './types';
import { audio } from './utils/audio';
import { StatsHUD } from './components/StatsHUD';
import { CenterButton } from './components/CenterButton';
import { CommentatorBar } from './components/CommentatorBar';
import { AchievementsModal } from './components/AchievementsModal';
import { ShareCardModal } from './components/ShareCardModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { AchievementToast } from './components/AchievementToast';
import { MouseCanvasOverlay } from './components/MouseCanvasOverlay';
import { Sparkles, Info } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'blue_button_player_save_v1';

const INITIAL_STATS: GameStats = {
  totalClicks: 0,
  buttonClicks: 0,
  nonButtonClicks: 0,
  greenButtonClicks: 0,
  rightClicks: 0,
  doubleClicks: 0,
  tripleClicks: 0,
  maxCPS: 0,
  currentCPS: 0,
  currentCombo: 0,
  maxCombo: 0,
  totalDistance: 0,
  straightLineDistance: 0,
  maxStraightLineLength: 0,
  straightLineCount: 0,
  horizontalStraightLines: 0,
  verticalStraightLines: 0,
  diagonalStraightLines: 0,
  maxSpeed: 0,
  shakeCount: 0,
  circleCount: 0,
  idleSeconds: 0,
  maxIdleSeconds: 0,
  stillnessStreakCount: 0,
  windowResizeCount: 0,
  windowWidthsVisited: 0,
  cornersVisited: 0,
  edgeTouches: 0,
  spacebarClicks: 0,
  shiftClicks: 0,
  ctrlClicks: 0,
  altClicks: 0,
  scrollCount: 0,
  scrollUpCount: 0,
  scrollDownCount: 0,
  konamiTriggered: false,
  buttonHoldSeconds: 0,
  maxButtonHoldSeconds: 0,
  soundToggles: 0,
  themeColorSwitches: 0,
  voiceCommentariesHeard: 0,
  statsSharedCount: 0,
  cloudSyncCount: 0,
  score: 0,
  unlockedAchievementsCount: 0,
};

export default function App() {
  // Game State
  const [score, setScore] = useState<number>(0);
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [unlockedSet, setUnlockedSet] = useState<Set<string>>(new Set());
  const [unlockedTimestamps, setUnlockedTimestamps] = useState<Record<string, number>>({});
  const [toasts, setToasts] = useState<Achievement[]>([]);

  // Telemetry & Aesthetics
  const [buttonColor, setButtonColor] = useState<'blue' | 'green' | 'cyan' | 'indigo'>('blue');
  const [combo, setCombo] = useState<number>(0);
  const [personalityTitle, setPersonalityTitle] = useState<string>('นักสำรวจปุ่มสีฟ้า');
  const [roastMood, setRoastMood] = useState<'teasing' | 'impressed' | 'amused' | 'mystical' | 'worried'>('amused');
  const [commentary, setCommentary] = useState<string>('ยินดีต้อนรับสู่โลกสีฟ้า ขยับเมาส์หรือกดปุ่มเพื่อเริ่มบันทึกสถิติของคุณ');
  const [isAnalyzingAI, setIsAnalyzingAI] = useState<boolean>(false);

  // Settings & Toggles
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [soundFxEnabled, setSoundFxEnabled] = useState<boolean>(true);

  // Modals
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState<boolean>(false);

  // Cloud Sync
  const [cloudCode, setCloudCode] = useState<string>('849201');
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<number | null>(null);

  // Mouse telemetry visual overlays
  const [lastStraightLine, setLastStraightLine] = useState<{ x1: number; y1: number; x2: number; y2: number; timestamp: number } | null>(null);
  const [lastShake, setLastShake] = useState<{ x: number; y: number; timestamp: number } | null>(null);

  // Refs for high-frequency tracking
  const statsRef = useRef<GameStats>(INITIAL_STATS);
  const scoreRef = useRef<number>(0);
  const unlockedSetRef = useRef<Set<string>>(new Set());
  const recentClicksRef = useRef<number[]>([]);
  const recentPathRef = useRef<Array<{ x: number; y: number; t: number }>>([]);
  const recentReversalsRef = useRef<Array<{ dir: string; t: number }>>([]);
  const circleAnglesRef = useRef<number[]>([]);
  const lastMoveTimeRef = useRef<number>(Date.now());
  const comboTimerRef = useRef<any>(null);
  const konamiSeqRef = useRef<string[]>([]);
  const cloudSyncDebounceRef = useRef<any>(null);
  const lastAIAnalysisTimeRef = useRef<number>(Date.now());

  statsRef.current = stats;
  scoreRef.current = score;
  unlockedSetRef.current = unlockedSet;

  // Initialize Cloud Code and Load State
  useEffect(() => {
    let initialCode = '';
    const hash = window.location.hash.replace('#', '').trim().toUpperCase();

    if (hash && hash.length >= 3) {
      initialCode = hash;
    } else {
      // Check local storage for existing code or generate random 6-digit
      try {
        const local = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed.code) initialCode = parsed.code;
        }
      } catch (e) {}

      if (!initialCode) {
        initialCode = Math.floor(100000 + Math.random() * 900000).toString();
      }
      window.location.hash = `#${initialCode}`;
    }

    setCloudCode(initialCode);

    // Attempt to load from Cloud, fallback to LocalStorage
    loadSaveData(initialCode);
  }, []);

  // Update hash when cloudCode changes
  useEffect(() => {
    if (cloudCode) {
      window.location.hash = `#${cloudCode}`;
    }
  }, [cloudCode]);

  // Handle Load Save Data
  const loadSaveData = async (codeToLoad: string): Promise<boolean> => {
    try {
      // 1. Try Cloud
      const res = await fetch(`/api/sync/${codeToLoad}`);
      const json = await res.json();

      if (json.success && json.data) {
        const data = json.data;
        applyLoadedData(data);
        setIsCloudSynced(true);
        setLastSyncedTime(data.updatedAt || Date.now());
        return true;
      }
    } catch (err) {
      console.warn('[Sync] Failed cloud fetch, attempting local fallback:', err);
    }

    // 2. Try LocalStorage
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.code === codeToLoad || !codeToLoad) {
          applyLoadedData(parsed);
          return true;
        }
      }
    } catch (e) {}

    return false;
  };

  const applyLoadedData = (data: any) => {
    if (data.score !== undefined) setScore(data.score);
    if (data.stats) setStats(data.stats);
    if (Array.isArray(data.achievements)) {
      const set = new Set<string>(data.achievements);
      setUnlockedSet(set);
    }
    if (data.personalityTitle) setPersonalityTitle(data.personalityTitle);
    if (data.buttonColor) setButtonColor(data.buttonColor);
  };

  // Push updates to Cloud & LocalStorage
  const scheduleCloudSync = useCallback(() => {
    if (cloudSyncDebounceRef.current) {
      clearTimeout(cloudSyncDebounceRef.current);
    }

    cloudSyncDebounceRef.current = setTimeout(async () => {
      setIsSyncing(true);
      const payload: PlayerData = {
        code: cloudCode,
        score: scoreRef.current,
        totalClicks: statsRef.current.totalClicks,
        distanceTraveled: statsRef.current.totalDistance,
        achievements: Array.from(unlockedSetRef.current),
        unlockedTimestamps,
        stats: statsRef.current,
        personalityTitle,
        roastMood,
        lastCommentary: commentary,
        buttonColor,
        language: 'auto',
        voiceEnabled,
        soundFxEnabled,
      };

      // 1. Save local
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {}

      // 2. Save cloud
      try {
        const res = await fetch(`/api/sync/${cloudCode}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const resJson = await res.json();
        if (resJson.success) {
          setIsCloudSynced(true);
          setLastSyncedTime(Date.now());
        }
      } catch (err) {
        console.warn('[Sync] Cloud push failed:', err);
      } finally {
        setIsSyncing(false);
      }
    }, 2500);
  }, [cloudCode, unlockedTimestamps, personalityTitle, roastMood, commentary, buttonColor, voiceEnabled, soundFxEnabled]);

  // Check achievements engine
  const checkAchievements = useCallback(() => {
    const currentStats = statsRef.current;
    const currentSet = unlockedSetRef.current;
    const newlyUnlocked: Achievement[] = [];

    for (const ach of ALL_ACHIEVEMENTS) {
      if (!currentSet.has(ach.id)) {
        if (ach.check(currentStats)) {
          newlyUnlocked.push(ach);
        }
      }
    }

    if (newlyUnlocked.length > 0) {
      const nextSet = new Set(currentSet);
      const newTimestamps = { ...unlockedTimestamps };
      let bonusScore = 0;

      newlyUnlocked.forEach((ach) => {
        nextSet.add(ach.id);
        newTimestamps[ach.id] = Date.now();
        bonusScore += ach.points;
      });

      setUnlockedSet(nextSet);
      setUnlockedTimestamps(newTimestamps);
      setScore((prev) => prev + bonusScore);

      // Play chime for the highest tier unlocked in this batch
      const highestTier = newlyUnlocked[newlyUnlocked.length - 1].tier;
      audio.playAchievementUnlock(highestTier);

      // Show toast
      setToasts((prev) => [...prev.slice(-3), ...newlyUnlocked.slice(0, 2)]);

      setStats((prev) => {
        const next = {
          ...prev,
          unlockedAchievementsCount: nextSet.size,
          score: prev.score + bonusScore,
        };
        statsRef.current = next;
        return next;
      });

      scheduleCloudSync();
    }
  }, [unlockedTimestamps, scheduleCloudSync]);

  // Request AI Commentary & Psychoanalysis
  const requestAICommentary = useCallback(async (recentAction: string = 'cursor_move') => {
    if (isAnalyzingAI) return;
    setIsAnalyzingAI(true);

    try {
      const currentStats = statsRef.current;
      const res = await fetch('/api/gemini/analyze-behavior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clicks: currentStats.totalClicks,
          cps: currentStats.currentCPS,
          distance: currentStats.totalDistance,
          avgSpeed: currentStats.maxSpeed * 0.4,
          linearity: Math.min(1, currentStats.straightLineCount / (currentStats.totalClicks + 10)),
          shakiness: Math.min(1, currentStats.shakeCount / 20),
          idleSeconds: currentStats.idleSeconds,
          recentAction,
          locale: navigator.language || 'th-TH',
          currentTitle: personalityTitle,
        }),
      });

      const data = await res.json();
      if (data.commentary) {
        setCommentary(data.commentary);
        if (data.personalityTitle) setPersonalityTitle(data.personalityTitle);
        if (data.roastMood) setRoastMood(data.roastMood);

        // Voice speak
        audio.speak(data.commentary, 'auto');

        // Increment voice count
        setStats((prev) => {
          const next = { ...prev, voiceCommentariesHeard: prev.voiceCommentariesHeard + 1 };
          statsRef.current = next;
          return next;
        });
      }
    } catch (err) {
      console.warn('[Gemini] Behavior analysis error:', err);
    } finally {
      setIsAnalyzingAI(false);
      lastAIAnalysisTimeRef.current = Date.now();
    }
  }, [isAnalyzingAI, personalityTitle]);

  // Continuous CPS & Idle Tracker Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      // 1. CPS calculation (clicks in past 1200ms)
      recentClicksRef.current = recentClicksRef.current.filter((t) => now - t < 1200);
      const cps = recentClicksRef.current.length / 1.2;

      // 2. Idle calculation
      const idleSec = Math.floor((now - lastMoveTimeRef.current) / 1000);

      setStats((prev) => {
        const nextMaxCPS = Math.max(prev.maxCPS, cps);
        const nextMaxIdle = Math.max(prev.maxIdleSeconds, idleSec);

        const next: GameStats = {
          ...prev,
          currentCPS: cps,
          maxCPS: nextMaxCPS,
          idleSeconds: idleSec,
          maxIdleSeconds: nextMaxIdle,
          score: scoreRef.current,
        };
        statsRef.current = next;
        return next;
      });

      // Periodic check
      checkAchievements();

      // Trigger AI commentary if idle > 15s and haven't spoken in 30s
      if (idleSec >= 15 && now - lastAIAnalysisTimeRef.current > 35000) {
        requestAICommentary('idle_zen');
      }
    }, 400);

    return () => clearInterval(interval);
  }, [checkAchievements, requestAICommentary]);

  // Window Resize Listener (User explicitly requested: "การปรับขนาดหน้าต่างเบราว์เซอร์")
  useEffect(() => {
    let resizeTimer: any = null;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setStats((prev) => {
          const nextCount = prev.windowResizeCount + 1;
          const next = {
            ...prev,
            windowResizeCount: nextCount,
          };
          statsRef.current = next;
          return next;
        });

        // Award bonus score for resizing
        setScore((prev) => prev + 20);
        checkAchievements();
        scheduleCloudSync();

        // Maybe trigger AI commentary on resize
        if (Date.now() - lastAIAnalysisTimeRef.current > 20000) {
          requestAICommentary('resize');
        }
      }, 300);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, [checkAchievements, scheduleCloudSync, requestAICommentary]);

  // Mouse Movement, Straight Line & Shake Detection Engine
  useEffect(() => {
    let lastX = -1;
    let lastY = -1;
    let lastT = Date.now();

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      lastMoveTimeRef.current = now;

      if (lastX >= 0 && lastY >= 0) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const dt = Math.max(1, now - lastT) / 1000;
        const speed = dist / dt;

        // Add to recent path
        recentPathRef.current.push({ x: e.clientX, y: e.clientY, t: now });
        if (recentPathRef.current.length > 25) recentPathRef.current.shift();

        // 1. STRAIGHT LINE DETECTION (User explicitly requested: "การขยับเคอร์เซอร์เป็นเส้นตรง")
        if (recentPathRef.current.length >= 8) {
          const first = recentPathRef.current[0];
          const last = recentPathRef.current[recentPathRef.current.length - 1];
          const strokeDx = last.x - first.x;
          const strokeDy = last.y - first.y;
          const directDist = Math.sqrt(strokeDx * strokeDx + strokeDy * strokeDy);

          // Calculate total path distance
          let totalPathDist = 0;
          for (let i = 0; i < recentPathRef.current.length - 1; i++) {
            const p1 = recentPathRef.current[i];
            const p2 = recentPathRef.current[i + 1];
            totalPathDist += Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
          }

          const linearityRatio = totalPathDist > 0 ? directDist / totalPathDist : 0;

          // If linearity > 95% and distance > 140px, we found a straight line!
          if (linearityRatio > 0.95 && directDist > 140) {
            const isHoriz = Math.abs(strokeDy) < 20;
            const isVert = Math.abs(strokeDx) < 20;
            const isDiag = Math.abs(Math.abs(strokeDx) - Math.abs(strokeDy)) < 30;

            audio.playStraightLine();
            setLastStraightLine({
              x1: first.x,
              y1: first.y,
              x2: last.x,
              y2: last.y,
              timestamp: now,
            });

            setStats((prev) => {
              const next: GameStats = {
                ...prev,
                straightLineCount: prev.straightLineCount + 1,
                straightLineDistance: prev.straightLineDistance + directDist,
                maxStraightLineLength: Math.max(prev.maxStraightLineLength, directDist),
                horizontalStraightLines: isHoriz ? prev.horizontalStraightLines + 1 : prev.horizontalStraightLines,
                verticalStraightLines: isVert ? prev.verticalStraightLines + 1 : prev.verticalStraightLines,
                diagonalStraightLines: isDiag ? prev.diagonalStraightLines + 1 : prev.diagonalStraightLines,
              };
              statsRef.current = next;
              return next;
            });

            // Score bonus
            setScore((prev) => prev + 25);
            recentPathRef.current = []; // reset to avoid duplicate count
            checkAchievements();

            if (Date.now() - lastAIAnalysisTimeRef.current > 30000) {
              requestAICommentary('straight_line');
            }
          }
        }

        // 2. SHAKE / JITTER DETECTION
        const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'R' : 'L') : dy > 0 ? 'D' : 'U';
        recentReversalsRef.current.push({ dir, t: now });
        recentReversalsRef.current = recentReversalsRef.current.filter((r) => now - r.t < 600);

        let reversals = 0;
        for (let i = 0; i < recentReversalsRef.current.length - 1; i++) {
          if (recentReversalsRef.current[i].dir !== recentReversalsRef.current[i + 1].dir) {
            reversals++;
          }
        }

        if (reversals >= 7) {
          setLastShake({ x: e.clientX, y: e.clientY, timestamp: now });
          setStats((prev) => {
            const next = { ...prev, shakeCount: prev.shakeCount + 1 };
            statsRef.current = next;
            return next;
          });
          setScore((prev) => prev + 30);
          recentReversalsRef.current = [];
          checkAchievements();

          if (Date.now() - lastAIAnalysisTimeRef.current > 25000) {
            requestAICommentary('mouse_shake');
          }
        }

        // 3. CIRCLING DETECTION AROUND BUTTON (relative to center of screen)
        const centerBtnX = window.innerWidth / 2;
        const centerBtnY = window.innerHeight / 2;
        const angle = Math.atan2(e.clientY - centerBtnY, e.clientX - centerBtnX);
        circleAnglesRef.current.push(angle);
        if (circleAnglesRef.current.length > 30) circleAnglesRef.current.shift();

        if (circleAnglesRef.current.length >= 20) {
          let totalSweep = 0;
          for (let i = 0; i < circleAnglesRef.current.length - 1; i++) {
            let diff = circleAnglesRef.current[i + 1] - circleAnglesRef.current[i];
            if (diff > Math.PI) diff -= Math.PI * 2;
            if (diff < -Math.PI) diff += Math.PI * 2;
            totalSweep += diff;
          }
          if (Math.abs(totalSweep) >= Math.PI * 1.8) {
            setStats((prev) => {
              const next = { ...prev, circleCount: prev.circleCount + 1 };
              statsRef.current = next;
              return next;
            });
            setScore((prev) => prev + 50);
            circleAnglesRef.current = [];
            checkAchievements();
            if (Date.now() - lastAIAnalysisTimeRef.current > 30000) {
              requestAICommentary('circle');
            }
          }
        }

        // 4. CORNERS & EDGES
        const isNearEdge =
          e.clientX < 15 ||
          e.clientX > window.innerWidth - 15 ||
          e.clientY < 15 ||
          e.clientY > window.innerHeight - 15;

        const isNearCorner =
          (e.clientX < 35 && e.clientY < 35) ||
          (e.clientX > window.innerWidth - 35 && e.clientY < 35) ||
          (e.clientX < 35 && e.clientY > window.innerHeight - 35) ||
          (e.clientX > window.innerWidth - 35 && e.clientY > window.innerHeight - 35);

        // Update overall stats
        setStats((prev) => {
          const next: GameStats = {
            ...prev,
            totalDistance: prev.totalDistance + dist,
            maxSpeed: Math.max(prev.maxSpeed, speed),
            edgeTouches: isNearEdge ? prev.edgeTouches + 1 : prev.edgeTouches,
            cornersVisited: isNearCorner ? prev.cornersVisited + 1 : prev.cornersVisited,
          };
          statsRef.current = next;
          return next;
        });

        // Small score for moving mouse
        setScore((prev) => prev + dist * 0.005);
      }

      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [checkAchievements, requestAICommentary]);

  // Wheel & Keyboard Listeners
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      setStats((prev) => {
        const next: GameStats = {
          ...prev,
          scrollCount: prev.scrollCount + 1,
          scrollUpCount: e.deltaY < 0 ? prev.scrollUpCount + 1 : prev.scrollUpCount,
          scrollDownCount: e.deltaY > 0 ? prev.scrollDownCount + 1 : prev.scrollDownCount,
        };
        statsRef.current = next;
        return next;
      });
      setScore((prev) => prev + 1);
      checkAchievements();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Spacebar as click
      if (e.code === 'Space') {
        e.preventDefault();
        setStats((prev) => {
          const next = { ...prev, spacebarClicks: prev.spacebarClicks + 1 };
          statsRef.current = next;
          return next;
        });
        handleButtonClickInternal('blue');
      }

      // Modifier tracking
      if (e.shiftKey) {
        setStats((prev) => ({ ...prev, shiftClicks: prev.shiftClicks + 1 }));
      }
      if (e.ctrlKey) {
        setStats((prev) => ({ ...prev, ctrlClicks: prev.ctrlClicks + 1 }));
      }
      if (e.altKey) {
        setStats((prev) => ({ ...prev, altClicks: prev.altClicks + 1 }));
      }

      // Konami Code Sequence: Up, Up, Down, Down, Left, Right, Left, Right, b, a
      const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
      konamiSeqRef.current.push(e.key.toLowerCase());
      if (konamiSeqRef.current.length > konami.length) konamiSeqRef.current.shift();

      if (konamiSeqRef.current.join(',').toLowerCase() === konami.map(k => k.toLowerCase()).join(',')) {
        setStats((prev) => ({ ...prev, konamiTriggered: true }));
        setScore((prev) => prev + 1000);
        audio.playAchievementUnlock('diamond');
        checkAchievements();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      setStats((prev) => ({ ...prev, rightClicks: prev.rightClicks + 1 }));
      setScore((prev) => prev + 5);
      checkAchievements();
    };

    window.addEventListener('wheel', handleWheel);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [checkAchievements]);

  // Click handler on center button
  const handleButtonClickInternal = (currentColor: string) => {
    const now = Date.now();
    recentClicksRef.current.push(now);

    // Combo mechanic
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    const nextCombo = combo + 1;
    setCombo(nextCombo);

    // Multiplier scales from 1.0x to 3.5x
    const multiplier = Math.min(3.5, 1 + nextCombo * 0.05);

    // Sound
    audio.playClick(nextCombo, currentColor);

    // Score
    const addedScore = 10 * multiplier;
    setScore((prev) => prev + addedScore);

    // Stats
    const isGreen = currentColor === 'green';
    setStats((prev) => {
      const nextTotal = prev.totalClicks + 1;
      const nextButtonClicks = prev.buttonClicks + 1;
      const nextGreen = isGreen ? prev.greenButtonClicks + 1 : prev.greenButtonClicks;
      const nextMaxCombo = Math.max(prev.maxCombo, nextCombo);

      const next: GameStats = {
        ...prev,
        totalClicks: nextTotal,
        buttonClicks: nextButtonClicks,
        greenButtonClicks: nextGreen,
        currentCombo: nextCombo,
        maxCombo: nextMaxCombo,
        score: scoreRef.current + addedScore,
      };
      statsRef.current = next;
      return next;
    });

    // Reset combo after 1.4s of inactivity
    comboTimerRef.current = setTimeout(() => {
      setCombo(0);
    }, 1400);

    checkAchievements();
    scheduleCloudSync();

    // Trigger AI speech on fast spam or notable milestones
    if (nextCombo === 20 || nextCombo === 50) {
      requestAICommentary('rapid_clicking');
    }
  };

  const handleButtonClick = (e: React.MouseEvent, color: string) => {
    handleButtonClickInternal(color);
  };

  const handleButtonHoldProgress = (sec: number) => {
    setStats((prev) => {
      const next = {
        ...prev,
        buttonHoldSeconds: sec,
        maxButtonHoldSeconds: Math.max(prev.maxButtonHoldSeconds, sec),
      };
      statsRef.current = next;
      return next;
    });
    setScore((prev) => prev + sec * 2);
    checkAchievements();
  };

  const handleColorChange = (newColor: 'blue' | 'green' | 'cyan' | 'indigo') => {
    setButtonColor(newColor);
    setStats((prev) => {
      const next = { ...prev, themeColorSwitches: prev.themeColorSwitches + 1 };
      statsRef.current = next;
      return next;
    });
    checkAchievements();
    scheduleCloudSync();
  };

  // Background clicks count
  const handleBackgroundClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('#core-center-button') || target.closest('button') || target.closest('input')) {
      return;
    }
    recentClicksRef.current.push(Date.now());
    setScore((prev) => prev + 2);
    setStats((prev) => {
      const next = {
        ...prev,
        totalClicks: prev.totalClicks + 1,
        nonButtonClicks: prev.nonButtonClicks + 1,
      };
      statsRef.current = next;
      return next;
    });
    checkAchievements();
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    const payload = {
      code: cloudCode,
      score: scoreRef.current,
      totalClicks: statsRef.current.totalClicks,
      distanceTraveled: statsRef.current.totalDistance,
      achievements: Array.from(unlockedSetRef.current),
      stats: statsRef.current,
      personalityTitle,
    };
    try {
      const res = await fetch(`/api/sync/${cloudCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsCloudSynced(true);
        setLastSyncedTime(Date.now());
      }
    } catch (e) {}
    setIsSyncing(false);
  };

  const handleGenerateNewCode = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setCloudCode(newCode);
    window.location.hash = `#${newCode}`;
    scheduleCloudSync();
  };

  const handleShareRecorded = () => {
    setStats((prev) => {
      const next = { ...prev, statsSharedCount: prev.statsSharedCount + 1 };
      statsRef.current = next;
      return next;
    });
    setScore((prev) => prev + 100);
    checkAchievements();
    scheduleCloudSync();
  };

  return (
    <div
      onClick={handleBackgroundClick}
      className="relative min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col justify-between overflow-x-hidden selection:bg-blue-100 selection:text-blue-700"
    >
      {/* Dynamic Cursor Trail and Visual Shape Detection Overlay */}
      <MouseCanvasOverlay
        lastStraightLine={lastStraightLine}
        lastShake={lastShake}
      />

      {/* Top HUD: Score, Achievements, Live CPS, Cloud Badge */}
      <StatsHUD
        score={score}
        stats={stats}
        totalAchievements={ALL_ACHIEVEMENTS.length}
        unlockedCount={unlockedSet.size}
        cloudCode={cloudCode}
        isCloudSynced={isCloudSynced}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenCloudSync={() => setIsCloudSyncOpen(true)}
      />

      {/* Middle Floating AI Behavioral Commentary & Psychoanalysis */}
      <div className="w-full z-20 my-2">
        <CommentatorBar
          commentary={commentary}
          personalityTitle={personalityTitle}
          roastMood={roastMood}
          voiceEnabled={voiceEnabled}
          soundFxEnabled={soundFxEnabled}
          isAnalyzing={isAnalyzingAI}
          onToggleVoice={() => {
            const next = !voiceEnabled;
            setVoiceEnabled(next);
            audio.setVoice(next);
            if (!next) audio.stopSpeaking();
          }}
          onToggleSoundFx={() => {
            const next = !soundFxEnabled;
            setSoundFxEnabled(next);
            audio.setSoundFx(next);
            setStats((prev) => ({ ...prev, soundToggles: prev.soundToggles + 1 }));
            checkAchievements();
          }}
          onReplayVoice={() => audio.speak(commentary, 'auto')}
          onRequestAnalysis={() => requestAICommentary('manual_request')}
        />
      </div>

      {/* Center Stage: The Minimalist Blue Core Button */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 z-20">
        <CenterButton
          buttonColor={buttonColor}
          combo={combo}
          multiplier={Math.min(3.5, 1 + combo * 0.05)}
          onButtonClick={handleButtonClick}
          onButtonHoldProgress={handleButtonHoldProgress}
          onColorChange={handleColorChange}
        />
      </main>

      {/* Footer Instructions & Hints */}
      <footer className="w-full max-w-4xl mx-auto px-4 py-3 z-20 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-xs border border-slate-200/80 text-[11px] sm:text-xs text-slate-500 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>
            คำใบ้: ลากเมาส์เป็นเส้นตรง • สั่นเคอร์เซอร์ • พักเมาส์นิ่งๆ • ปรับขนาดหน้าต่าง • หมุนลูกกลิ้ง • หรือกด Spacebar
          </span>
        </div>
      </footer>

      {/* Modals */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={ALL_ACHIEVEMENTS}
        unlockedSet={unlockedSet}
        unlockedTimestamps={unlockedTimestamps}
      />

      <ShareCardModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        score={score}
        stats={stats}
        totalAchievements={ALL_ACHIEVEMENTS.length}
        unlockedCount={unlockedSet.size}
        personalityTitle={personalityTitle}
        cloudCode={cloudCode}
        onShareRecorded={handleShareRecorded}
      />

      <CloudSyncModal
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
        cloudCode={cloudCode}
        isSyncing={isSyncing}
        lastSyncedTime={lastSyncedTime}
        score={score}
        unlockedCount={unlockedSet.size}
        onLoadFromCode={loadSaveData}
        onForceSync={handleForceSync}
        onGenerateNewCode={handleGenerateNewCode}
      />

      {/* Achievement Unlocked Toast Notification */}
      <AchievementToast
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
