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

// ââ Security / production headers ââââââââââââââââââââââââââââââââââââââââââ
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// ââ CORS âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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

// ââ Body parsing âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
app.use(express.json({ limit: "25mb" }));

// ââ Naive rate limiter (100 image requests per IP per minute) ââââââââââââââ
const ratemap = new Map();
function rateLimit(req, res, next) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
  const now = Date.now();
  const entry = ratemap.get(ip) || { count: 0, reset: now + 60_000 };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + 60_000; }
  entry.count++;
  ratemap.set(ip, entry);
  if (entry.count > 100) return res.status(429).json({ error: "Too many requests â slow down." });
  next();
}

// ââ Static frontend ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
app.use(express.static(path.join(__dirname, "../public")));

// ââ Health check âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
app.get("/health", (_req, res) => {
  const hasXai = Boolean(process.env.XAI_API_KEY);
  const hasClaude = Boolean(process.env.ANTHROPIC_API_KEY);
  res.json({
    ok: true,
    service: "VisioSync Pro â Medase Unitelle",
    port,
    hasXaiKey: hasXai,
    hasAnthropicKey: hasClaude,
    status: {
      textGeneration: hasClaude ? "â Claude AI ready" : "â Add ANTHROPIC_API_KEY",
      imageGeneration: hasXai ? "â Grok Image ready" : "â Add XAI_API_KEY",
    },
  });
});

// ââ xAI / Grok image generation proxy âââââââââââââââââââââââââââââââââââââ
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
      body: JSON.stringify(body),
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

// ââ Catch-all: serve index.html for any unknown route âââââââââââââââââââââ

// ── xAI Grok video generation ─────────────────────────────────────────────
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
    // Download all clips
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
    // Build ffmpeg concat file
    const concatPath = path.join(tmp, "concat.txt");
    await fs.writeFile(concatPath, clipPaths.map(p => `file '${p}'`).join("\n"));
    const outputPath = path.join(tmp, "output.mp4");
    const hasAudio = audio_data || audio_url;
    if (hasAudio) {
      const audioPath = path.join(tmp, "audio.mp3");
      if (audio_data) {
        // base64 data URI from browser FileReader
        const b64 = audio_data.replace(/^data:audio\/[^;]+;base64,/, "");
        await fs.writeFile(audioPath, Buffer.from(b64, "base64"));
      } else {
        const ar = await fetch(audio_url);
        if (!ar.ok) throw new Error("Failed to download audio.");
        await fs.writeFile(audioPath, Buffer.from(await ar.arrayBuffer()));
      }
      await execFileAsync(ffmpegStatic, [
        "-stream_loop", "-1",          // loop video clips indefinitely
        "-f", "concat", "-safe", "0", "-i", concatPath,
        "-i", audioPath,
        "-map", "0:v", "-map", "1:a",
        "-c:v", "libx264", "-preset", "fast", "-crf", "23",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",                   // stop when audio ends (e.g. 4m30s)
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
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});


// ââ Claude / Anthropic text generation proxy ââââââââââââââââââââââââââââââ
app.post("/api/claude/generate", rateLimit, async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "ANTHROPIC_API_KEY is not set. Add it to your environment variables and redeploy.",
      });
    }

    const {
      prompt,
      system = "You are a creative music video director who writes vivid, cinematic scene descriptions.",
      model = "claude-haiku-4-5-20251001",
      max_tokens = 1024,
    } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "prompt is required and must be a string." });
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

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Server error",
      hint: "Check your Anthropic API key and network connectivity.",
    });
  }
});

// ââ Start server ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
app.listen(port, "0.0.0.0", () => {
  console.log(`\nâ¦ VisioSync Pro running on http://0.0.0.0:${port}`);
  console.log(`  Health: http://localhost:${port}/health`);
  console.log(`  ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? "â loaded" : "â MISSING"}`);
  console.log(`  XAI_API_KEY:       ${process.env.XAI_API_KEY ? "â loaded" : "â MISSING"}\n`);
});
