# RideHub Gemini AI Integration

RideHub features a production-grade, secure Gemini 2.5 AI backend integration for multimodal damage detection, AI pricing insights, and live platform assistance.

## Features Overview

1. **Secure Express AI Server (`/server`)**:
   - Backend acts as a security gateway (`GEMINI_API_KEY` never reaches the browser).
   - Vite dev proxy routes `/api/*` seamlessly to `http://localhost:5000`.
   - Uses official `@google/genai` SDK with `gemini-2.5-flash` model.
   - Strict Zod schema validation & Pino logging (never logs raw base64 images or keys).
   - `AI_MODE=mock` fallback returns realistic fixtures in 1-2s when no key is set. Shows a "Demo mode" badge in the UI.

2. **Damage Detection & Comparison Flow**:
   - **Pickup Inspection (`/rides/:id/inspect/pickup`)**:
     - Step-by-step guided camera capture (Front, Rear, Left, Right, Dashboard, Closeup).
     - Vehicle type silhouette overlay (Scooty, Bike, Car) & client-side blur/dark detection.
     - Canvas preprocessing (max 1600px resize, EXIF location stripping).
     - Bounding box rendering using Gemini's normalized 0-1000 scale `[ymin, xmin, ymax, xmax]`. Findings below confidence threshold (0.6) marked as "Possible".
     - Dual sign-off: both Customer and Shopkeeper tap "I agree" to freeze the baseline.
   - **Return Inspection (`/rides/:id/inspect/return`)**:
     - Side-by-side interactive comparison slider matching pickup vs return photos.
     - Isolates NEW damage from pre-existing baseline.
     - Indicative repair range in INR (₹) with legal transparency disclaimer.
   - **Human-in-the-Loop Review (`/dashboard/inspections/:id`)**:
     - Shopkeeper accepts/adjusts/dismisses findings and proposes deposit deduction.
     - Money is NEVER automatically deducted by AI.
     - Customer can accept or dispute with custom comments.

3. **Shopkeeper AI Dynamic Pricing (`/api/ai/insights`)**:
   - Database numbers computed strictly in server code; Gemini generates plain-language insights.
   - Never invents figures. Annotated with "Sample data" and "Demo mode" badges.

4. **RideHub AI Assistant (`/api/ai/assist`)**:
   - Floating chat drawer with SSE streaming replies.
   - Refuses unrelated topics, provides cancellation refund tiers (100% / 50% / 0%), HubX trial info, and points rules.

---

## Environment Setup

Create a `.env` file in the root directory:

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
AI_MODE=mock # 'live' or 'mock'
ALLOWED_ORIGIN=http://localhost:5173
MAX_IMAGES=6
MAX_IMAGE_MB=5
DAMAGE_CONFIDENCE_MIN=0.6
```

---

## Running the Application

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Backend Server**:
   ```bash
   npx tsx server/index.ts
   ```

3. **Start Frontend Dev Server**:
   ```bash
   npm run dev
   ```

4. **Test Endpoints & Web App**:
   - Web App: `http://localhost:5173`
   - Health Check: `http://localhost:5000/api/health`

---

## Data Privacy & Security Note
Please review Google's Gemini API data-use terms for the selected tier (Free tier vs Paid tier). Confidential personal data and raw identity documents are never passed to damage endpoints.
