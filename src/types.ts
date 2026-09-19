export type AchievementCategory =
  | 'clicks'
  | 'speed'
  | 'geometry'
  | 'distance'
  | 'window'
  | 'gestures'
  | 'controls'
  | 'mastery';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface Achievement {
  id: string;
  category: AchievementCategory;
  titleTh: string;
  titleEn: string;
  descTh: string;
  descEn: string;
  points: number;
  tier: AchievementTier;
  iconName: string;
  check: (stats: GameStats) => boolean;
}

export interface GameStats {
  totalClicks: number;
  buttonClicks: number;
  nonButtonClicks: number;
  greenButtonClicks: number;
  rightClicks: number;
  doubleClicks: number;
  tripleClicks: number;
  maxCPS: number;
  currentCPS: number;
  currentCombo: number;
  maxCombo: number;
  
  // Distance & Movement
  totalDistance: number; // in pixels
  straightLineDistance: number; // in pixels
  maxStraightLineLength: number; // single stroke
  straightLineCount: number;
  horizontalStraightLines: number;
  verticalStraightLines: number;
  diagonalStraightLines: number;
  maxSpeed: number; // px per second
  shakeCount: number;
  circleCount: number;
  
  // Zen & Stillness
  idleSeconds: number;
  maxIdleSeconds: number;
  stillnessStreakCount: number;
  
  // Window & Screen
  windowResizeCount: number;
  windowWidthsVisited: number;
  cornersVisited: number;
  edgeTouches: number;
  
  // Keys & Controls
  spacebarClicks: number;
  shiftClicks: number;
  ctrlClicks: number;
  altClicks: number;
  scrollCount: number;
  scrollUpCount: number;
  scrollDownCount: number;
  konamiTriggered: boolean;
  buttonHoldSeconds: number;
  maxButtonHoldSeconds: number;
  soundToggles: number;
  themeColorSwitches: number;
  
  // Audio & AI
  voiceCommentariesHeard: number;
  statsSharedCount: number;
  cloudSyncCount: number;
  
  // Overall
  score: number;
  unlockedAchievementsCount: number;
}

export interface PlayerData {
  code: string;
  score: number;
  totalClicks: number;
  distanceTraveled: number;
  achievements: string[]; // array of unlocked achievement IDs
  unlockedTimestamps: Record<string, number>;
  stats: GameStats;
  personalityTitle: string;
  roastMood: 'teasing' | 'impressed' | 'amused' | 'mystical' | 'worried';
  lastCommentary: string;
  buttonColor: 'blue' | 'green' | 'cyan' | 'indigo';
  language: 'th' | 'en' | 'auto';
  voiceEnabled: boolean;
  soundFxEnabled: boolean;
}

export interface AICommentaryResponse {
  commentary: string;
  personalityTitle: string;
  roastMood: 'teasing' | 'impressed' | 'amused' | 'mystical' | 'worried';
}
