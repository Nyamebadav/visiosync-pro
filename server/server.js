import express from "express";
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
