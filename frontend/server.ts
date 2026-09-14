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
