import express from "express";
import path from "path";
import https from "https";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json());

  // 1. Youdao TTS Reverse Proxy Route (CORS enabled & AudioContext friendly!)
  app.get("/api/tts", (req, res) => {
    const audioText = req.query.audio;
    const type = req.query.type || "2"; // 1 for UK, 2 for US

    if (!audioText) {
      res.status(400).json({ error: "Missing parameter: audio" });
      return;
    }

    const cleanedText = String(audioText).replace(/[\/\$]/g, " ").trim();
    const youdaoUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanedText)}&type=${type}`;

    https.get(youdaoUrl, (proxyRes) => {
      // Set headers for smooth browser AudioContext decoding & volume scaling
      res.setHeader("Content-Type", proxyRes.headers["content-type"] || "audio/mpeg");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache permanently for speed

      proxyRes.pipe(res);
    }).on("error", (err) => {
      console.error("Youdao TTS Proxy error:", err);
      res.status(500).json({ error: "Proxy connection failed" });
    });
  });

  // 2. Vite Integration / Static Routing
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
