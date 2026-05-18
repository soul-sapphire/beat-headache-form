# Beat Headache New Patient Form

A professional child headache intake form with forward-reflection logic, clinical criteria mapping, and automated report generation.

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## Features

- **Forward Reflection**: Smart logic that populates later clinical fields based on initial patient responses.
- **Patient Summary Report**: Simple, jargon-free PDF for patients/parents.
- **Doctor Clinical Report**: Detailed ICHD-3 criteria reflections and clinical phenotype tables for doctors.
- **FRESSH Lifestyle Scoring**: Automated lifestyle assessment (Food, Relaxation, Exercise, Sleep, Screen time, Hydration).

## AI Beat Assistant Setup

This portal includes a secure, local-first AI assistant called **Beat Assistant** that guides parents through the intake form, explains FRESSH lifestyle criteria, red flags, aura symptoms generally, and breaks down report metrics. It follows strict safety boundaries: it does not diagnose, prescribe, recommend medicine, or replace clinical consultation.

### Local Development Setup:

1. **Configure Environment Variables**:
   Copy `.env.example` to `.env` in the project root:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and fill in:
   - `OPENAI_API_KEY`: Your OpenAI secret key.
   - `OPENAI_MODEL`: Set to `gpt-5.5-mini` (or your preferred OpenAI model, defaults to `gpt-5.5-mini` if left blank).
   - `VITE_AI_CHAT_ENABLED`: Set to `true` to display the floating chatbot widget on the site.
   - `VITE_AI_CHAT_ENDPOINT`: Local chat server API endpoint, defaults to `http://localhost:8787/api/beat-assistant`.

2. **Run Full Stack Dev (Concurrently)**:
   Start both the Vite client application and the local Express server simultaneously:
   ```bash
   npm run dev:full
   ```
   This will host:
   - Frontend: `http://localhost:5173/`
   - Express AI Server: `http://localhost:8787/`

### Privacy & Data Safety
No sensitive patient data or registration details are sent to OpenAI. The frontend filters and sends only the user message, page location, and safe educational queries. The assistant does not store chat logs.

