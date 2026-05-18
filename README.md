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

## AI Lumi Setup (Hybrid Offline & Online Assistant)

Lumi is an AI-powered form and report helper. Lumi does not diagnose, prescribe, or replace medical care.

**Lumi is enabled by default in local help mode.** Local mode is completely free, runs instantly in the browser without any API keys or payment, and uses a rich database of clinical, research, and technical responses.

### Operating Modes:

#### 1. Free Local Mode (Default)
To run the website in the standard, zero-cost mode:
1. **Configure Environment Variables**:
   Copy `.env.example` to `.env` in the project root:
   ```bash
   cp .env.example .env
   ```
   Verify that `VITE_AI_CHAT_ENABLED` is `true` and `VITE_AI_CHAT_USE_API` is `false`.
2. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   No concurrent background server or API credentials are required.

#### 2. Optional OpenAI API Mode
If you wish to enable the advanced OpenAI GPT model response engine later:
1. **Configure API Variables**:
   Open the `.env` file and set the variables:
   - `VITE_AI_CHAT_USE_API`: Set to `true` to enable backend API queries.
   - `OPENAI_API_KEY`: Your OpenAI API key from the OpenAI Platform.
   - `OPENAI_MODEL`: Set to `gpt-4.1-mini` (or your preferred OpenAI model, defaults to `gpt-4.1-mini` if left blank).
   - `VITE_AI_CHAT_ENDPOINT`: Local chat server API endpoint, defaults to `http://localhost:8787/api/beat-assistant`.
2. **Run Full Stack Dev (Concurrently)**:
   Start both the Vite client application and the local Express server simultaneously:
   ```bash
   npm run dev:full
   ```

### Privacy, Billing & Data Safety
- **Billing Notice**: OpenAI API usage in API mode is subject to standard usage limits and may be billed separately depending on your plan. Do not commit your `.env` file.
- **Data Protection**: No sensitive patient data or registration details are sent to OpenAI or Lumi. The frontend filters and sends only the user message, page location, and safe educational queries. The assistant does not store chat logs.

