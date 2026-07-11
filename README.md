# 🏟️ PitchPilot — AI-Powered Stadium Operations Platform

> **FIFA World Cup 2026 · MetLife Stadium · Smart Fan & Ops Assistant**

PitchPilot is a GenAI-powered platform that optimizes stadium operations and enhances the fan experience for the FIFA World Cup 2026 through intelligent, real-time, context-aware assistance.

---

## Chosen Vertical

**Stadium Operations & Context-Aware Fan Experience**

PitchPilot addresses two critical stakeholder needs at FIFA World Cup 2026 venues:

1. **Fans** receive personalized, context-aware recommendations — including shortest food/restroom queues, crowd alerts, navigation assistance, and accessibility support — all driven by their role, location, and the current match phase.

2. **Stadium Staff** get a real-time operations dashboard showing crowd density per zone, venue wait times, prioritized incident logs, and intelligent staff assignment suggestions — enabling proactive crowd management and rapid incident response.

---

## Approach and Logic

### Deterministic Engine Architecture

PitchPilot's core intelligence lives in a set of **pure, deterministic functions** inside `lib/engine/`, completely decoupled from the UI:

| Engine | Responsibility |
|--------|---------------|
| `contextDecisionEngine.ts` | Takes a `UserProfile` + `StadiumState` + `Date` → outputs prioritized `ContextRecommendation[]` based on role, zone, match phase, and accessibility needs |
| `crowdAnalyticsEngine.ts` | Calculates zone density levels, identifies bottlenecks, computes total occupancy, and predicts crowd flow |
| `waitTimeEngine.ts` | Estimates queue wait times using service-rate modeling, finds shortest queues with zone preference |
| `incidentEngine.ts` | Prioritizes incidents by severity/recency, assigns nearest available staff with zone-aware response times |

**Why this matters:**
- All business logic is **unit-testable** with 70 passing tests
- Zero coupling to React — engines can be reused server-side, in workers, or in a mobile app
- Every recommendation is **explainable** and **reproducible** given the same inputs

### Zod Validation Pipeline

Every data boundary is validated:

```
User Input → chatRequestSchema (Zod) → Server Route
LLM Response → llmResponseSchema (Zod) → Client Rendering
Stadium Data → stadiumApiResponseSchema (Zod) → API Response
```

This prevents malformed LLM outputs, injection attacks, and type inconsistencies from ever reaching the UI.

---

## How the Solution Works

| Prompt Requirement | Feature Implementation |
|---|---|
| "GenAI-powered solution / dynamic assistant" | Real-time chat interface (`ChatPanel.tsx`) connecting to Google Gemini via server-side API route (`/api/chat`) |
| "Logical decision making based on user context" | `contextDecisionEngine.ts` — pure function producing personalized recommendations based on role, zone, match phase, and accessibility |
| "Optimize stadium operations" | `OpsDashboard.tsx` — traditional GUI showing crowd density, wait times, incident logs, and zone status grid |
| "Practical and real-world usability" | Mobile-responsive design, quick action buttons, 30s auto-refresh, keyboard navigation, ARIA compliance |
| "Clean and maintainable code" | Strict TypeScript (zero `any`), micro-components (<200 lines), extracted constants, Zod schemas, 70 unit tests |

---

## Any Assumptions Made

1. **IoT Sensor Data is Simulated**: Real crowd density and wait time data would come from IoT sensors, turnstile counters, and POS systems. PitchPilot uses deterministic mock data generators (`lib/data/`) that produce realistic, phase-aware values. The architecture is ready to swap in real data sources.

2. **Single Venue (MetLife Stadium)**: The system is modeled on MetLife Stadium (East Rutherford, NJ) with its 88,966 capacity and 9 zones. The zone-based architecture generalizes to any stadium by updating `lib/utils/constants.ts`.

3. **Google Gemini API Availability**: The chat feature requires a valid `GOOGLE_GENERATIVE_AI_API_KEY`. If unavailable, PitchPilot gracefully falls back to engine-generated responses using the deterministic context engine — the app remains fully functional without the LLM.

---

## Architecture Diagram

```mermaid
graph TD
    subgraph Client ["Client (Browser)"]
        A["Fan / Staff User"] --> B["Role & Zone Selector"]
        B --> C["Chat Interface"]
        B --> D["Ops Dashboard"]
        B --> E["Fan Experience Hub"]
    end

    subgraph Server ["Next.js Server (app/api/)"]
        C -->|POST /api/chat| F["Chat Route Handler"]
        D -->|GET /api/stadium| G["Stadium Data Route"]
        F --> H["Zod Input Validation"]
        H --> I["Google Gemini SDK"]
        I --> J["Zod Output Validation"]
        J --> F
    end

    subgraph Engine ["lib/engine/ (Pure Functions)"]
        K["contextDecisionEngine"]
        L["crowdAnalyticsEngine"]
        M["incidentEngine"]
        N["waitTimeEngine"]
    end

    subgraph Data ["lib/data/ (Mock IoT)"]
        O["mockStadiumData"]
        P["mockIncidents"]
    end

    B --> K
    K -->|Personalized Recs| C
    K -->|Personalized Recs| E
    G --> L
    G --> N
    G --> O
    D --> P
    D --> M
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode, zero `any`) |
| Styling | Tailwind CSS v4 |
| AI | Google Gemini 2.0 Flash |
| Validation | Zod v4 |
| Testing | Vitest |
| Deployment | Vercel |

---

## Run Instructions

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Clone the repository
git clone https://github.com/SuBhAm6G/PitchPilot.git
cd PitchPilot/smart-stadium

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
# Add your GOOGLE_GENERATIVE_AI_API_KEY to .env.local
```

### Development

```bash
# Start dev server
npm run dev

# Open in browser
# http://localhost:3000
```

### Testing

```bash
# Run all 70 unit tests
npm run test

# Watch mode
npm run test:watch
```

### Type Checking

```bash
npx tsc --noEmit
```

### Production Build

```bash
npm run build
npm start
```

### Vercel Deployment

```bash
npx vercel --prod
```

---

## Project Structure

```
smart-stadium/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Gemini chat endpoint (server-only)
│   │   └── stadium/route.ts       # Stadium data endpoint
│   ├── globals.css                # Tailwind v4 + custom styles
│   ├── layout.tsx                 # Root layout with SEO metadata
│   └── page.tsx                   # Main app orchestrator
├── components/
│   ├── chat/                      # Chat UI (Panel, Message, Input)
│   ├── dashboard/                 # Ops Dashboard (Overview, Density, WaitTime, Incidents, Zones)
│   ├── fan/                       # Fan Hub (Recommendations, WaitTime, QuickActions)
│   ├── layout/                    # Header, Sidebar
│   └── ui/                        # Shared (Card, Badge, ProgressBar, Spinner)
├── lib/
│   ├── engine/                    # Pure business logic (zero side effects)
│   │   ├── contextDecisionEngine.ts
│   │   ├── crowdAnalyticsEngine.ts
│   │   ├── waitTimeEngine.ts
│   │   └── incidentEngine.ts
│   ├── data/                      # Mock IoT data generators
│   ├── utils/constants.ts         # All magic numbers & config
│   ├── types.ts                   # Strict TypeScript interfaces
│   └── schemas.ts                 # Zod validation schemas
├── __tests__/                     # 70 unit tests (Vitest)
├── vitest.config.ts
└── .env.local                     # Server-side secrets (gitignored)
```

---

## License

Built for the FIFA World Cup 2026 Hackathon Challenge 4: Smart Stadiums & Tournament Operations.
