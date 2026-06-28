# VisioSync Pro — Deploy to www.medaseunitelle.com

## Folder structure
```
visiosync_deploy/
├── public/
│   └── index.html        ← the entire React frontend (single file)
├── server/
│   ├── server.js         ← Express proxy server
│   ├── package.json
│   └── .env.example      ← copy to .env and add your xAI key
├── railway.toml          ← Railway config
└── render.yaml           ← Render config
```

---

## Option A — Railway (recommended, free tier)

1. Go to https://railway.app and sign up/login with GitHub
2. Click **New Project → Deploy from GitHub repo**
   - Upload this folder to a new GitHub repo first (or use Railway CLI)
3. In Railway project settings → **Variables** → add:
   ```
   XAI_API_KEY = your_xai_key_here
   ```
4. Railway auto-detects `railway.toml` and deploys
5. Once live, go to **Settings → Networking → Custom Domain** and add:
   ```
   www.medaseunitelle.com
   ```
6. Copy the CNAME record Railway gives you and add it in your domain registrar's DNS settings

**Cost:** Free for low traffic (500 hours/month free). ~$5/month if you need always-on.

---

## Option B — Render (also free tier)

1. Go to https://render.com → sign up with GitHub
2. New → Web Service → connect your repo
3. Render reads `render.yaml` automatically
4. Add `XAI_API_KEY` in the Environment tab
5. Under **Custom Domains** → add `www.medaseunitelle.com`
6. Add the CNAME Railway provides to your DNS

---

## Option C — Run locally (test first)

```bash
cd server
cp .env.example .env
# Edit .env and add your real XAI_API_KEY
npm install
npm start
# Open http://localhost:8787
```

---

## Domain DNS setup (applies to any host)

In your domain registrar (wherever you registered medaseunitelle.com), add:

| Type  | Name | Value                          |
|-------|------|-------------------------------|
| CNAME | www  | your-app.railway.app (or render.com equivalent) |

It takes 5–30 minutes to propagate.

---

## Getting your xAI / Grok API key

1. Go to https://console.x.ai/
2. Sign in with your X (Twitter) account
3. Create a new API key
4. Paste it as `XAI_API_KEY` in your hosting environment variables

**Keep this key secret** — it stays on the server, never in the browser.
