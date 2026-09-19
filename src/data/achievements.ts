import { Achievement, AchievementCategory, AchievementTier } from '../types';

export const CATEGORY_LABELS: Record<AchievementCategory, { th: string; en: string; icon: string }> = {
  clicks: { th: 'การคลิกและปุ่ม', en: 'Clicks & Button', icon: 'MousePointer' },
  speed: { th: 'ความเร็วและคอมโบ', en: 'Speed & Combos', icon: 'Zap' },
  geometry: { th: 'เส้นตรงและเรขาคณิต', en: 'Lines & Geometry', icon: 'Ruler' },
  distance: { th: 'ระยะทางเมาส์', en: 'Travel & Velocity', icon: 'Compass' },
  window: { th: 'ขอบจอและขนาดหน้าต่าง', en: 'Screen & Viewport', icon: 'Maximize2' },
  gestures: { th: 'สั่น วงกลม และสมาธิ', en: 'Gestures & Zen', icon: 'Sparkles' },
  controls: { th: 'คีย์ลัดและควบคุม', en: 'Keys & Mechanics', icon: 'Keyboard' },
  mastery: { th: 'เกียรติยศและคลาวด์', en: 'Mastery & Cloud', icon: 'Trophy' },
};

function determineTier(index: number, total: number): AchievementTier {
  const ratio = index / total;
  if (ratio < 0.35) return 'bronze';
  if (ratio < 0.65) return 'silver';
  if (ratio < 0.85) return 'gold';
  if (ratio < 0.96) return 'platinum';
  return 'diamond';
}

function getTierPoints(tier: AchievementTier): number {
  switch (tier) {
    case 'bronze': return 25;
    case 'silver': return 75;
    case 'gold': return 200;
    case 'platinum': return 500;
    case 'diamond': return 1500;
  }
}

