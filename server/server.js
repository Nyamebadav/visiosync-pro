import express from "express";
import ffmpegStatic from "ffmpeg-static";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 8787;

// Ã¢ââ¬Ã¢ââ¬ Security / production headers Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Ã¢ââ¬Ã¢ââ¬ CORS Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬
const allowedOrigins = [
  "https://www.medaseunitelle.com",
  "https://medaseunitelle.com",
  "http://localhost:8787",
  "http://localhost:3000",
];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

// Ã¢ââ¬Ã¢ââ¬ Body parsing Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬
app.use(express.json({ limit: "25mb" }));

// Ã¢ââ¬Ã¢ââ¬ Naive rate limiter (100 image requests per IP per minute) Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬
const ratemap = new Map();
function rateLimit(req, res, next) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
  const now = Date.now();
  const entry = ratemap.get(ip) || { count: 0, reset: now + 60_000 };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + 60_000; }
  entry.count++;
  ratemap.set(ip, entry);
  if (entry.count > 100) return res.status(429).json({ error: "Too many requests Ã¢â¬â slow down." });
  next();
}

// Ã¢ââ¬Ã¢ââ¬ Static frontend Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬
app.use(express.static(path.join(__dirname, "../public")));

// Ã¢ââ¬Ã¢ââ¬ Health check Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬
app.get("/health", (_req, res) => {
  const hasXai = Boolean(process.env.XAI_API_KEY);
  const hasClaude = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const hasQwen = Boolean(process.env.QWEN_API_KEY);
  const hasHF = Boolean(process.env.HF_API_KEY);
  res.json({
    ok: true,
    service: "VisioSync Pro Ã¢â¬â Medase Unitelle",
    port,
    hasXaiKey: hasXai,
    hasAnthropicKey: hasClaude,
    hasOpenAIKey: hasOpenAI,
    hasQwenKey: hasQwen,
    hasHFKey: hasHF,
    status: {
      claude: hasClaude ? "Ã¢Åâ Claude AI ready" : "Ã¢Åâ Add ANTHROPIC_API_KEY",
      chatgpt: hasOpenAI ? "Ã¢Åâ ChatGPT ready" : "Ã¢Åâ Add OPENAI_API_KEY",
      qwen: hasQwen ? "Ã¢Åâ Qwen ready" : "Ã¢Åâ Add QWEN_API_KEY",
      mimo: hasHF ? "Ã¢Åâ MiMo ready" : "Ã¢Åâ Add HF_API_KEY",
      imageGeneration: hasXai ? "Ã¢Åâ Grok Image ready" : "Ã¢Åâ Add XAI_API_KEY",
    },
  });
});

// Ã¢ââ¬Ã¢ââ¬ xAI / Grok image generation proxy<â¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬
app.post("/api/xai/images", rateLimit, async (req, res) => {
  try {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error:
          "XAI_API_KEY is not set. Add it to your environment variables (Railway/Render dashboard or server/.env) and redeploy.",
      });
    }

    const {
      prompt,
      n = 1,
      response_format = "url",
      model = "grok-imagine-image",
      size,
      aspect_ratio,
      quality,
    } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "prompt is required and must be a string." });
    }

    const body = {
      model,
      prompt,
      n: Math.max(1, Math.min(Number(n) || 1, 4)),
      response_format,
    };
    if (size) body.size = size;
    if (aspect_ratio) body.aspect_ratio = aspect_ratio;
    if (quality) body.quality = quality;

    const response = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(
body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          data?.error ||
          `xAI image generation failed (HTTP ${response.status})`,
        detail: data,
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Server error",
      hint: "Check your internet connection, xAI key validity, and that the server is running.",
    });
  }
});

