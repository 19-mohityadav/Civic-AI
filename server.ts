import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Gemini Initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.post("/api/analyze-issue", async (req, res) => {
  try {
    const { file, mimeType, textDescription } = req.body;
    
    // We need at least some media or description to analyze
    if (!file && !textDescription) {
      return res.status(400).json({ error: "Please provide a description or upload a file (image, video, or audio)" });
    }

    const contents: any[] = [];

    // 1. Add inline media if provided
    if (file && mimeType) {
      // Clean base64 string
      const base64Data = file.includes(",") ? file.split(",")[1] : file;
      contents.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      });
    }

    // 2. Build the detailed analyzer prompt
    let textPrompt = `Analyze this civic / municipal issue submission.
` + (textDescription ? `Additional text description provided by user: "${textDescription}"\n` : "") + `
Determine:
1. isCivicIssue: boolean. Is this a legitimate, real civic/municipal/community issue? Examples include potholes, broken streetlights, water leakage/broken pipes, drainage/clogs, garbage accumulation, public safety hazards, broken footpaths, etc. If the media or description is completely unrelated to municipal issues (like a personal selfie, inside of a private apartment, pets, unrelated random text, commercial advertisements, or empty/black inputs), set isCivicIssue to false.
2. category: Must be one of 'POTHOLE', 'STREETLIGHT', 'GARBAGE', 'WATER_LEAK', 'DRAINAGE', or 'OTHER'.
3. severity: Must be one of 'LOW', 'MEDIUM', 'HIGH', or 'CRITICAL'.
4. title: A concise, human-friendly title for the issue (e.g. "Clogged Sewer Intake on Pine St").
5. description: A clear, helpful summary of what the issue is, incorporating any user-provided description.
6. isUrgent: boolean. Is this an immediate danger or high-priority safety hazard?`;

    contents.push({ text: textPrompt });

    // Use gemini-3.5-flash for fast and robust analysis of multimodal inputs
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCivicIssue: { type: Type.BOOLEAN },
            category: { type: Type.STRING },
            severity: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            isUrgent: { type: Type.BOOLEAN },
          },
          required: ["isCivicIssue", "category", "severity", "title", "description", "isUrgent"],
        },
      },
    });

    res.json(JSON.parse(response.text));
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to analyze submission" });
  }
});

// Vite middleware for development
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Civic AI Server running on http://localhost:${PORT}`);
  });
}

setupServer();
