import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Local persistent store for cloud sync codes
const DATA_DIR = path.join(process.cwd(), "data");
const SAVES_FILE = path.join(DATA_DIR, "cloud_saves.json");

interface CloudSaveData {
  code: string;
  score: number;
  totalClicks: number;
  distanceTraveled: number;
  achievements: string[];
  stats: Record<string, any>;
  personalityTitle?: string;
  updatedAt: number;
}

const memorySaves: Map<string, CloudSaveData> = new Map();

// Initialize disk storage
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(SAVES_FILE)) {
    const raw = fs.readFileSync(SAVES_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    for (const [key, val] of Object.entries(parsed)) {
      memorySaves.set(key, val as CloudSaveData);
    }
    console.log(`[Storage] Loaded ${memorySaves.size} cloud saves from disk.`);
  }
} catch (err) {
  console.warn("[Storage] Error reading initial saves, starting fresh:", err);
}

function persistSavesToDisk() {
  try {
    const obj: Record<string, CloudSaveData> = {};
    for (const [k, v] of memorySaves.entries()) {
      obj[k] = v;
    }
    fs.writeFileSync(SAVES_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (err) {
    console.error("[Storage] Failed to persist saves:", err);
  }
}

// Cloud Sync Endpoints
app.get("/api/sync/:code", (req, res) => {
  const code = (req.params.code || "").trim().toUpperCase();
  if (!code) {
    return res.status(400).json({ success: false, message: "Invalid code" });
  }

  const found = memorySaves.get(code);
  if (found) {
    return res.json({ success: true, data: found });
  }

  return res.json({ success: false, message: "Code not found in cloud storage" });
});

app.post("/api/sync/:code", (req, res) => {
  const code = (req.params.code || "").trim().toUpperCase();
  if (!code || code.length < 3) {
    return res.status(400).json({ success: false, message: "Invalid code format" });
  }

  const { score, totalClicks, distanceTraveled, achievements, stats, personalityTitle } = req.body;

  const saveRecord: CloudSaveData = {
    code,
    score: Number(score) || 0,
    totalClicks: Number(totalClicks) || 0,
    distanceTraveled: Number(distanceTraveled) || 0,
    achievements: Array.isArray(achievements) ? achievements : [],
    stats: stats && typeof stats === "object" ? stats : {},
    personalityTitle: typeof personalityTitle === "string" ? personalityTitle : undefined,
    updatedAt: Date.now(),
  };

  memorySaves.set(code, saveRecord);
  persistSavesToDisk();

  return res.json({
    success: true,
    message: "Synced successfully",
    code,
    updatedAt: saveRecord.updatedAt,
  });
});

// Real-time AI Behavioral Psychoanalysis & Roast Endpoint
app.post("/api/gemini/analyze-behavior", async (req, res) => {
  const {
    clicks = 0,
    cps = 0,
    distance = 0,
    avgSpeed = 0,
    linearity = 0,
    shakiness = 0,
    idleSeconds = 0,
    recentAction = "cursor_move",
    locale = "th-TH",
    currentTitle = "นักสำรวจหน้าจอสีฟ้า",
  } = req.body;

  const isThai = typeof locale === "string" && locale.toLowerCase().startsWith("th");

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Dynamic rule-based witty fallback
    const fallback = generateFallbackCommentary({
      clicks,
      cps,
      distance,
      avgSpeed,
      linearity,
      shakiness,
      idleSeconds,
      recentAction,
      isThai,
    });
    return res.json(fallback);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const prompt = `You are a witty, charismatic, observational AI psychologist and commentator analyzing the player's mouse/screen telemetry in a minimalist blue button web game.
User telemetry:
- Total Clicks: ${clicks}
- Current Click Speed: ${cps.toFixed(1)} clicks/sec
- Mouse Distance Traveled: ${Math.round(distance)} px
- Average Speed: ${Math.round(avgSpeed)} px/s
- Linearity Score (Straightness): ${(linearity * 100).toFixed(1)}%
- Shakiness/Jitter Score: ${(shakiness * 100).toFixed(1)}%
- Idle Duration: ${idleSeconds}s
- Recent Notable Action: ${recentAction}
- Current Player Title: ${currentTitle}
- Target Language: ${isThai ? "Thai (ภาษาไทย)" : "English"}

Give:
1. commentary: A punchy, hilarious 1-2 sentence real-time voice-friendly observation/roast/psychoanalysis of their mouse habits and psychological state. Make it natural to speak aloud!
2. personalityTitle: A cool or humorous 2-4 word personality title/archetype.
3. roastMood: one of "teasing", "impressed", "amused", "mystical", "worried".

Output ONLY valid JSON in format:
{
  "commentary": "string",
  "personalityTitle": "string",
  "roastMood": "teasing"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    const text = response.text?.trim() || "";
    const parsed = JSON.parse(text);
    return res.json({
      commentary: parsed.commentary || "สังเกตการณ์การเคลื่อนไหวของคุณอยู่นะ...",
      personalityTitle: parsed.personalityTitle || "นักทดลองเมาส์",
      roastMood: parsed.roastMood || "amused",
    });
  } catch (err: any) {
    console.error("[Gemini Error]", err?.message || err);
    const fallback = generateFallbackCommentary({
      clicks,
      cps,
      distance,
      avgSpeed,
      linearity,
      shakiness,
      idleSeconds,
      recentAction,
      isThai,
    });
    return res.json(fallback);
  }
});

function generateFallbackCommentary(params: {
  clicks: number;
  cps: number;
  distance: number;
  avgSpeed: number;
  linearity: number;
  shakiness: number;
  idleSeconds: number;
  recentAction: string;
  isThai: boolean;
}) {
  const { cps, linearity, shakiness, idleSeconds, recentAction, isThai } = params;

  if (isThai) {
    if (recentAction === "resize") {
      return {
        commentary: "ยืดหดหน้าจอแบบนี้ กำลังมองหามิติคู่ขนานหรือแค่หาปุ่มไม่เจอครับเนี่ย?",
        personalityTitle: "สถาปนิกจัดขอบจอ",
        roastMood: "teasing",
      };
    }
    if (linearity > 0.85) {
      return {
        commentary: "มือตรงเป๊ะเหมือนทาบไม้บรรทัดมา จิตใจคุณนิ่งสงบเกินมนุษย์แล้ว!",
        personalityTitle: "ปรมาจารย์เรขาคณิต",
        roastMood: "impressed",
      };
    }
    if (shakiness > 0.7) {
      return {
        commentary: "เมาส์สั่นขนาดนี้ แผ่นดินไหว 8 ริกเตอร์ หรือคาเฟอีนล้นกระแสเลือดกันแน่?",
        personalityTitle: "ผู้ขับเคลื่อนคลื่นสั่นสะเทือน",
        roastMood: "worried",
      };
    }
    if (cps > 8) {
      return {
        commentary: "นิ้วกลองระดับพระกาฬชัดๆ ปุ่มสีฟ้าเริ่มร้อนจนเกือบไหม้แล้วนะ!",
        personalityTitle: "สไนเปอร์สปีดคลิก",
        roastMood: "impressed",
      };
    }
    if (idleSeconds > 5) {
      return {
        commentary: "นิ่งสงัดดั่งเซน... กำลังเข้าฌานหรือลืมไปแล้วว่าเปิดเว็บนี้ทิ้งไว้?",
        personalityTitle: "นักบวชผู้หยุดเวลา",
        roastMood: "mystical",
      };
    }
    if (recentAction === "circle") {
      return {
        commentary: "วนรอบปุ่มเป็นวงกลมแบบนี้ กำลังร่ายพิธีกรรมอัญเชิญคะแนนอยู่ใช่ไหม?",
        personalityTitle: "ผู้ประกอบพิธีกรรมเมาส์",
        roastMood: "amused",
      };
    }
    return {
      commentary: "ทุกการสะบัดเมาส์ของคุณ กำลังถูกจดบันทึกเป็นวิทยาศาสตร์การกดปุ่ม!",
      personalityTitle: "นักสำรวจปุ่มสีฟ้า",
      roastMood: "amused",
    };
  } else {
    if (recentAction === "resize") {
      return {
        commentary: "Resizing the viewport? Are you inspecting quantum dimensions or just testing responsive layouts?",
        personalityTitle: "Viewport Architect",
        roastMood: "teasing",
      };
    }
    if (linearity > 0.85) {
      return {
        commentary: "Laser-straight precision! Did you swallow a digital ruler before playing?",
        personalityTitle: "Geometric Virtuoso",
        roastMood: "impressed",
      };
    }
    if (shakiness > 0.7) {
      return {
        commentary: "That frantic cursor shake suggests either 5 espressos or pure adrenaline!",
        personalityTitle: "Vibrational Storm",
        roastMood: "worried",
      };
    }
    if (cps > 8) {
      return {
        commentary: "Incredible rapid-fire clicks! The blue button might need cooling fans soon.",
        personalityTitle: "Gatling Clicker",
        roastMood: "impressed",
      };
    }
    if (idleSeconds > 5) {
      return {
        commentary: "Complete stillness. Are you achieving digital enlightenment or grabbing snacks?",
        personalityTitle: "Zen Contemplator",
        roastMood: "mystical",
      };
    }
    return {
      commentary: "Every subtle flick of your cursor tells a deep psychological tale.",
      personalityTitle: "Blue Button Pioneer",
      roastMood: "amused",
    };
  }
}

// Start Server with Vite or Static
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Blue Button app running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