// Generate the 520+ achievements
function buildAchievements(): Achievement[] {
  const list: Achievement[] = [];

  // ==========================================
  // 1. CLICKS (84 achievements)
  // ==========================================
  const clickMilestones = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    12, 15, 18, 20, 25, 30, 35, 40, 45, 50,
    60, 70, 80, 90, 100, 125, 150, 175, 200, 250,
    300, 350, 400, 450, 500, 600, 700, 800, 900, 1000,
    1200, 1500, 1800, 2000, 2500, 3000, 3500, 4000, 4500, 5000,
    6000, 7000, 8000, 9000, 10000, 12500, 15000, 20000, 25000, 30000,
    40000, 50000, 75000, 100000
  ];

  clickMilestones.forEach((target, idx) => {
    const tier = determineTier(idx, clickMilestones.length);
    list.push({
      id: `click_total_${target}`,
      category: 'clicks',
      titleTh: target === 1 ? 'ก้าวแรกแห่งการคลิก' : `นักคลิกขั้นที่ ${idx + 1} (${target.toLocaleString()})`,
      titleEn: target === 1 ? 'First Click' : `Click Tier ${idx + 1} (${target.toLocaleString()})`,
      descTh: `คลิกหน้าจอสะสมครบ ${target.toLocaleString()} ครั้ง`,
      descEn: `Accumulate ${target.toLocaleString()} total clicks across the screen`,
      points: getTierPoints(tier),
      tier,
      iconName: 'MousePointer',
      check: (s) => s.totalClicks >= target,
    });
  });

  // Button clicks specifically
  const buttonMilestones = [5, 15, 30, 50, 100, 200, 500, 1000, 2500, 5000];
  buttonMilestones.forEach((target, idx) => {
    const tier = determineTier(idx, buttonMilestones.length);
    list.push({
      id: `click_button_${target}`,
      category: 'clicks',
      titleTh: `ผู้จงรักภักดีต่อปุ่มกลาง (${target})`,
      titleEn: `Center Button Devotee (${target})`,
      descTh: `คลิกที่ปุ่มกลางกลมๆ โดยตรงครบ ${target.toLocaleString()} ครั้ง`,
      descEn: `Click the center circular button directly ${target.toLocaleString()} times`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Target',
      check: (s) => s.buttonClicks >= target,
    });
  });

  // Green button clicks (as user specifically mentioned "คลิกปุ่มสีเขียวตรงกลาง")
  const greenMilestones = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2000];
  greenMilestones.forEach((target, idx) => {
    const tier = determineTier(idx, greenMilestones.length);
    list.push({
      id: `click_green_${target}`,
      category: 'clicks',
      titleTh: `แสงสีเขียวแห่งมรกต (${target})`,
      titleEn: `Emerald Spark (${target})`,
      descTh: `สลับปุ่มเป็นสีเขียวแล้วกดครบ ${target.toLocaleString()} ครั้ง`,
      descEn: `Switch button to green mode and click ${target.toLocaleString()} times`,
      points: getTierPoints(tier),
      tier,
      iconName: 'CheckCircle2',
      check: (s) => s.greenButtonClicks >= target,
    });
  });

  // ==========================================
  // 2. SPEED & COMBOS (67 achievements)
  // ==========================================
  // CPS milestones (2 to 20 CPS)
  for (let cps = 2; cps <= 20; cps++) {
    const tier = determineTier(cps - 2, 19);
    list.push({
      id: `speed_cps_${cps}`,
      category: 'speed',
      titleTh: `ความเร็วคลิก ${cps} CPS`,
      titleEn: `Velocity Burst: ${cps} CPS`,
      descTh: `ทำความเร็วการคลิกถึง ${cps} ครั้งต่อวินาที`,
      descEn: `Reach a click speed of ${cps} clicks per second`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Zap',
      check: (s) => s.maxCPS >= cps,
    });
  }

  // Combos
  const comboMilestones = [3, 5, 8, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 400, 500];
  comboMilestones.forEach((combo, idx) => {
    const tier = determineTier(idx, comboMilestones.length);
    list.push({
      id: `speed_combo_${combo}`,
      category: 'speed',
      titleTh: `คอมโบไร้รอยต่อ x${combo}`,
      titleEn: `Unbroken Rhythm x${combo}`,
      descTh: `คลิกต่อเนื่องอย่างสม่ำเสมอจนได้คอมโบ x${combo}`,
      descEn: `Maintain continuous rhythm to reach x${combo} combo streak`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Flame',
      check: (s) => s.maxCombo >= combo,
    });
  });

  // Double and triple clicks
  const doubleMilestones = [1, 5, 10, 20, 35, 50, 75, 100, 150, 200];
  doubleMilestones.forEach((val, idx) => {
    const tier = determineTier(idx, doubleMilestones.length);
    list.push({
      id: `speed_double_${val}`,
      category: 'speed',
      titleTh: `ดับเบิ้ลคลิกสายฟ้า (${val})`,
      titleEn: `Lightning Double Click (${val})`,
      descTh: `ดับเบิ้ลคลิกด้วยความเร็วสูงสะสมครบ ${val} ครั้ง`,
      descEn: `Perform high-speed double clicks ${val} times`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Activity',
      check: (s) => s.doubleClicks >= val,
    });
  });

  // Hold button
  const holdMilestones = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20, 25, 30, 45, 60, 90, 120];
  holdMilestones.forEach((sec, idx) => {
    const tier = determineTier(idx, holdMilestones.length);
    list.push({
      id: `speed_hold_${sec}`,
      category: 'speed',
      titleTh: `การกดยึดเหนี่ยว ${sec} วินาที`,
      titleEn: `Press & Hold: ${sec}s`,
      descTh: `กดปุ่มค้างไว้อย่างแน่วแน่เป็นเวลา ${sec} วินาที`,
      descEn: `Hold down the central button for ${sec} continuous seconds`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Clock',
      check: (s) => s.maxButtonHoldSeconds >= sec,
    });
  });

  // ==========================================
  // 3. GEOMETRY & STRAIGHT LINES (64 achievements)
  // User explicitly asked: "การขยับเคอร์เซอร์เป็นเส้นตรง"
  // ==========================================
  const straightLineMilestones = [
    1, 2, 3, 5, 8, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300
  ];
  straightLineMilestones.forEach((cnt, idx) => {
    const tier = determineTier(idx, straightLineMilestones.length);
    list.push({
      id: `geom_straight_${cnt}`,
      category: 'geometry',
      titleTh: `เส้นตรงแห่งความเที่ยงตรง (${cnt})`,
      titleEn: `Straight Line Virtuoso (${cnt})`,
      descTh: `ลากเคอร์เซอร์เป็นเส้นตรงคมชัดสะสมครบ ${cnt} ครั้ง`,
      descEn: `Draw crisp, straight cursor paths ${cnt} times`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Ruler',
      check: (s) => s.straightLineCount >= cnt,
    });
  });

  // Horizontal lines
  const horizontalMilestones = [1, 3, 5, 10, 15, 25, 40, 60, 80, 100, 150, 200];
  horizontalMilestones.forEach((cnt, idx) => {
    const tier = determineTier(idx, horizontalMilestones.length);
    list.push({
      id: `geom_horizontal_${cnt}`,
      category: 'geometry',
      titleTh: `เส้นขอบฟ้าแนวนอน (${cnt})`,
      titleEn: `Horizon Runner (${cnt})`,
      descTh: `ลากเมาส์เป็นเส้นตรงแนวนอนอย่างสมบูรณ์แบบ ${cnt} ครั้ง`,
      descEn: `Perform pure horizontal straight cursor strokes ${cnt} times`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Minus',
      check: (s) => s.horizontalStraightLines >= cnt,
    });
  });

  // Vertical lines
  const verticalMilestones = [1, 3, 5, 10, 15, 25, 40, 60, 80, 100, 150, 200];
  verticalMilestones.forEach((cnt, idx) => {
    const tier = determineTier(idx, verticalMilestones.length);
    list.push({
      id: `geom_vertical_${cnt}`,
      category: 'geometry',
      titleTh: `น้ำตกแนวดิ่ง (${cnt})`,
      titleEn: `Vertical Plunge (${cnt})`,
      descTh: `ลากเมาส์เป็นเส้นตรงแนวดิ่งจากบนลงล่างหรือล่างขึ้นบน ${cnt} ครั้ง`,
      descEn: `Perform pure vertical straight cursor strokes ${cnt} times`,
      points: getTierPoints(tier),
      tier,
      iconName: 'ArrowDown',
      check: (s) => s.verticalStraightLines >= cnt,
    });
  });

  // Straight line length single stroke
  const lengthMilestones = [
    150, 250, 350, 500, 650, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2500, 3000, 4000, 5000, 7500, 10000, 15000, 20000
  ];
  lengthMilestones.forEach((len, idx) => {
    const tier = determineTier(idx, lengthMilestones.length);
    list.push({
      id: `geom_length_${len}`,
      category: 'geometry',
      titleTh: `เส้นตรงยาว ${len}px`,
      titleEn: `Super-Line ${len}px`,
      descTh: `ลากเส้นตรงเส้นเดียวแบบไม่สะดุดยาวถึง ${len.toLocaleString()} พิกเซล`,
      descEn: `Complete a single uninterrupted straight line of ${len.toLocaleString()} pixels`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Maximize',
      check: (s) => s.maxStraightLineLength >= len,
    });
  });

  // ==========================================
  // 4. DISTANCE & VELOCITY (62 achievements)
  // ==========================================
  const distanceMilestones = [
    500, 1000, 2000, 3500, 5000, 7500, 10000, 15000, 20000, 25000,
    30000, 40000, 50000, 60000, 75000, 100000, 125000, 150000, 200000, 250000,
    300000, 400000, 500000, 600000, 750000, 1000000, 1250000, 1500000, 2000000, 2500000,
    3000000, 4000000, 5000000, 6000000, 7500000, 10000000, 15000000, 20000000, 30000000, 50000000
  ];
  distanceMilestones.forEach((dist, idx) => {
    const tier = determineTier(idx, distanceMilestones.length);
    const km = (dist / 3779.5).toFixed(2); // approximate screen px to meters
    list.push({
      id: `dist_travel_${dist}`,
      category: 'distance',
      titleTh: `นักท่องหน้าจอ (${dist >= 1000000 ? `${(dist / 1000000).toFixed(1)}M px` : `${(dist / 1000).toFixed(0)}k px`})`,
      titleEn: `Screen Odyssey (${dist >= 1000000 ? `${(dist / 1000000).toFixed(1)}M px` : `${(dist / 1000).toFixed(0)}k px`})`,
      descTh: `สะสมระยะทางการเคลื่อนที่ของเมาส์ครบ ${dist.toLocaleString()} พิกเซล (ประมาณ ${km} ม.)`,
      descEn: `Accumulate ${dist.toLocaleString()} px cursor travel distance (~${km}m)`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Compass',
      check: (s) => s.totalDistance >= dist,
    });
  });

  // Max Speed / Velocity (px per sec)
  const speedMilestones = [
    500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 5000, 6000,
    7500, 9000, 10000, 12500, 15000, 18000, 20000, 25000, 30000, 40000, 50000, 75000
  ];
  speedMilestones.forEach((spd, idx) => {
    const tier = determineTier(idx, speedMilestones.length);
    list.push({
      id: `dist_speed_${spd}`,
      category: 'distance',
      titleTh: `สะบัดเมาส์ความเร็ว ${spd.toLocaleString()} px/s`,
      titleEn: `Mach Cursor: ${spd.toLocaleString()} px/s`,
      descTh: `สะบัดเมาส์ด้วยความเร็วชั่วขณะแตะ ${spd.toLocaleString()} พิกเซลต่อวินาที`,
      descEn: `Flick cursor at an instantaneous speed of ${spd.toLocaleString()} px/s`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Gauge',
      check: (s) => s.maxSpeed >= spd,
    });
  });

  // ==========================================
  // 5. WINDOW & SCREEN (60 achievements)
  // User explicitly asked: "การปรับขนาดหน้าต่างเบราว์เซอร์"
  // ==========================================
  const resizeMilestones = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    12, 15, 18, 20, 25, 30, 35, 40, 45, 50,
    60, 70, 80, 90, 100, 125, 150, 175, 200, 250
  ];
  resizeMilestones.forEach((cnt, idx) => {
    const tier = determineTier(idx, resizeMilestones.length);
    list.push({
      id: `win_resize_${cnt}`,
      category: 'window',
      titleTh: `ผู้บิดเบือนมิติหน้าต่าง (${cnt})`,
      titleEn: `Viewport Morphing (${cnt})`,
      descTh: `ปรับขนาดหน้าต่างเบราว์เซอร์สะสมครบ ${cnt} ครั้ง`,
      descEn: `Resize the browser window dimensions ${cnt} times`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Maximize2',
      check: (s) => s.windowResizeCount >= cnt,
    });
  });

  // Corner visits
  const cornerMilestones = [1, 2, 4, 8, 12, 16, 20, 25, 30, 40, 50, 75, 100, 150, 200];
  cornerMilestones.forEach((cnt, idx) => {
    const tier = determineTier(idx, cornerMilestones.length);
    list.push({
      id: `win_corner_${cnt}`,
      category: 'window',
      titleTh: `ผู้เยือนสี่มุมจอ (${cnt})`,
      titleEn: `Corner Scout (${cnt})`,
      descTh: `เลื่อนเมาส์ไปแตะมุมทั้ง 4 ของหน้าจอสะสมครบ ${cnt} ครั้ง`,
      descEn: `Move cursor to touch display corners ${cnt} times`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Square',
      check: (s) => s.cornersVisited >= cnt,
    });
  });

  // Edge touches
  const edgeMilestones = [1, 5, 10, 15, 25, 35, 50, 75, 100, 150, 200, 250, 300, 400, 500];
  edgeMilestones.forEach((cnt, idx) => {
    const tier = determineTier(idx, edgeMilestones.length);
    list.push({
      id: `win_edge_${cnt}`,
      category: 'window',
      titleTh: `เลียบขอบหน้าจอ (${cnt})`,
      titleEn: `Edge Hugger (${cnt})`,
      descTh: `เลื่อนเมาส์ไปสัมผัสขอบจอซ้าย ขวา บน ล่าง สะสมครบ ${cnt} ครั้ง`,
      descEn: `Touch screen perimeter edges ${cnt} times`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Layout',
      check: (s) => s.edgeTouches >= cnt,
    });
  });

  // ==========================================
  // 6. GESTURES, SHAKES & ZEN (66 achievements)
  // ==========================================
  // Mouse shakes (frantic wiggling)
  const shakeMilestones = [
    1, 2, 3, 5, 8, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300
  ];
  shakeMilestones.forEach((cnt, idx) => {
    const tier = determineTier(idx, shakeMilestones.length);
    list.push({
      id: `gest_shake_${cnt}`,
      category: 'gestures',
      titleTh: `คลื่นสั่นไหวระดับแผ่นดินไหว (${cnt})`,
      titleEn: `Seismic Jitter (${cnt})`,
      descTh: `สั่นหรือกระตุกเมาส์ไปมาอย่างรวดเร็วสะสมครบ ${cnt} ครั้ง`,
      descEn: `Rapidly shake or wiggle cursor back and forth ${cnt} times`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Activity',
      check: (s) => s.shakeCount >= cnt,
    });
  });

  // Circling around button
  const circleMilestones = [
    1, 2, 3, 5, 8, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300
  ];
  circleMilestones.forEach((cnt, idx) => {
    const tier = determineTier(idx, circleMilestones.length);
    list.push({
      id: `gest_circle_${cnt}`,
      category: 'gestures',
      titleTh: `วงโคจรรอบปุ่มฟ้า (${cnt})`,
      titleEn: `Orbital Trajectory (${cnt})`,
      descTh: `วาดเมาส์เป็นวงกลมล้อมรอบปุ่มสีฟ้าตรงกลางครบ ${cnt} รอบ`,
      descEn: `Trace smooth orbital circles around the center blue button ${cnt} times`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Circle',
      check: (s) => s.circleCount >= cnt,
    });
  });

  // Zen Stillness (Seconds of not moving mouse at all)
  const zenMilestones = [
    2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 18, 20, 25, 30, 40, 50, 60, 75, 90, 120, 150, 180, 240, 300, 360, 480
  ];
  zenMilestones.forEach((sec, idx) => {
    const tier = determineTier(idx, zenMilestones.length);
    list.push({
      id: `gest_zen_${sec}`,
      category: 'gestures',
      titleTh: `ฌานแห่งความนิ่งสงบ ${sec} วินาที`,
      titleEn: `Zen Stillness: ${sec}s`,
      descTh: `วางเมาส์นิ่งสนิทโดยไม่ขยับเลยเป็นเวลา ${sec} วินาที`,
      descEn: `Leave the mouse completely motionless for ${sec} continuous seconds`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Moon',
      check: (s) => s.maxIdleSeconds >= sec,
    });
  });

  // ==========================================
  // 7. KEYS & MECHANICS (62 achievements)
  // ==========================================
  // Spacebar clicks
  const spaceMilestones = [1, 2, 5, 10, 20, 35, 50, 75, 100, 150, 200, 300, 500, 750, 1000];
  spaceMilestones.forEach((cnt, idx) => {
    const tier = determineTier(idx, spaceMilestones.length);
    list.push({
      id: `ctrl_space_${cnt}`,
      category: 'controls',
      titleTh: `มือเคาะสเปซบาร์ (${cnt})`,
      titleEn: `Spacebar Tapper (${cnt})`,
      descTh: `กด Spacebar บนคีย์บอร์ดเพื่อสะสมคะแนนครบ ${cnt} ครั้ง`,
      descEn: `Tap the Spacebar key to trigger clicks ${cnt} times`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Space',
      check: (s) => s.spacebarClicks >= cnt,
    });
  });

  // Scroll wheel events
  const scrollMilestones = [
    5, 10, 20, 35, 50, 75, 100, 150, 200, 250, 300, 400, 500, 750, 1000, 1500, 2000, 3000, 5000, 10000
  ];
  scrollMilestones.forEach((cnt, idx) => {
    const tier = determineTier(idx, scrollMilestones.length);
    list.push({
      id: `ctrl_scroll_${cnt}`,
      category: 'controls',
      titleTh: `กงล้อเลื่อนหน้าจอ (${cnt})`,
      titleEn: `Wheel Spinner (${cnt})`,
      descTh: `หมุนลูกกลิ้งเมาส์ (Scroll Wheel) ขึ้นหรือลงสะสมครบ ${cnt} ครั้ง`,
      descEn: `Roll your mouse scroll wheel up/down ${cnt} times`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Sliders',
      check: (s) => s.scrollCount >= cnt,
    });
  });

  // Shift & Ctrl clicks
  const modifierMilestones = [1, 5, 10, 25, 50, 100, 200, 500];
  modifierMilestones.forEach((cnt, idx) => {
    const tier = determineTier(idx, modifierMilestones.length);
    list.push({
      id: `ctrl_shift_${cnt}`,
      category: 'controls',
      titleTh: `การคลิกผสาน Shift (${cnt})`,
      titleEn: `Shift Modifier Click (${cnt})`,
      descTh: `กด Shift ค้างไว้แล้วคลิกครบ ${cnt} ครั้ง`,
      descEn: `Hold Shift while clicking ${cnt} times`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Key',
      check: (s) => s.shiftClicks >= cnt,
    });
  });

  // Right clicks
  const rightMilestones = [1, 3, 5, 10, 20, 35, 50, 75, 100, 150];
  rightMilestones.forEach((cnt, idx) => {
    const tier = determineTier(idx, rightMilestones.length);
    list.push({
      id: `ctrl_right_${cnt}`,
      category: 'controls',
      titleTh: `คลิกขวาสำรวจ (${cnt})`,
      titleEn: `Right-Click Inspector (${cnt})`,
      descTh: `คลิกขวาบนหน้าจอสะสมครบ ${cnt} ครั้ง`,
      descEn: `Right-click anywhere on screen ${cnt} times`,
      points: getTierPoints(tier),
      tier,
      iconName: 'CornerDownRight',
      check: (s) => s.rightClicks >= cnt,
    });
  });

  // Konami Code Easter Egg
  list.push({
    id: 'ctrl_konami_secret',
    category: 'controls',
    titleTh: 'รหัสลับโคนามิแห่งตำนาน',
    titleEn: 'Legendary Konami Code',
    descTh: 'กด ↑ ↑ ↓ ↓ ← → ← → B A บนแป้นพิมพ์เพื่อเปิดความลับโบราณ!',
    descEn: 'Enter ↑ ↑ ↓ ↓ ← → ← → B A on keyboard to unlock ancient lore!',
    points: 1000,
    tier: 'diamond',
    iconName: 'Award',
    check: (s) => s.konamiTriggered,
  });

  // Sound toggles & color shifts
  const colorMilestones = [1, 3, 5, 10, 20, 30, 50, 100];
  colorMilestones.forEach((cnt, idx) => {
    const tier = determineTier(idx, colorMilestones.length);
    list.push({
      id: `ctrl_color_${cnt}`,
      category: 'controls',
      titleTh: `สลับสีสันแห่งปุ่ม (${cnt})`,
      titleEn: `Chameleon Switcher (${cnt})`,
      descTh: `สลับโทนสีปุ่ม (ฟ้า เขียว ฟ้าคราม ครามเข้ม) ครบ ${cnt} ครั้ง`,
      descEn: `Switch button color themes ${cnt} times`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Palette',
      check: (s) => s.themeColorSwitches >= cnt,
    });
  });

  // ==========================================
  // 8. MASTERY, SCORE & CLOUD (65 achievements)
  // ==========================================
  // Score milestones
  const scoreMilestones = [
    100, 250, 500, 1000, 2500, 5000, 10000, 20000, 35000, 50000,
    75000, 100000, 150000, 250000, 500000, 750000, 1000000, 2000000, 5000000, 10000000
  ];
  scoreMilestones.forEach((sc, idx) => {
    const tier = determineTier(idx, scoreMilestones.length);
    list.push({
      id: `mast_score_${sc}`,
      category: 'mastery',
      titleTh: `แต้มสะสมเกียรติยศ (${sc >= 1000000 ? `${(sc / 1000000).toFixed(0)}M` : `${(sc / 1000).toFixed(0)}k`})`,
      titleEn: `Prestige Score (${sc >= 1000000 ? `${(sc / 1000000).toFixed(0)}M` : `${(sc / 1000).toFixed(0)}k`})`,
      descTh: `ทำคะแนนรวมทุกกิจกรรมสะสมถึง ${sc.toLocaleString()} แต้ม`,
      descEn: `Reach ${sc.toLocaleString()} total cumulative activity score`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Trophy',
      check: (s) => s.score >= sc,
    });
  });

  // Achievement count milestones (Unlocking X achievements)
  const achMilestones = [
    5, 10, 20, 30, 40, 50, 60, 75, 100, 125, 150, 175, 200, 225, 250,
    275, 300, 325, 350, 375, 400, 425, 450, 475, 500
  ];
  achMilestones.forEach((cnt, idx) => {
    const tier = determineTier(idx, achMilestones.length);
    list.push({
      id: `mast_unlocked_${cnt}`,
      category: 'mastery',
      titleTh: cnt === 500 ? 'มหาศาสตราจารย์แห่งปุ่มฟ้า (500 ปลดล็อก!)' : `ปลดล็อกความสำเร็จครบ ${cnt} รายการ`,
      titleEn: cnt === 500 ? 'Grandmaster of the Blue Dot (500 Unlocked!)' : `Master Unlocked: ${cnt}`,
      descTh: `ปลดล็อกความสำเร็จในเกมรวมครบ ${cnt} รายการ`,
      descEn: `Unlock ${cnt} total achievements across the application`,
      points: getTierPoints(tier) * 2,
      tier,
      iconName: 'Crown',
      check: (s) => s.unlockedAchievementsCount >= cnt,
    });
  });

  // AI Voice Commentary listened
  const voiceMilestones = [1, 3, 5, 10, 15, 25, 40, 60, 80, 100];
  voiceMilestones.forEach((cnt, idx) => {
    const tier = determineTier(idx, voiceMilestones.length);
    list.push({
      id: `mast_voice_${cnt}`,
      category: 'mastery',
      titleTh: `ผู้สดับฟังคำวิจารณ์ AI (${cnt})`,
      titleEn: `AI Listener (${cnt})`,
      descTh: `รับฟังเสียงพากย์วิเคราะห์นิสัยและแซวพฤติกรรมสะสมครบ ${cnt} ครั้ง`,
      descEn: `Listen to ${cnt} AI behavioral voice psychoanalysis roasts`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Volume2',
      check: (s) => s.voiceCommentariesHeard >= cnt,
    });
  });

  // Cloud Sync & Hash transfer
  const syncMilestones = [1, 2, 5, 10, 20];
  syncMilestones.forEach((cnt, idx) => {
    const tier = determineTier(idx, syncMilestones.length);
    list.push({
      id: `mast_sync_${cnt}`,
      category: 'mastery',
      titleTh: `นักท่องคลาวด์ข้ามเครื่อง (${cnt})`,
      titleEn: `Cloud Hopper (${cnt})`,
      descTh: `ซิงค์และบันทึกข้อมูลความคืบหน้าขึ้นคลาวด์สะสมครบ ${cnt} ครั้ง`,
      descEn: `Sync and persist game progress to the cloud ${cnt} times`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Cloud',
      check: (s) => s.cloudSyncCount >= cnt,
    });
  });

  // Social Stats Sharing
  const shareMilestones = [1, 2, 3, 5, 10];
  shareMilestones.forEach((cnt, idx) => {
    const tier = determineTier(idx, shareMilestones.length);
    list.push({
      id: `mast_share_${cnt}`,
      category: 'mastery',
      titleTh: `โอ้อวดสถิติสู่โลกโซเชียล (${cnt})`,
      titleEn: `Social Showoff (${cnt})`,
      descTh: `เปิดหรือแชร์ภาพสถิติผลงานเพื่ออวดเพื่อนๆ ครบ ${cnt} ครั้ง`,
      descEn: `Export or share your beautiful stats image ${cnt} times`,
      points: getTierPoints(tier),
      tier,
      iconName: 'Share2',
      check: (s) => s.statsSharedCount >= cnt,
    });
  });

  return list;
}

export const ALL_ACHIEVEMENTS: Achievement[] = buildAchievements();

console.log(`[Achievements] Total catalog size: ${ALL_ACHIEVEMENTS.length} achievements ready.`);
