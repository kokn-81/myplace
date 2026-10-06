import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(express.json());

app.get("/c/:slug", async (req, res) => {
  const apiBase = process.env.VITE_API_BASE_URL || "http://localhost:8010/api";
  const origin = apiBase.replace(/\/api\/?$/, "");
  try {
    const response = await fetch(`${origin}/c/${encodeURIComponent(req.params.slug)}`);
    const html = await response.text();
    res.status(response.status);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.send(html);
  } catch {
    res.status(502).send("No pude abrir esa consulta.");
  }
});

app.get(["/ona", "/api/ona-og"], (req, res) => {
  const ua = req.headers["user-agent"] || "";
  const isBot = /facebookexternalhit|whatsapp|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|applebot|curl|wget|bingbot|googlebot/i.test(
    ua
  );

  const title = "ONA Residences · Preventa en Los Cusis";
  const desc =
    "Departamentos de 1 y 2 dormitorios en Los Cusis desde USD 40.375. Arquitectura contemporánea y alta rentabilidad. Reserva con USD 2.000.";
  const img = "https://nia-web.com/ona/og-ona.jpg";
  const targetUrl = "/?proyecto=ona";

  if (!isBot && req.path === "/ona") {
    res.redirect(307, targetUrl);
    return;
  }

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${desc}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="ONA Residences · N.I.A" />
  <meta property="og:url" content="https://nia-web.com/?proyecto=ona" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${img}" />
  <meta property="og:image:secure_url" content="${img}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="ONA Residences en Los Cusis" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${img}" />
  <meta http-equiv="refresh" content="0; url=${targetUrl}" />
</head>
<body style="background:#0d0d0d;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <p>Cargando ONA Residences...</p>
  <script>window.location.replace("${targetUrl}");</script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

// API Routes
app.post("/api/ask-gemini", async (req, res) => {
  try {
    const { message, properties } = req.body;
    
    const prompt = `You are a helpful real estate assistant.
The user is looking for a property. Using the following data about currently available properties, answer their question.
Offer them the best match from the data provided. Answer concisely and professionally in Spanish, do not use bullet points or long prose. Start by recommending the best option based on their needs.
Properties available data (JSON format):
${JSON.stringify(properties || [])}

User question: ${message}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "No pude comunicarme con el asistente." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode: Use Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve static files built by Vite
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