// Ã¢ââ¬Ã¢ââ¬ xXAI Grok video generation Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬
// Start image-to-video or text-to-video job
app.post("/api/xai/videos/start", rateLimit, async (req, res) => {
  try {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "XAI_API_KEY is not set." });
    const { prompt, image_url, duration = 6, aspect_ratio = "16:9", resolution = "720p" } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "prompt is required." });
    const body = {
      model: "grok-imagine-video",
      prompt,
      duration: Math.min(10, Math.max(1, Number(duration) || 6)),
      aspect_ratio,
      resolution,
    };
    if (image_url) {
      const imgResp = await fetch(image_url);
      if (!imgResp.ok) throw new Error("Failed to fetch image for video generation.");
      const imgBuf = await imgResp.arrayBuffer();
      const mimeType = imgResp.headers.get("content-type") || "image/jpeg";
      const dataUri = "data:" + mimeType + ";base64," + Buffer.from(imgBuf).toString("base64");
      body.image = { url: dataUri };
      body.model = "grok-imagine-video-1.5";
    }
    const response = await fetch("https://api.x.ai/v1/videos/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || data?.error || `xAI error (HTTP ${response.status})`, detail: data });
    res.json({ request_id: data.request_id });
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// Poll status of a video generation job
app.get("/api/xai/videos/:requestId", async (req, res) => {
  try {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "XAI_API_KEY is not set." });
    const response = await fetch(`https://api.x.ai/v1/videos/${req.params.requestId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || `xAI error (HTTP ${response.status})` });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// Stitch video clips into a final MP4 using ffmpeg
app.post("/api/export/video", rateLimit, async (req, res) => {
  const { execFile } = await import("child_process");
  const { promises: fs, createReadStream } = await import("fs");
  const { tmpdir } = await import("os");
  const { promisify } = await import("util");
  const execFileAsync = promisify(execFile);
  const { clips, audio_url, audio_data } = req.body || {};
  if (!clips?.length) return res.status(400).json({ error: "clips array is required." });
  const tmp = path.join(tmpdir(), `vsync-${Date.now()}`);
  await fs.mkdir(tmp, { recursive: true });
  try {
    const clipPaths = [];
    for (let i = 0; i < clips.length; i++) {
      if (!clips[i]?.url) continue;
      const r = await fetch(clips[i].url);
      if (!r.ok) throw new Error(`Failed to download clip ${i + 1}`);
      const clipPath = path.join(tmp, `clip${i}.mp4`);
      await fs.writeFile(clipPath, Buffer.from(await r.arrayBuffer()));
      clipPaths.push(clipPath);
    }
    if (!clipPaths.length) throw new Error("No valid clip URLs provided.");
    const concatPath = path.join(tmp, "concat.txt");
    await fs.writeFile(concatPath, clipPaths.map(p => `file '${p}'`).join("\n"));
    const outputPath = path.join(tmp, "output.mp4");
    const hasAudio = audio_data || audio_url;
    if (hasAudio) {
      const audioPath = path.join(tmp, "audio.mp3");
      if (audio_data) {
        const b64 = audio_data.replace(/^data:audio\/[^;]+;base64,/, "");
        await fs.writeFile(audioPath, Buffer.from(b64, "base64"));
      } else {
        const ar = await fetch(audio_url);
        if (!ar.ok) throw new Error("Failed to download audio.");
        await fs.writeFile(audioPath, Buffer.from(await ar.arrayBuffer()));
      }
      await execFileAsync(ffmpegStatic, [
        "-stream_loop", "-1",
        "-f", "concat", "-safe", "0", "-i", concatPath,
        "-i", audioPath,
        "-map", "0:v", "-map", "1:a",
        "-c:v", "libx264", "-preset", "fast", "-crf", "23",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        "-y", outputPath,
      ]);
    } else {
      await execFileAsync(ffmpegStatic, [
        "-f", "concat", "-safe", "0", "-i", concatPath,
        "-c", "copy", "-y", outputPath,
      ]);
    }
    const stat = await fs.stat(outputPath);
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", 'attachment; filename="visiosync-music-video.mp4"');
    res.setHeader("Content-Length", stat.size);
    const stream = createReadStream(outputPath);
    stream.pipe(res);
    stream.on("end", () => fs.rm(tmp, { recursive: true, force: true }).catch(() => {}));
    stream.on("error", () => fs.rm(tmp, { recursive: true, force: true }).catch(() => {}));
  } catch (err) {
    await fs.rm(tmp, { recursive: true, force: true }).catch(() => {});
    res.status(500).json({ error: err.message || "Video export failed." });
  }
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/landing.html"));
});
app.get("/app", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});
app.get('/checkers', (req, res) => res.sendFile(path.join(__dirname, '../public', 'checkers.html')));
app.get('/sudoku', (req, res) => res.sendFile(path.join(__dirname, '../public', 'sudoku.html')));
app.get('/quantum-sudoku', (req, res) => res.sendFile(path.join(__dirname, '../public', 'quantum-sudoku.html')));
app.get('/cosmic-brick-breaker', (req, res) => res.sendFile(path.join(__dirname, '../public', 'cosmic_brick_breaker.html')));
app.get('/cosmic-checkers', (req, res) => res.sendFile(path.join(__dirname, '../public', 'cosmic_checkers.html')));
app.get('/cosmic-pinball', (req, res) => res.sendFile(path.join(__dirname, '../public', 'cosmic_pinball.html')));
app.get('/cosmic-sudoku', (req, res) => res.sendFile(path.join(__dirname, '../public', 'cosmic_sudoku.html')));

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});


// Ã¢ââ¬Ã¢ââ¬ Claude / Anthropic text generation proxy -Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬
app.post("/api/claude/generate", rateLimit, async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "ANTHROPIC_API_KEY is not set. Add it to your environment variables and redeploy.",
      });
    }

    const {
      prompt: directPrompt,
      type,
      topic,
      genre,
      mood,
      system = "You are a creative music video director who writes vivid, cinematic scene descriptions.",
      model = "claude-haiku-4-5-20251001",
      max_tokens = 1024,
    } = req.body || {};

    let prompt = directPrompt;
    if (!prompt && type) {
      if (type === "lyrics") {
        prompt = `Write original ${genre} ${mood} song lyrics about: "${topic}". Write exactly 12 vivid lines with emotion and imagery. Return only the lyrics, no commentary.`;
      } else if (type === "scenes") {
        prompt = `Return a JSON array of 8 music video scenes for a ${genre} ${mood} track about "${topic}". Each element: {"title":"...","fx":"zoom|cut|flash|fade|slide-left|glow|blur-in|speed-ramp","duration":4,"prompt":"detailed image generation prompt"}. Return ONLY valid JSON array, no explanation.`;
      } else if (type === "blueprint") {
        prompt = `Write a concise music production blueprint for a ${genre} ${mood} track about "${topic}". Cover: BPM range, musical key, core instruments, song structure (intro/verse/chorus/bridge/outro), and one sentence on the sonic vision. Keep it under 200 words.`;
      }
    }

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "prompt is required (or provide type, topic, genre, mood)." });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens,
        system,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || `Claude API failed (HTTP ${response.status})`,
        detail: data,
      });
    }

    const text = data.content?.[0]?.text || "";
    res.json({ text, ...data });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Server error",
      hint: "Check your Anthropic API key and network connectivity.",
    });
  }
});

// Ã¢ââ¬Ã¢ââ¬ OpenAI / ChatGPT text generation proxy Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬
app.post("/api/openai/generate", rateLimit, async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "OPENAI_API_KEY is not set. Add it to your Railway environment variables." });
    const { prompt: directPrompt, type, topic, genre, mood, system = "You are a creative music video director who writes vivid, cinematic content.", model = "gpt-4o-mini", max_tokens = 1024 } = req.body || {};
    let prompt = directPrompt;
    if (!prompt && type) {
      if (type === "lyrics") prompt = `Write original ${genre} ${mood} song lyrics about: "${topic}". Write exactly 12 vivid lines. Return only the lyrics.`;
      else if (type === "scenes") prompt = `Return a JSON array of 8 music video scenes for a ${genre} ${mood} track about "${topic}". Each: {"title":"...","fx":"zoom|cut|flash|fade","duration":4,"prompt":"image generation prompt"}. JSON only.`;
      else if (type === "blueprint") prompt = `Write a concise music production blueprint for a ${genre} ${mood} track about "${topic}". BPM, key, instruments, structure. Under 200 words.`;
    }
    if (!prompt) return res.status(400).json({ error: "prompt is required." });
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({ model, max_tokens, messages: [{ role: "system", content: system }, { role: "user", content: prompt }] }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || `OpenAI error (HTTP ${response.status})` });
    res.json({ text: data.choices?.[0]?.message?.content || "" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// Ã¢ââ¬Ã¢ââ¬ Qwen (Alibaba DashScope) text generation proxy Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬
app.post("/api/qwen/generate", rateLimit, async (req, res) => {
  try {
    const apiKey = process.env.QWEN_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "QWEN_API_KEY is not set. Get your key at dashscope.aliyuncs.com" });
    const { prompt: directPrompt, type, topic, genre, mood, system = "You are a creative music video director who writes vivid, cinematic content.", model = "qwen-plus", max_tokens = 1024 } = req.body || {};
    let prompt = directPrompt;
    if (!prompt && type) {
      if (type === "lyrics") prompt = `Write original ${genre} ${mood} song lyrics about: "${topic}". Write exactly 12 vivid lines. Return only the lyrics.`;
      else if (type === "scenes") prompt = `Return a JSON array of 8 music video scenes for a ${genre} ${mood} track about "${topic}". Each: {"title":"...","fx":"zoom|cut|flash|fade","duration":4,"prompt":"image generation prompt"}. JSON only.`;
      else if (type === "blueprint") prompt = `Write a concise music production blueprint for a ${genre} ${mood} track about "${topic}". BPM, key, instruments, structure. Under 200 words.`;
    }
    if (!prompt) return res.status(400).json({ error: "prompt is required." });
    const response = await fetch("https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({ model, max_tokens, messages: [{ role: "system", content: system }, { role: "user", content: prompt }] }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || `Qwen error (HTTP ${response.status})` });
    res.json({ text: data.choices?.[0]?.message?.content || "" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// Ã¢ââ¬Ã¢ââ¬ Xiaomi MiMo text generation proxy (HuggingFace Inference API) Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬
app.post("/api/mimo/generate", rateLimit, async (req, res) => {
  try {
    const apiKey = process.env.HF_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "HF_API_KEY is not set. Get your token at huggingface.co/settings/tokens" });
    const { prompt: directPrompt, type, topic, genre, mood, system = "You are a creative music video director.", max_tokens = 512 } = req.body || {};
    let prompt = directPrompt;
    if (!prompt && type) {
      const sys = system + "\n\n";
      if (type === "lyrics") prompt = sys + `Write original ${genre} ${mood} song lyrics about: "${topic}". Write exactly 12 vivid lines. Return only the lyrics.`;
      else if (type === "scenes") prompt = sys + `Return a JSON array of 8 music video scenes for a ${genre} ${mood} track about "${topic}". Each: {"title":"...","fx":"zoom|cut|flash|fade","duration":4,"prompt":"image generation prompt"}. JSON only.`;
      else if (type === "blueprint") prompt = sys + `Write a concise music production blueprint for a ${genre} ${mood} track about "${topic}". BPM, key, instruments, structure. Under 200 words.`;
    }
    if (!prompt) return res.status(400).json({ error: "prompt is required." });
    const response = await fetch("https://api-inference.huggingface.co/models/XiaomiMiMo/MiMo-7B-RL", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: max_tokens, return_full_text: false } }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(response.status).json({ error: data?.error || `MiMo error (HTTP ${response.status})` });
    const text = Array.isArray(data) ? (data[0]?.generated_text || "") : (data?.generated_text || data?.error || "");
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// Ã¢ââ¬Ã¢ââ¬ Start server Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬Ã¢ââ¬


app.listen(port, "0.0.0.0", () => {
  console.log(`\nÃ¢ÅÂ¦ VisioSync Pro running on http://0.0.0.0:${port}`);
  console.log(`  Health: http://localhost:${port}/health`);
  console.log(`  ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? "Ã¢Åâ loaded" : "Ã¢Åâ MISSING"}`);
  console.log(`  XAI_API_KEY:       ${process.env.XAI_API_KEY ? "Ã¢Åâ loaded" : "Ã¢Åâ MISSING"}`);
  console.log(`  OPENAI_API_KEY:    ${process.env.OPENAI_API_KEY ? "Ã¢Åâ loaded" : "- not set (optional)"}`);
  console.log(`  QWEN_API_KEY:      ${process.env.QWEN_API_KEY ? "Ã¢Åâ loaded" : "- not set (optional)"}`);
  console.log(`  HF_API_KEY:        ${process.env.HF_API_KEY ? "Ã¢Åâ loaded" : "- not set (optional)"}\n`);
});
