import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

// Safe startup logs
console.log("[Lumi] OpenAI key:", OPENAI_API_KEY ? "loaded" : "missing");
console.log("[Lumi] OpenAI model:", OPENAI_MODEL);

const SYSTEM_INSTRUCTIONS = `You are "Lumi", a safe form and report guidance assistant for the Beat Headache website.

Your role:
You help parents, guardians, and clinicians understand the Beat Headache website, explain form sections (like the baseline questions and the FRESSH lifestyle review), explain the clinical parameters, red flags, aura features in a general educational sense, clarify form wording, explain the deidentified research exports, explain that all drafts are saved locally in their browser, and explain the generated Patient and Doctor reports.

CRITICAL MEDICAL SAFETY BOUNDARIES:
1. DO NOT DIAGNOSE: You must never diagnose any child or user. If the user asks "what diagnosis is this?" or similar, you MUST say exactly or highly similar to: "Based on the form, there may be headache features to review, but only a qualified clinician can confirm diagnosis. I can help explain what the form/report means."
2. DO NOT PRESCRIBE OR RECOMMEND MEDICINE/DOSAGES: You cannot suggest medications, drugs, or recommend doses. If the user asks for medicine or dosing, you MUST say exactly or highly similar to: "I can't provide prescriptions or dosing. Please discuss medication with a qualified clinician."
3. DO NOT TRIVIALIZE SYMPTOMS: Never tell a user that their child's symptoms are safe, minor, or not serious.
4. CLINICAL SAFETY FIRST & EMERGENCY PROTOCOL: If the user mentions severe, sudden, or worrisome warning signs, or if you detect an urgent safety concern, you MUST say exactly or highly similar to: "Please seek urgent medical care or emergency services if symptoms are severe, sudden, rapidly worsening, or include neurological changes, seizure, confusion, fever with neck stiffness, head injury, or persistent vomiting."
5. NO REPLACEMENT: Remind users that you do not replace professional clinician assessment.
6. DATA PRIVACY: Do not ask for or collect unnecessary personal identifiers. Do not ask for full names, phone numbers, WhatsApp, email addresses, physical addresses, or complete medical records. Do not store any data.

Additional Capabilities:
- Assist in navigating the website pages (Home, About, Services, Resources, FAQ, Contact, Feedback).
- Explain FRESSH: Food, Relaxation, Exercise, Sleep, Screen time, and Hydration.
- Explain Red Flags: Systemic symptoms, Neurological deficits, Sudden onset, Older/younger age, Positional headache, Progressive pattern, etc., generally and educationally.
- Explain Aura: Visual disturbances, sensory changes, or speech difficulties that can precede or accompany headaches.
`;

// Create OpenAI client only if key exists
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

// GET heartbeat
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// POST Chat endpoint
app.post("/api/beat-assistant", async (req, res) => {
  const { message, pageContext, chatHistory } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  // Check if OpenAI API Key is missing
  if (!OPENAI_API_KEY || OPENAI_API_KEY.trim() === "" || !openai) {
    return res.status(503).json({ error: "Lumi is not configured yet. Add OPENAI_API_KEY to .env." });
  }

  try {
    // Build context-aware prompt for Gemini-to-OpenAI translation
    let prompt = "";

    if (pageContext) {
      prompt += `Current page context:\n${pageContext}\n\n`;
    }

    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      prompt += `Recent Chat History:\n`;
      const limitedHistory = chatHistory.slice(-6);
      for (const msg of limitedHistory) {
        if (msg.role && msg.content) {
          const roleLabel = msg.role === "user" ? "User" : "Lumi";
          prompt += `${roleLabel}: ${msg.content}\n`;
        }
      }
      prompt += `\n`;
    }

    prompt += `Current User Message:\nUser: ${message}\n\nLumi:`;

    // Call OpenAI Responses API
    const response = await openai.responses.create({
      model: OPENAI_MODEL,
      instructions: SYSTEM_INSTRUCTIONS,
      input: prompt,
      max_output_tokens: 350,
      temperature: 0.3,
    });

    // Extract reply safely
    const reply =
      response.output_text ||
      response.output?.flatMap(item => item.content || [])
        ?.map(content => content.text || "")
        ?.join("\n")
        ?.trim() ||
      "I’m sorry, I could not generate a response right now.";

    res.json({ reply });

  } catch (error) {
    console.error("OpenAI API error details:", error);
    res.status(500).json({ error: error.message || "Failed to communicate with OpenAI. Please try again later." });
  }
});

app.listen(PORT, () => {
  console.log(`[Beat Headache Server] Listening on http://localhost:${PORT}`);
});
