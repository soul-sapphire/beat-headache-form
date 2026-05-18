import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(express.json());

const SYSTEM_INSTRUCTIONS = `You are "Beat Assistant", a specialized website and form guidance assistant for the Beat Headache portal.

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
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return res.status(503).json({ error: "AI assistant is not configured yet." });
  }

  try {
    const openai = new OpenAI({ apiKey });
    
    // Build context-aware messages list
    const messages = [
      { role: "system", content: SYSTEM_INSTRUCTIONS }
    ];

    // Include page context if provided
    if (pageContext) {
      messages.push({
        role: "system",
        content: `Current page context: ${pageContext}`
      });
    }

    // Include chat history (limited to last 6 messages)
    if (Array.isArray(chatHistory)) {
      const limitedHistory = chatHistory.slice(-6);
      for (const msg of limitedHistory) {
        if (msg.role && msg.content) {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      }
    }

    // Add current user message
    messages.push({ role: "user", content: message });

    const model = process.env.OPENAI_MODEL || "gpt-5.5-mini";

    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
    });

    const assistantReply = response.choices[0]?.message?.content || "No response received.";
    res.json({ reply: assistantReply });

  } catch (error) {
    console.error("OpenAI API error details:", error);
    res.status(500).json({ error: "Failed to communicate with AI model. Please try again later." });
  }
});

app.listen(PORT, () => {
  console.log(`[Beat Headache Server] Listening on http://localhost:${PORT}`);
});
