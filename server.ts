import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Otaku Assistant chat endpoint
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, history = [], mood = "expert" } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message prompt is required" });
      }

      const ai = getGenAI();
      if (!ai) {
        // Fallback smart response if no key is configured
        return res.json({
          reply: `Kon'nichiwa! 🌸 (Offline Mode) Based on your interest in "${message}", I recommend checking out top classics like **Solo Leveling**, **Frieren: Beyond Journey's End**, and **Jujutsu Kaisen**. Add your Gemini API key in Settings > Secrets for personalized real-time AI otaku guidance!`,
          sources: ["AniVerse Knowledge Base"],
        });
      }

      const systemPrompt = `You are "Kitsune-sensei" / "Senpai AI", an ultra-knowledgeable, friendly, and enthusiastic anime & manga expert and otaku mentor on the AniVerse platform.
You know all genres (Shounen, Seinen, Isekai, Romance, Psychological, Slice of Life, Mecha, Dark Fantasy), studios (MAPPA, Ufotable, Kyoto Animation, Madhouse, Wit), voice actors (Seiyuu), directors, manga adaptations, light novels, and anime culture.
Your persona is engaging, respectful, informative, and formatted with clean Markdown, bullet points, and anime emojis (⚡, 🌸, 🗡️, 🍙, 🔮, ⭐).
When answering:
1. Provide accurate anime/manga details, genres, release years, and why it fits what the user asked.
2. If comparing power levels (e.g. Gojo vs Sukuna, Goku vs Saitama), give fair analytical breakdown with fun feats!
3. If giving recommendations, give 2-4 solid recommendations with titles, hype factor (1-10/10), key themes, and episode count.
4. Support English, Hindi/Urdu (roman), and Japanese terminology naturally.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: [
          { text: `System: ${systemPrompt}` },
          ...history.map((h: { role: string; content: string }) => ({
            text: `${h.role === "user" ? "User" : "Otaku AI"}: ${h.content}`,
          })),
          { text: `User query: ${message}` },
        ],
        config: {
          temperature: 0.7,
        },
      });

      res.json({
        reply: response.text || "Gomen ne! I could not formulate a response. Try asking about a specific anime!",
      });
    } catch (error: any) {
      console.error("Gemini Chat API Error:", error);
      res.status(500).json({
        error: "Failed to generate anime response",
        details: error?.message || String(error),
      });
    }
  });

  // Smart Recommendation Generator Endpoint
  app.post("/api/gemini/recommend", async (req, res) => {
    try {
      const { favoriteAnime, desiredMood, preferredGenres, pacing } = req.body;
      const ai = getGenAI();

      if (!ai) {
        return res.json({
          recommendations: [
            {
              title: "Frieren: Beyond Journey's End (Sousou no Frieren)",
              score: "9.3/10",
              reason: "Masterpiece fantasy with deep emotional storytelling and phenomenal animation by Madhouse.",
              vibe: "Contemplative, Epic Magic, Wholesome",
              episodes: 28,
            },
            {
              title: "Solo Leveling (Ore dake Level Up na Ken)",
              score: "8.8/10",
              reason: "High-octane action, thrilling dungeon raids, and incredible shadow monarch power progression.",
              vibe: "Hype, Action-Packed, OP Protagonist",
              episodes: 12,
            },
            {
              title: "Jujutsu Kaisen",
              score: "8.9/10",
              reason: "World-class choreography, dark supernatural powers, and unmatched Shibuya arc intensity.",
              vibe: "Dark Fantasy, Martial Arts, Modern Supernatural",
              episodes: 47,
            },
          ],
        });
      }

      const prompt = `Based on the user's anime preferences:
- Favorite Anime: ${favoriteAnime || "Any top tier anime"}
- Desired Mood: ${desiredMood || "Exciting and engaging"}
- Preferred Genres: ${(preferredGenres || []).join(", ") || "Action/Adventure/Fantasy"}
- Pacing: ${pacing || "Balanced"}

Return a JSON array of 3 top tailored anime recommendations. Each object in the array must strictly have:
- title (string): Japanese & English title
- score (string): e.g. "9.2/10"
- reason (string): 2-3 sentences explaining why it matches their taste specifically
- vibe (string): 3-4 comma separated tags
- episodes (number or string): episode count

Respond ONLY in valid JSON format.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      let parsed = [];
      try {
        parsed = JSON.parse(response.text || "[]");
      } catch (e) {
        console.warn("Failed to parse json:", response.text);
      }

      res.json({ recommendations: parsed });
    } catch (err: any) {
      console.error("Gemini Recommend API Error:", err);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AniVerse Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
});
